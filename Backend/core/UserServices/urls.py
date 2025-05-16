from django.urls import path
from .Controllers import authController

urlpatterns = [
    path('login/',authController.LoginAPIView.as_view(),name='login' ),
]