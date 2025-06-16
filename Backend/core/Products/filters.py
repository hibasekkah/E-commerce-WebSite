import django_filters
from .models import Product, Category

class ProductFilter(django_filters.FilterSet):
    """
    A comprehensive FilterSet for the Product model.
    It now expects to receive a pre-annotated queryset from the view.
    """
    # --- Filter Definitions ---
    category = django_filters.NumberFilter(method='filter_by_category')
    
    # We rename the filter to match the annotation field for consistency
    active_discount_rate = django_filters.BooleanFilter(
        method='filter_by_active_promotion',
        label="Filter by whether the product has a currently active promotion."
    )
    
    name = django_filters.CharFilter(field_name='name', lookup_expr='icontains')

    class Meta:
        model = Product
        fields = ['status']

    # We no longer need the @property def qs override.

    # --- Custom Filter Methods ---
    def filter_by_category(self, queryset, name, value):
        # This method remains the same
        try:
            category = Category.objects.get(pk=value)
            category_ids = category.get_descendant_ids()
            return queryset.filter(category_id__in=category_ids)
        except Category.DoesNotExist:
            return queryset.none()

    def filter_by_active_promotion(self, queryset, name, value):
        """
        This method now works because the 'active_discount_rate' field
        was already added to the queryset by the view.
        """
        if value is True:
            # Return products where the annotation is NOT null.
            return queryset.filter(active_discount_rate__isnull=False)
        else: # value is False
            # Return products where the annotation IS null.
            return queryset.filter(active_discount_rate__isnull=True)