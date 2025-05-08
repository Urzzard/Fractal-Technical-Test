from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import OrderItem, Order

@receiver(post_save, sender=OrderItem)
def update_order_totals_on_save(sender, instance, created, **kwargs):
    if instance.order:
        instance.order.update_totals()

@receiver(post_delete, sender=OrderItem)
def update_order_totals_on_delete(sender, instance, **kwargs):

    if instance.order:
        instance.order.update_totals()