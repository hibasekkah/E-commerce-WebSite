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
from .countries import COUNTRY_NAME_TO_CODE_MAP # Import our lookup dictionary

class CountryNameField(serializers.Field):
    """
    A custom serializer field to handle country name <-> code translation.
    - On input (from frontend), it accepts a full name like "Morocco" and
      converts it to the 2-letter code "MA" for the database.
    - On output (to frontend), it takes the code "MA" from the database and
      represents it as the full name "Morocco".
    """
    def to_representation(self, value):
        """
        Converts the database code (e.g., country object with code 'MA')
        to the full name string ("Morocco") for the API response.
        """
        # 'value' here is the Country object provided by CountryField.
        # We just need its full name.
        return value.name

    def to_internal_value(self, data):
        """
        Converts the incoming full name string ("Morocco") to the database
        code ("MA"). This is where validation happens.
        """
        # Make the lookup case-insensitive and remove whitespace
        lookup_name = str(data).lower().strip()
        
        # Look up the code in our mapping dictionary
        code = COUNTRY_NAME_TO_CODE_MAP.get(lookup_name)
        
        if code:
            # Return the valid 2-letter code
            return code
        else:
            # If the name is not found, raise a validation error.
            raise serializers.ValidationError(f"'{data}' is not a valid or supported country name.")


class AddressSerializer(serializers.ModelSerializer):
    """
    The main serializer for the Address model.
    It now uses our custom CountryNameField for translation.
    """
    # --- THIS IS THE CHANGE ---
    # We replace the default 'country' field with our new custom field.
    # The `source` argument is important. It tells the custom field to get its
    # initial data from the 'country' attribute of the model instance.
    country = CountryNameField(source='*')
    # --- END OF CHANGE ---

    class Meta:
        model = UserShippingAddress
        fields = [
            'id', 
            'address', 
            'city', 
            'state', 
            'postal_code', 
            'country' # This field is now our smart translator
        ]
    
    # We add a 'country' field to the create method to handle our custom field
    def create(self, validated_data):
        # The 'country' key in validated_data now holds the 2-letter code.
        # We can directly pass it to the model's create method.
        return UserShippingAddress.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # The same applies for updates.
        instance.country = validated_data.get('country', instance.country)
        # ... update other fields ...
        instance.save()
        return instance


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