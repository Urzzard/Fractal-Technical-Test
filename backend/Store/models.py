from django.db import models
from django.utils import timezone
import uuid

def product_image_path(instance, filename):
    ext = filename.split('.')[-1]
    new_filename = f"{uuid.uuid4()}.{ext}"
    return f'products_images/{new_filename}'

class Product(models.Model):
    name = models.CharField(max_length=255, unique=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to=product_image_path, null=True, blank=True)

    def __str__(self):
        return self.name
    

class Order(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('InProgress', 'In Progress'),
        ('Completed', 'Completed'),
    ]

    order_number = models.CharField(max_length=50, unique=True, blank=True, editable=False)
    creation_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    total_final_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, editable=False)
    total_products_count = models.PositiveIntegerField(default=0, editable=False)


    def __str__(self):
        return f"Order {self.order_number or self.id} - {self.status}"

    def save(self, *args, **kwargs):

        if not self.pk:
            super().save(*args, **kwargs) 

            #PARA GENERAR NUMERO O SERIE DE ORDEN
            self.order_number = f"ORD-{self.id:05d}"
            Order.objects.filter(pk=self.pk).update(order_number=self.order_number)
            return 

        super().save(*args, **kwargs)

    def update_totals(self):
        order_items = self.items.all()
        new_total_price = sum(item.total_item_price for item in order_items if item.total_item_price is not None)
        new_products_count = sum(item.quantity for item in order_items)

        Order.objects.filter(pk=self.pk).update(
            total_final_price=new_total_price,
            total_products_count=new_products_count
        )

        self.refresh_from_db(fields=['total_final_price', 'total_products_count'])

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items', on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    price_at_time_of_order = models.DecimalField(max_digits=10, decimal_places=2, editable=False)

    def __str__(self):
        return f"{self.quantity} of {self.product.name} for Order {self.order.id}"

    @property
    def total_item_price(self):
        if self.price_at_time_of_order is not None and self.quantity is not None:
            return self.quantity * self.price_at_time_of_order
        return 0

    def save(self, *args, **kwargs):
        if not self.pk or not self.price_at_time_of_order:
            if self.product:
                self.price_at_time_of_order = self.product.unit_price
        super().save(*args, **kwargs)