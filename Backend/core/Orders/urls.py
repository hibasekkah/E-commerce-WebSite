from django.urls import path
# Make sure to import the new view
from .views import  OrderListCreateAPIView, OrderRetrieveAPIView, ShippingMethodListView,AdminOrderDetailAPIView

urlpatterns = [
    # path('orders/', OrderListCreateAPIView.as_view(), name='order-list-create'),
    # path('orders/<int:pk>/', OrderRetrieveAPIView.as_view(), name='order-detail'),
    
    # Add the new path for shipping methods
    path('shipping-methods/', ShippingMethodListView.as_view(), name='shipping-method-list'),
    path('', OrderListCreateAPIView.as_view(), name='order-list-create'),
    
    # This path handles retrieving a single order by its ID
    path('<int:pk>/', OrderRetrieveAPIView.as_view(), name='order-detail'),
    path('admin/orders/<int:pk>/', AdminOrderDetailAPIView.as_view(), name='admin-order-detail'),


]