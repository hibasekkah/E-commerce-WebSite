from django_filters import rest_framework as filters
from .models import Product, Category

class ProductFilter(filters.FilterSet):
    """
    FilterSet for the Product model.
    Allows filtering by category, including subcategories.
    """
    # Define a filter named 'category'. The 'method' argument points to our custom logic.
    category = filters.NumberFilter(method='filter_by_category')

    class Meta:
        model = Product
        # You can add other fields you want to filter by directly
        fields = ['status', 'name']

    def filter_by_category(self, queryset, name, value):
        """
        Custom filter method to include products from a category AND all its subcategories.
        - queryset: The initial queryset (all Products).
        - name: The name of the filter field ('category').
        - value: The category ID from the URL (e.g., '5').
        """
        try:
            # Find the requested category
            category = Category.objects.get(pk=value)
        except Category.DoesNotExist:
            # If the category doesn't exist, return an empty list
            return queryset.none()

        # Get a list of IDs for the category and all its descendants.
        # This is a recursive lookup and requires a helper method on the Category model.
        category_ids = category.get_descendant_ids()

        # Filter the product queryset to include any product whose category ID
        # is in our list of descendant IDs.
        return queryset.filter(category_id__in=category_ids)