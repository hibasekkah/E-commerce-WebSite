from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import UserSerialiser
from rest_framework.response import Response

# Create your views here.
class registerView(APIView):
    def post(self,request):
        serializer = UserSerialiser(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
    

