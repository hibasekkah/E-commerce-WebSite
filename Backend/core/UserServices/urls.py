from django.urls import path
from .Controllers import authController

urlpatterns = [
    path('login/',authController.LoginAPIView.as_view(),name='login' ),
    path('signup/',authController.SignupAPIView.as_view(),name='signup'),
    path('publicApi/',authController.PublicAPIView.as_view(),name='publicapi'),
    path('protectedApi/',authController.ProtectedAPIView.as_view(),name='protectedapi'),
]