from datetime import timezone
from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions,viewsets
from .serializers import CategoryListSerializer, CategorySerializer, ProductItemSerializer, ProductItemUpdateSerializer,  VariationOptionSerializer, VariationSerializer

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
    queryset = Variation.objects.prefetch_related('variationoption_set').all()
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

# Enhanced Product Views with Image Handling

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db import transaction
from .models import Product, ProductItem, ProductImage
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
    ProductUpdateSerializer,
    ProductDeleteSerializer,
    ProductItemCreateSerializer,
    ProductBulkStatusUpdateSerializer,
    ProductImageBulkSerializer,
    ProductImageCreateUpdateSerializer
)


class ProductListView(APIView):
    """List all products or create a new product with image support"""
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        products = Product.objects.filter(deleted_at__isnull=True)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response({
            'success': True,
            'count': len(serializer.data),
            'results': serializer.data
        })

    def post(self, request):
        # Parse the request data
        data = request.data.copy()
        
        serializer = ProductCreateSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            product = serializer.save()
            return Response(
                ProductDetailSerializer(product, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailView(APIView):
    """Retrieve, update or delete a product instance with image support"""
    parser_classes = [MultiPartParser, FormParser, JSONParser]

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

        # if not request.user.is_staff:
        #     return Response(
        #         {'error': 'Only admin users can update products'},
        #         status=status.HTTP_403_FORBIDDEN
        #     )

        serializer = ProductUpdateSerializer(product, data=request.data, context={'request': request})
        if serializer.is_valid():
            product = serializer.save()
            return Response(ProductDetailSerializer(product, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, pk):
        product = self.get_object(pk)
        if not product: return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Use the simple ProductUpdateSerializer that only updates product fields
        serializer = ProductUpdateSerializer(product, data=request.data, partial=True)
        if serializer.is_valid(raise_exception=True):
            product = serializer.save()
            return Response(ProductDetailSerializer(product).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        product = self.get_object(pk)
        if not product:
            return Response(
                {'error': 'Product not found or already deleted'},
                status=status.HTTP_404_NOT_FOUND
            )

        # if not request.user.is_staff:
        #     return Response(
        #         {'error': 'Only admin users can delete products'},
        #         status=status.HTTP_403_FORBIDDEN
        #     )

        delete_serializer = ProductDeleteSerializer(data=request.data)
        if not delete_serializer.is_valid():
            return Response(delete_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        delete_serializer.save(product)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class ProductItemDetailView(APIView):
    """API endpoint to retrieve, update, and delete a single ProductItem."""
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self, pk):
        try:
            return ProductItem.objects.get(pk=pk, deleted_at__isnull=True)
        except ProductItem.DoesNotExist:
            return None

    def get(self, request, pk):
        item = self.get_object(pk)
        if not item: 
            return Response({"error": "Product Item not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = ProductItemSerializer(item) # Assuming you have a read-serializer
        return Response(serializer.data)

    def put(self, request, pk):
        item = self.get_object(pk)
        if not item: 
            return Response({"error": "Product Item not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # FIX: Pass request.data directly to the serializer.
        # ListField is smart enough to handle a QueryDict from form data correctly.
        # No manual data preparation is needed.
        serializer = ProductItemUpdateSerializer(item, data=request.data, partial=True)
        
        # The raise_exception=True will handle invalid data and return a 400 response automatically.
        serializer.is_valid(raise_exception=True)
        item = serializer.save()
        
        # Return the updated object using your read-serializer for consistency.
        return Response(ProductItemSerializer(item).data)
    
    def delete(self, request, pk):
        item = self.get_object(pk)
        if not item: 
            return Response({"error": "Product Item not found"}, status=status.HTTP_404_NOT_FOUND)
        
        item.deleted_at = timezone.now()
        item.status = 'INACTIVE'
        item.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductItemCreateView(APIView):
    """
    API endpoint dedicated to creating a new ProductItem.
    Listens for POST requests at its configured URL.
    """
    # These parsers are required to handle `multipart/form-data` from Postman.
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, *args, **kwargs):
        """
        Handles the POST request to create a ProductItem.
        """
        # This is the CRITICAL step that fixes previous issues.
        # We build a clean Python dictionary, making sure to use .getlist()
        # for fields that can have multiple values.
        data_for_serializer = {
            'product': request.data.get('product'),
            'price': request.data.get('price'),
            'stock_quantity': request.data.get('stock_quantity'),
            'sku': request.data.get('sku'),
            'display_order': request.data.get('display_order'),
            'status': request.data.get('status', 'ACTIVE'), # Default to ACTIVE
            'configurations': request.POST.getlist('configurations'),
            'images': request.FILES.getlist('images')
        }

        # 1. Use the "write" serializer to process the incoming data.
        serializer = ProductItemCreateSerializer(data=data_for_serializer)
        
        # 2. If the data is invalid, this will automatically return a 400 error.
        if serializer.is_valid(raise_exception=True):
            # 3. If valid, .save() calls our custom .create() method in the serializer.
            product_item = serializer.save()
            
            # 4. On success, use the "read" serializer to format a detailed JSON response.
            # (ProductItemSerializer should be your serializer for GET requests)
            response_serializer = ProductItemSerializer(product_item)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
class ProductImageView(APIView):
    """Handle product item images"""
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def post(self, request, item_id):
        """Add images to a product item"""
        try:
            product_item = ProductItem.objects.get(pk=item_id, deleted_at__isnull=True)
        except ProductItem.DoesNotExist:
            return Response(
                {'error': 'Product item not found or deleted'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Handle multiple image upload
        images = request.FILES.getlist('images')
        if not images:
            return Response(
                {'error': 'No images provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_images = []
        try:
            with transaction.atomic():
                for i, image_file in enumerate(images):
                    image_data = {
                        'image': image_file,
                        'alt_text': request.data.get('alt_text', f"Image for {product_item}"),
                        'display_order': request.data.get('display_order', i),
                        'is_primary': request.data.get('is_primary', i == 0)
                    }
                    
                    serializer = ProductImageCreateUpdateSerializer(data=image_data)
                    if serializer.is_valid():
                        image = serializer.save(product=product_item)
                        created_images.append(image)
                    else:
                        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({
                'success': True,
                'message': f'Successfully uploaded {len(created_images)} images',
                'images': ProductImageCreateUpdateSerializer(created_images, many=True).data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'error': f'Error uploading images: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request, item_id, image_id):
        """Update a specific image"""
        try:
            product_item = ProductItem.objects.get(pk=item_id, deleted_at__isnull=True)
            image = ProductImage.objects.get(pk=image_id, product=product_item)
        except (ProductItem.DoesNotExist, ProductImage.DoesNotExist):
            return Response(
                {'error': 'Product item or image not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = ProductImageCreateUpdateSerializer(image, data=request.data, partial=True)
        if serializer.is_valid():
            image = serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, item_id, image_id):
        """Delete a specific image"""
        try:
            product_item = ProductItem.objects.get(pk=item_id, deleted_at__isnull=True)
            image = ProductImage.objects.get(pk=image_id, product=product_item)
        except (ProductItem.DoesNotExist, ProductImage.DoesNotExist):
            return Response(
                {'error': 'Product item or image not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        image.delete()
        return Response({'message': 'success'},status=status.HTTP_204_NO_CONTENT)
    
    def get(self, request, item_id):
        """Get all images for a product item"""
        try:
            product_item = ProductItem.objects.get(pk=item_id, deleted_at__isnull=True)
        except ProductItem.DoesNotExist:
            return Response(
                {'error': 'Product item not found or deleted'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        images = product_item.images.all()
        serializer = ProductImageCreateUpdateSerializer(images, many=True)
        return Response({
            'success': True,
            'count': len(serializer.data),
            'images': serializer.data
        })


class ProductImageBulkView(APIView):
    """Handle bulk image operations"""
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    
    def post(self, request):
        """Bulk upload images to a product item"""
        serializer = ProductImageBulkSerializer(data=request.data)
        if serializer.is_valid():
            created_images = serializer.save()
            return Response({
                'success': True,
                'message': f'Successfully created {len(created_images)} images',
                'images': ProductImageCreateUpdateSerializer(created_images, many=True).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProductBulkStatusView(APIView):

    """Bulk update product statuses"""
    # permission_classes = [IsAuthenticated, IsAdminUser]

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
    

from rest_framework import generics, status
from rest_framework.response import Response
from .models import Promotion
from .serializers import PromotionSerializer, PromotionCreateUpdateSerializer

class PromotionListCreateAPIView(generics.ListCreateAPIView):
    """
    API endpoint for listing all promotions or creating a new one.
    - GET: Returns a list of all active promotions with their products.
    - POST: Creates a new promotion.
    """
    # Prefetch related products to avoid N+1 query issues on list view
    queryset = Promotion.objects.filter(is_active=True).prefetch_related('products__product')

    def get_serializer_class(self):
        """
        Use PromotionCreateUpdateSerializer for POST requests (creating),
        and PromotionSerializer for GET requests (listing).
        """
        if self.request.method == 'POST':
            return PromotionCreateUpdateSerializer
        return PromotionSerializer

class PromotionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, or deleting a single promotion.
    - GET: Retrieve a single promotion's details.
    - PUT/PATCH: Update a promotion.
    - DELETE: Delete a promotion.
    """
    queryset = Promotion.objects.all().prefetch_related('products__product')
    
    def get_serializer_class(self):
        """
        Use PromotionCreateUpdateSerializer for updates (PUT/PATCH),
        and PromotionSerializer for retrieval (GET).
        """
        if self.request.method in ['PUT', 'PATCH']:
            return PromotionCreateUpdateSerializer
        return PromotionSerializer