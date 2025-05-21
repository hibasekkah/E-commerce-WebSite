from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import UserSerializer,LoginSerializer
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


# Create your views here.
class registerView(APIView):
    def post(self,request):
        serializer = UserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        refresh = RefreshToken.for_user(user)
        print("Login success for:", user.email)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'role': user.role
        })
    

