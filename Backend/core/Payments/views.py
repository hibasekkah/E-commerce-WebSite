import paypalrestsdk
import requests
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
# stripe.api_key = settings.STRIPE_SECRET_KEY


from django.db import transaction

import paypalrestsdk
from django.conf import settings
# ... other imports

# Configure PayPal SDK at the top of the file
class CreatePayPalOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_paypal_access_token(self):
        url = f"https://api.{settings.PAYPAL_MODE}.paypal.com/v1/oauth2/token"
        auth = (settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET)
        headers = {
            "Accept": "application/json",
            "Accept-Language": "en_US",
        }
        data = {'grant_type': 'client_credentials'}
        response = requests.post(url, headers=headers, data=data, auth=auth)
        if response.status_code != 200:
            raise Exception("Failed to get PayPal access token: " + response.text)
        return response.json()['access_token']

    def post(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        try:
            order = Order.objects.get(id=order_id, user=request.user, status=OrderStatus.PENDING)
        except Order.DoesNotExist:
            return Response({"error": "Order not found or not in a payable state."}, status=status.HTTP_404_NOT_FOUND)

        # Create internal Payment record
        payment, created = Payment.objects.get_or_create(
            user=request.user,
            amount=order.order_total,
            defaults={
                'currency': 'USD',
                'gateway': Payment.Gateway.PAYPAL,
                'status': Payment.Status.PENDING
            }
        )
        order.payment = payment
        order.save()

        try:
            access_token = self.get_paypal_access_token()
            url = f"https://api.{settings.PAYPAL_MODE}.paypal.com/v2/checkout/orders"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
            payload = {
                "intent": "CAPTURE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "USD",
                        "value": str(order.order_total)
                    },
                    "description": f"Payment for Order #{order.id}"
                }]
            }
            response = requests.post(url, headers=headers, json=payload)

            if response.status_code in (201, 200):
                paypal_order = response.json()
                payment.external_payment_id = paypal_order['id']
                payment.save()
                return Response({"orderID": paypal_order['id']}, status=status.HTTP_201_CREATED)
            else:
                payment.status = Payment.Status.FAILED
                payment.save()
                return Response({"error": f"PayPal order creation failed: {response.text}"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            payment.status = Payment.Status.FAILED
            payment.save()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CapturePayPalOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get_paypal_access_token(self):
        url = f"https://api.{settings.PAYPAL_MODE}.paypal.com/v1/oauth2/token"
        auth = (settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET)
        headers = {
            "Accept": "application/json",
            "Accept-Language": "en_US",
        }
        data = {'grant_type': 'client_credentials'}
        response = requests.post(url, headers=headers, data=data, auth=auth)
        if response.status_code != 200:
            raise Exception("Failed to get PayPal access token: " + response.text)
        return response.json()['access_token']

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        paypal_order_id = request.data.get('orderID')
        if not paypal_order_id:
            return Response({"error": "PayPal Order ID is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = Payment.objects.get(external_payment_id=paypal_order_id, user=request.user)
        except Payment.DoesNotExist:
            return Response({"error": "Payment record not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            access_token = self.get_paypal_access_token()
            url = f"https://api.{settings.PAYPAL_MODE}.paypal.com/v2/checkout/orders/{paypal_order_id}/capture"
            headers = {
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            }
            response = requests.post(url, headers=headers)

            if response.status_code in (201, 200):
                capture_response = response.json()
                capture_data = capture_response['purchase_units'][0]['payments']['captures'][0]

                # --- PAYMENT SUCCESS ---
                payment.status = Payment.Status.COMPLETED
                payment.save()

                # Log transaction
                Transaction.objects.create(
                    payment=payment,
                    event_type='paypal.capture.completed',
                    amount=payment.amount,
                    external_transaction_id=capture_data['id'],
                    response_data=capture_response
                )

                # Update order status if linked
                if hasattr(payment, 'order') and payment.order:
                    payment.order.status = OrderStatus.PROCESSING
                    payment.order.save()

                return Response({"status": "success", "message": "Payment captured successfully."}, status=status.HTTP_200_OK)

            else:
                payment.status = Payment.Status.FAILED
                payment.save()
                return Response({"error": f"PayPal capture failed: {response.text}"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            payment.status = Payment.Status.FAILED
            payment.save()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

