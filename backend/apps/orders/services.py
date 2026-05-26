from .models import Order, OrderItem, Payment
from ..tables.models import Table
from django.db import transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal

def create_order(table, items, order_type=Order.OrderType.DINE_IN):
    with transaction.atomic():
        if order_type == Order.OrderType.DINE_IN:
            if table.status != Table.Status.RESERVED: 
                raise ValueError("The table is not reserved")
        
        order = Order.objects.create(
            table=table,
            order_type=order_type,
            total_amount=0
        )
        total_amount = 0
        order_items = []

        for item in items:
            menu_item = item["menu_item"]
            quantity = item["quantity"]
            price_at_moment = Decimal(menu_item.price)
            total_price = price_at_moment * quantity
            total_amount += total_price

            order_items.append(
                OrderItem(
                    order=order,
                    menu_item=menu_item,
                    quantity=quantity,
                    price_at_moment=price_at_moment,
                    total_price=total_price
                )
            )

        OrderItem.objects.bulk_create(order_items)
        order.total_amount = total_amount * Decimal("1.1")
        order.save(update_fields=["total_amount"])
        
        if order_type == Order.OrderType.DINE_IN:
            table.status = Table.Status.OCCUPIED
            table.save(update_fields=["status"])
    
    return order

def order_pay(pk, payment_method):
    order = get_object_or_404(Order, pk=pk)

    if order.status != Order.Status.Created:
        raise ValueError('order status is not "created"')
    
    Payment.objects.create(
        order=order,
        amount=order.total_amount,
        payment_method=payment_method
    )
    order.status = Order.Status.SentToKitchen
    order.save(update_fields=["status"])

    return order

def order_ready(pk):
    with transaction.atomic():
        order = get_object_or_404(Order, pk=pk)    

        if order.status != Order.Status.SentToKitchen:
            raise ValueError('order status is not "sent to kitchen"')

        if order.order_type == Order.OrderType.TAKEAWAY:
            order.status = Order.Status.Completed
            order.save(update_fields=["status"])

            return order
        
        table = Table.objects.select_for_update().get(pk=order.table_id)
        table.status = Table.Status.OCCUPIED
        table.save(update_fields=["status"])

        order.status = Order.Status.Ready
        order.save(update_fields=["status"])

    return order

def order_complete(pk):
    with transaction.atomic():
        order = get_object_or_404(Order, pk=pk)

        if order.order_type == Order.OrderType.TAKEAWAY:
            raise ValueError("Order completion is only available for dine-in orders")

        if order.status != Order.Status.Ready:
            raise ValueError("The order is not ready yet")

        table = Table.objects.select_for_update().get(pk=order.table_id)
        table.status = Table.Status.FREE
        table.save(update_fields=["status"])

        order.status = Order.Status.Completed
        order.save(update_fields=["status"])

    return order

def order_cancel(pk):
    with transaction.atomic():
        order = get_object_or_404(Order, pk=pk)

        if order.status not in (Order.Status.Created, Order.Status.SentToKitchen):
            raise ValueError('Order cannot be canceled with the current status')
        
        if order.order_type == Order.OrderType.TAKEAWAY:
            order.status = Order.Status.Cancelled
            order.save(update_fields=["status"])

            return order
        
        table = Table.objects.select_for_update().get(pk=order.table_id)
        table.status = Table.Status.FREE
        table.save(update_fields=["status"])
        
        order.status = Order.Status.Cancelled
        order.save(update_fields=["status"])

    return order