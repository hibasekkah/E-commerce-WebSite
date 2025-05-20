from rest_framework import serializers
from .models import User
import requests
from django.conf import settings
from captcha.fields import ReCaptchaField



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