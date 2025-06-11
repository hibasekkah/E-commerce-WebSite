from rest_framework import serializers
from .models import User
import requests
from django.conf import settings
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    # recaptcha = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password',
            'phone', 'role', 'dob','gender'
        ]
        extra_kwargs = {
            'password':{'write_only':True},
            'role':{'read_only':True},
        }
    # def validate_recaptcha(self, value):
    #     """
    #     Validates the Google reCAPTCHA token sent from frontend.
    #     """
    #     response = requests.post(
    #         'https://www.google.com/recaptcha/api/siteverify',
    #         data={
    #             'secret': settings.RECAPTCHA_PRIVATE_KEY,
    #             'response': value
    #         }
    #     )
    #     result = response.json()
    #     if not result.get("success"):
    #         raise serializers.ValidationError("Invalid reCAPTCHA. Please try again.")
    #     return value
    def create(self, validated_data):
            password = validated_data.pop('password',None)
            instance = self.Meta.model(**validated_data)
            instance.role = 'Customer'
            if password is not None:
                instance.set_password(password)
            instance.save()
            return instance 
    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    # recaptcha = serializers.CharField(write_only=True)

    # def validate_recaptcha(self, value):
    #     response = requests.post(
    #         'https://www.google.com/recaptcha/api/siteverify',
    #         data={
    #             'secret': settings.RECAPTCHA_PRIVATE_KEY,
    #             'response': value
    #         }
    #     )
    #     result = response.json()
    #     if not result.get("success"):
    #         raise serializers.ValidationError("Invalid reCAPTCHA. Please try again.")
    #     return value

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid email/password combination.")
        data['user'] = user
        return data 

class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user information excluding password and email
    """
    class Meta:
        model = User
        fields = [
            'username', 'phone', 'gender', 'dob'
        ]
        extra_kwargs = {
            'username': {'required': False},
            'phone': {'required': False},
            'gender': {'required': False},
            'dob': {'required': False},
        }
    

class PasswordUpdateSerializer(serializers.Serializer):
    """
    Serializer for updating user password
    """
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        """
        Validate that the current password is correct
        """
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        """
        Validate new password strength
        """
        # You can add custom password validation here
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        # Check if password contains at least one digit
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        
        # Check if password contains at least one letter
        if not any(char.isalpha() for char in value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        
        return value

    def validate(self, data):
        """
        Validate that new password and confirm password match
        """
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New password and confirm password do not match.")
        
        # Check that new password is different from current password
        user = self.context['request'].user
        if user.check_password(data['new_password']):
            raise serializers.ValidationError("New password must be different from current password.")
        
        return data

    def save(self, **kwargs):
        """
        Update the user's password
        """
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
    
from rest_framework import serializers
from .models import UserShippingAddress

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserShippingAddress
        fields = ['id', 'street_address', 'city', 'state', 'postal_code', 'country']


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing complete user profile (read-only for sensitive fields)
    """
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone', 'gender', 
            'account_status', 'role', 'dob', 'currency', 
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'email', 'account_status', 'role', 
            'created_at', 'updated_at'
        ]