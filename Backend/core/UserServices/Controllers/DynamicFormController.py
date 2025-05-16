from core.Helpers import getDynamicModels,getDynamicFormFields
from rest_framework.views import APIView
from rest_framework.response import Response
from django.apps import apps

class DynamicFormController(APIView):
    def get(self,request,modelName):
        if modelName not in getDynamicModels():
            return Response({'error':'Model not found'}, status=404)
        model = getDynamicModels()[modelName]
        model_class = apps.get_model(model)

        if model_class is None:
            return Response({'error':'Model not found'}, status=404)

        model_instance = model_class()
        fields = getDynamicFormFields(model_class,request.user.domain_user_id)
        return Response({'data':fields,'message':'form fields fetched successfuly'})
