from datetime import timezone
from .filters import ProductFilter


# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions,viewsets
from .serializers import CategoryListSerializer, CategorySerializer, ProductItemSerializer, ProductItemStockAdjustSerializer, ProductItemUpdateSerializer, ProductItemWriteSerializer,  VariationOptionSerializer, VariationSerializer

from rest_framework import status
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

from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction
from .models import Product, ProductItem, ProductImage
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateSerializer,
    ProductUpdateSerializer,
    ProductDeleteSerializer,
    ProductBulkStatusUpdateSerializer,
    ProductImageBulkSerializer,
    ProductImageCreateUpdateSerializer
)


class ProductListView(APIView):
    """List all products or create a new product with image support"""
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        # Start with the base queryset
        queryset = Product.objects.filter(deleted_at__isnull=True).select_related('category')
        
        # Instantiate the filterset with the request's query parameters and the initial queryset
        filterset = ProductFilter(request.query_params, queryset=queryset)
        
        # 'filterset.qs' is the final, filtered queryset
        filtered_queryset = filterset.qs
        
        # You can add pagination here later if needed
        
        serializer = ProductListSerializer(filtered_queryset, many=True, context={'request': request})
        
        return Response({
            'success': True,
            'count': filtered_queryset.count(),
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


class ProductItemViewSet(viewsets.ModelViewSet):
    """
    A complete ViewSet for listing, retrieving, creating, updating,
    and deleting ProductItems. Handles both JSON and multipart/form-data.
    """
    queryset = ProductItem.objects.filter(deleted_at__isnull=True).prefetch_related(
        'images', 'productconfiguration_set__variation_option__variation'
    )
    # Add parsers to handle form data for file uploads
    parser_classes = [MultiPartParser, FormParser] 

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductItemWriteSerializer
        return ProductItemSerializer

    def perform_create(self, serializer):
        """
        Overrides the default create method to handle multipart data correctly.
        """
        # We manually build the data dictionary to pass to the serializer.
        # This ensures getlist() is used for images.
        data_for_serializer = {
            'product': self.request.data.get('product'),
            'price': self.request.data.get('price'),
            'stock_quantity': self.request.data.get('stock_quantity'),
            'sku': self.request.data.get('sku'),
            'display_order': self.request.data.get('display_order', 0),
            'status': self.request.data.get('status', 'ACTIVE'),
            'configurations': self.request.data.get('configurations', '[]'), # Send as string
            'images': self.request.FILES.getlist('images')
        }
        # Re-initialize the serializer with the structured data
        serializer = self.get_serializer(data=data_for_serializer)
        serializer.is_valid(raise_exception=True)
        serializer.save()

    def perform_destroy(self, instance):
        """
        Overrides the default hard-delete to perform a soft-delete.
        This is now corrected to use Django's timezone utility.
        """
        # This now works because 'timezone' is imported from django.utils
        instance.deleted_at = timezone.now()
        instance.status = 'INACTIVE'
        
        # It's good practice to specify which fields are being updated
        # for a minor performance improvement and clarity.
        instance.save(update_fields=['deleted_at', 'status', 'updated_at'])

        
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
    

from rest_framework import generics
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
    

class ProductItemStockAdjustView(APIView):
    """
    A dedicated endpoint to ADJUST the stock quantity for a single ProductItem.
    Accepts POST requests at /api/items/{pk}/adjust-stock/
    """
    # permission_classes = [IsAdminUser] # Recommended for security

    def post(self, request, pk):
        """
        Handles adjusting the stock quantity.
        """
        try:
            # We use select_for_update() to lock the row during the transaction,
            # preventing race conditions if two adjustments happen at the same time.
            item = ProductItem.objects.select_for_update().get(pk=pk, deleted_at__isnull=True)
        except ProductItem.DoesNotExist:
            return Response({"error": "Product Item not found."}, status=status.HTTP_404_NOT_FOUND)

        # Use our specialized serializer. Note that we still pass the `instance`.
        serializer = ProductItemStockAdjustSerializer(instance=item, data=request.data)
        
        if serializer.is_valid():
            # The serializer's .update() method contains all our logic.
            updated_item = serializer.save()
            # Return the full item data using the read-only serializer for confirmation.
            return Response(ProductItemSerializer(updated_item).data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)