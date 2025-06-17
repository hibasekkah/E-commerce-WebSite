
import stripe
from django.conf import settings
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Payment, Transaction
from Orders.models import Order, OrderStatus # Import from your orders app

# Configure Stripe with your secret key at the top of the file
stripe.api_key = settings.STRIPE_SECRET_KEY

class CreatePaymentIntentAPIView(APIView):
    """
    Creates a Stripe Payment Intent for a given order.
    This is the first step in the payment process.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({"error": "Order ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Ensure the order exists, belongs to the user, and is in a payable state
            order = Order.objects.get(id=order_id, user=request.user, status=OrderStatus.PENDING)
        except Order.DoesNotExist:
            return Response({"error": "Order not found or cannot be paid for."}, status=status.HTTP_404_NOT_FOUND)

        # Create or retrieve our internal Payment record, linking it to the Order
        payment, created = Payment.objects.get_or_create(
            user=request.user,
            amount=order.order_total,
            defaults={
                'currency': 'mad', # Or your store's currency from settings
                'gateway': Payment.Gateway.STRIPE,
                'status': Payment.Status.PENDING,
                'description': f"Payment for Order #{order.id}"
            }
        )
        
        # This is a critical step: link the payment to the order
        if not order.payment:
            order.payment = payment
            order.save(update_fields=['payment'])

        try:
            # Create a Payment Intent with Stripe's API
            intent = stripe.PaymentIntent.create(
                amount=int(order.order_total * 100),  # Stripe expects amount in the smallest currency unit (cents for USD, centimes for MAD)
                currency='mad',
                automatic_payment_methods={'enabled': True},
                metadata={'order_id': order.id, 'payment_id': payment.id} # Link to our records
            )
            
            # Save Stripe's unique ID to our Payment record
            payment.external_payment_id = intent.id
            payment.save(update_fields=['external_payment_id'])
            
            # Send the secret key back to the frontend to complete the payment
            return Response({'clientSecret': intent.client_secret}, status=status.HTTP_201_CREATED)

        except Exception as e:
            # If the call to Stripe fails, mark our payment as failed and report the error
            payment.status = Payment.Status.FAILED
            payment.save()
            return Response({"error": f"Stripe API error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StripeWebhookAPIView(APIView):
    """
    Listens for events from Stripe. This endpoint must be public but secure.
    Stripe will send notifications here after a payment is attempted.
    """
    permission_classes = [AllowAny] # Must be public for Stripe to access

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
        
        try:
            # Verify the event is genuinely from Stripe
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except (ValueError, stripe.error.SignatureVerificationError) as e:
            # Invalid payload or signature
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Extract the event data
        event_type = event['type']
        intent = event['data']['object']
        
        # Get our internal payment ID from the metadata we sent to Stripe
        payment_id = intent.get('metadata', {}).get('payment_id')
        if not payment_id:
            # Or log an error: we received a webhook for a payment we don't know about
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            return Response({"error": "Payment record not found."}, status=status.HTTP_404_NOT_FOUND)

        # Handle the specific event type
        if event_type == 'payment_intent.succeeded':
            # --- PAYMENT SUCCESS ---
            payment.status = Payment.Status.COMPLETED
            payment.save()
            
            # Create a success transaction log for auditing
            Transaction.objects.create(
                payment=payment, 
                event_type='charge.succeeded', 
                amount=payment.amount,
                response_data=intent # Store the full Stripe response
            )
            
            # **CRITICAL STEP**: Update the associated Order status to "Processing"
            if hasattr(payment, 'order'):
                payment.order.status = OrderStatus.PROCESSING
                payment.order.save(update_fields=['status'])

        elif event_type == 'payment_intent.payment_failed':
            # --- PAYMENT FAILURE ---
            payment.status = Payment.Status.FAILED
            payment.save()
            
            # Create a failure transaction log
            error_message = intent.get('last_payment_error', {}).get('message', 'Unknown error.')
            Transaction.objects.create(
                payment=payment, 
                event_type='charge.failed',
                amount=payment.amount,
                message=error_message,
                response_data=intent
            )
            
            # Update the associated Order status to "Failed"
            if hasattr(payment, 'order'):
                payment.order.status = OrderStatus.FAILED
                payment.order.save(update_fields=['status'])
        
        # Add handlers for other events like 'charge.refunded' here...

        # Acknowledge receipt of the event to Stripe
        return Response(status=status.HTTP_200_OK)