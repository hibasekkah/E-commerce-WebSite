from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import UserSerializer,LoginSerializer, UserUpdateSerializer,PasswordUpdateSerializer,UserProfileSerializer
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import (
    RetrieveUpdateAPIView, 
    ListCreateAPIView, 
    RetrieveUpdateDestroyAPIView
)
from rest_framework import status


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
            'role': user.role,
            'username': user.username, 
            'email':user.email, 
            'phone':user.phone,
            'dob':user.dob,
            'gender':user.gender
        })
    
class UserProfileView(RetrieveUpdateAPIView):
    """
    View for users to view and update their own profile
    GET: Retrieve user profile
    PUT/PATCH: Update user profile (excluding password and email)
    """
    serializer_class = UserProfileSerializer
    def get_object(self):
        return self.request.user

    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserProfileSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        
        if serializer.is_valid():
            serializer.save()
            # Return updated profile data
            profile_serializer = UserProfileSerializer(instance)
            return Response({
                'message': 'Profile updated successfully',
                'user': profile_serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordUpdateView(APIView):
    """
    View for users to update their password
    """
    def post(self, request):
        serializer = PasswordUpdateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Password updated successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


