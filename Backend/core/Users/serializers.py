from rest_framework import serializers
from .models import User
class UserSerialiser(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password',
            'phone', 'address', 'city', 'state', 'pincode',
            'country', 'profile_pic', 'role', 'dob'
        ]
        extra_kwargs = {
            'password':{'write_only':True},
            'role':{'read_only':True},
        }
        
    def create(self, validated_data):
            password = validated_data.pop('password',None)
            instance = self.Meta.model(**validated_data)
            instance.role = 'Customer'
            if password is not None:
                instance.set_password(password)
            instance.save()
            return instance    