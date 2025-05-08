from django.contrib import admin
from .models import Product, Order, OrderItem

class OrderItemInLine(admin.TabularInline):
    model = OrderItem
    extra = 1
    readonly_fields = ('price_at_time_of_order', 'total_item_price')

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit_price')
    search_fields = ('name',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_number', 'creation_date', 'status', 'total_products_count', 'total_final_price')
    list_filter = ('status', 'creation_date')
    search_fields = ('order_number',)
    inlines = [OrderItemInLine] 
    readonly_fields = ('creation_date', 'order_number', 'total_products_count', 'total_final_price')

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('order', 'product', 'quantity', 'price_at_time_of_order', 'total_item_price')
    readonly_fields = ('price_at_time_of_order', 'total_item_price')
    list_select_related = ('order', 'product')

