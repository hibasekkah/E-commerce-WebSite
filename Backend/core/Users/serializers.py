from rest_framework import serializers
from .models import User
import requests
from django.conf import settings
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    recaptcha = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password',
            'phone', 'role', 'dob','gender','recaptcha'
        ]
        extra_kwargs = {
            'password':{'write_only':True},
            'role':{'read_only':True},
        }
    def validate_recaptcha(self, value):
        """
        Validates the Google reCAPTCHA token sent from frontend.
        """
        response = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={
                'secret': settings.RECAPTCHA_PRIVATE_KEY,
                'response': value
            }
        )
        result = response.json()
        if not result.get("success"):
            raise serializers.ValidationError("Invalid reCAPTCHA. Please try again.")
        return value
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
    recaptcha = serializers.CharField(write_only=True)

    def validate_recaptcha(self, value):
        response = requests.post(
            'https://www.google.com/recaptcha/api/siteverify',
            data={
                'secret': settings.RECAPTCHA_PRIVATE_KEY,
                'response': value
            }
        )
        result = response.json()
        if not result.get("success"):
            raise serializers.ValidationError("Invalid reCAPTCHA. Please try again.")
        return value

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid email/password combination.")
        data['user'] = user
        return data   