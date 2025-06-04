from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions,viewsets
from .serializers import CategoryListSerializer, CategorySerializer,  VariationOptionSerializer, VariationSerializer

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from .models import Category, CategoryImage, Variation, VariationOption



class CategoryCreateView(APIView):
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def post(self, request):
        try:
            with transaction.atomic():
                # Create category
                serializer = CategorySerializer(data=request.data)
                if serializer.is_valid():
                    category = serializer.save()
                    
                    # Handle image uploads if present
                    images = request.FILES.getlist('images')
                    if images:
                        for i, image_file in enumerate(images):
                            CategoryImage.objects.create(
                                category=category,
                                image=image_file,
                                alt_text=request.data.get('alt_text', f"Image for {category.name}"),
                                is_primary=(i == 0),  # First image is primary
                                display_order=i
                            )
                    
                    # Return success response with category data
                    response_serializer = CategorySerializer(category)
                    return Response({
                        "message": "Category created successfully", 
                        "id": category.id,
                        "data": response_serializer.data
                    }, status=status.HTTP_201_CREATED)
                
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                "message": "Error creating category",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class CategorylistView(APIView):
    def get(self,request):
        categories = Category.objects.all()
        serializer = CategoryListSerializer(categories, many=True)
        return Response({
                'success': True,
                'results': serializer.data
            }, status=status.HTTP_200_OK)

class VariationViewSet(viewsets.ModelViewSet):
    queryset = Variation.objects.all()
    serializer_class = VariationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset


class VariationOptionViewSet(viewsets.ModelViewSet):
    queryset = VariationOption.objects.all()
    serializer_class = VariationOptionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        variation_id = self.request.query_params.get('variation')
        if variation_id:
            queryset = queryset.filter(variation_id=variation_id)
        return queryset


# Products/views.py

from rest_framework import viewsets
from .models import Product, ProductItem, ProductImage
from .serializers import ProductSerializer, ProductItemSerializer, ProductImageSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class ProductItemViewSet(viewsets.ModelViewSet):
    queryset = ProductItem.objects.all()
    serializer_class = ProductItemSerializer


class ProductImageViewSet(viewsets.ModelViewSet):
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer

            

        
