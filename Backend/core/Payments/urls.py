from django.urls import path
from .views import (
    CreatePaymentIntentAPIView, 
    StripeWebhookAPIView,
    CreatePayPalOrderAPIView, # <-- Add this
    CapturePayPalOrderAPIView # <-- And this
)
app_name = 'Payments'

urlpatterns = [
    # Stripe URLs
    path('create-stripe-intent/', CreatePaymentIntentAPIView.as_view(), name='create-stripe-intent'),
    path('webhooks/stripe/', StripeWebhookAPIView.as_view(), name='stripe-webhook'),

    # PayPal URLs
    path('create-paypal-order/', CreatePayPalOrderAPIView.as_view(), name='create-paypal-order'),
    path('capture-paypal-order/', CapturePayPalOrderAPIView.as_view(), name='capture-paypal-order'),
]