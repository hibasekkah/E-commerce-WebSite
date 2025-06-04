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

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction
from .models import Product, ProductItem
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
    ProductUpdateSerializer,
    ProductDeleteSerializer,
    ProductItemCreateSerializer,
    ProductItemUpdateSerializer,
    ProductBulkStatusUpdateSerializer
)

class ProductListView(APIView):
    """List all products or create a new product"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = Product.objects.filter(deleted_at__isnull=True)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response({
            'success': True,
            'count': len(serializer.data),
            'results': serializer.data
        })

    def post(self, request):
        if not request.user.is_staff:
            return Response(
                {'error': 'Only admin users can create products'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProductCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            product = serializer.save()
            return Response(
                ProductDetailSerializer(product, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailView(APIView):
    """Retrieve, update or delete a product instance"""
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Product.objects.get(pk=pk, deleted_at__isnull=True)
        except Product.DoesNotExist:
            return None

    def get(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response(
                {'error': 'Product not found or has been deleted'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProductDetailSerializer(product, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response(
                {'error': 'Product not found or has been deleted'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not request.user.is_staff:
            return Response(
                {'error': 'Only admin users can update products'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProductUpdateSerializer(product, data=request.data, context={'request': request})
        if serializer.is_valid():
            product = serializer.save()
            return Response(ProductDetailSerializer(product, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response(
                {'error': 'Product not found or already deleted'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not request.user.is_staff:
            return Response(
                {'error': 'Only admin users can delete products'},
                status=status.HTTP_403_FORBIDDEN
            )

        delete_serializer = ProductDeleteSerializer(data=request.data)
        if not delete_serializer.is_valid():
            return Response(delete_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        delete_serializer.save(product)
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProductItemView(APIView):
    """Create or update product items"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = ProductItemCreateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            product_item = serializer.save()
            return Response(
                ProductItemCreateSerializer(product_item, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, item_id):
        try:
            product_item = ProductItem.objects.get(pk=item_id, deleted_at__isnull=True)
        except ProductItem.DoesNotExist:
            return Response(
                {'error': 'Product item not found or deleted'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProductItemUpdateSerializer(product_item, data=request.data, context={'request': request})
        if serializer.is_valid():
            product_item = serializer.save()
            return Response(
                ProductItemUpdateSerializer(product_item, context={'request': request}).data
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductBulkStatusView(APIView):
    """Bulk update product statuses"""
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        serializer = ProductBulkStatusUpdateSerializer(data=request.data)
        if serializer.is_valid():
            product_ids = serializer.save()
            return Response({
                'success': True,
                'message': f'Updated status for {len(product_ids)} products',
                'product_ids': product_ids
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            

        
