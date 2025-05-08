from rest_framework import serializers
from .models import Product, Order, OrderItem

class ProductSerializer(serializers.ModelSerializer):
    # PARA LA URL
    image_url = serializers.ImageField(source='image', read_only=True, use_url=True) 
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'unit_price', 'image', 'image_url']

class OrderItemSerializer(serializers.ModelSerializer):

    product_name = serializers.CharField(source='product.name', read_only=True)
    unit_price_at_order = serializers.DecimalField(source='price_at_time_of_order', max_digits=10, decimal_places=2, read_only=True)
    item_total = serializers.DecimalField(source='total_item_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price_at_order', 'item_total']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True) 
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'creation_date',
            'status',
            'status_display',
            'total_products_count',
            'total_final_price',
            'items',
        ]
        read_only_fields = [
            'order_number',
            'creation_date',
            'total_products_count',
            'total_final_price',
        ]
