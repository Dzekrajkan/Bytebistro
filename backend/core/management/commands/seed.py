from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from decimal import Decimal
from apps.orders.models import Order, OrderItem, Payment
from apps.tables.models import Table
from apps.menu.models import Category, MenuItem
import datetime

User = get_user_model()

class Command(BaseCommand):
    help = "Seed database with initial data"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding database...")
        self._create_users()
        self._create_tables()
        self._create_menu()
        self._create_orders()
        self.stdout.write(self.style.SUCCESS("Done!"))

    def _create_users(self):
        if not User.objects.filter(username="admin").exists():
            User.objects.create_superuser(username="admin", email="admin@bytebistro.com", password="admin1234", role="AD")
            self.stdout.write("  Created admin user")

    def _create_tables(self):
        tables = [
            {"number": 1, "seats_count": 2, "status": "O"},
            {"number": 2, "seats_count": 4, "status": "O"},
            {"number": 3, "seats_count": 4, "status": "O"},
            {"number": 4, "seats_count": 6, "status": "O"},
            {"number": 5, "seats_count": 2, "status": "O"},
            {"number": 6, "seats_count": 4, "status": "R"},
            {"number": 7, "seats_count": 8, "status": "F"},
            {"number": 8, "seats_count": 2, "status": "F"},
        ]
        for t in tables:
            Table.objects.get_or_create(number=t["number"], defaults=t)
        self.stdout.write("  Created tables")

    def _create_menu(self):
        categories = {
            "Burgers": [
                ("Classic Burger", "Beef patty, lettuce, tomato, cheese", 8.99, True),
                ("Bacon BBQ Burger", "Beef, bacon, BBQ sauce, onion rings", 10.99, True),
                ("Veggie Burger", "Plant-based patty, avocado, greens", 9.49, True),
            ],
            "Pizza": [
                ("Margherita", "Tomato sauce, mozzarella, basil", 11.99, True),
                ("Pepperoni", "Tomato sauce, mozzarella, pepperoni", 13.99, True),
                ("BBQ Chicken", "BBQ sauce, chicken, red onion", 14.49, True),
            ],
            "Salads": [
                ("Caesar Salad", "Romaine, parmesan, croutons, dressing", 7.99, True),
                ("Greek Salad", "Feta, olives, cucumber, tomato", 7.49, True),
            ],
            "Drinks": [
                ("Cola", "350 ml", 1.99, True),
                ("Lemonade", "Fresh squeezed, 400 ml", 2.49, True),
                ("Coffee", "Espresso double shot", 2.99, True),
                ("Water", "Still, 500 ml", 0.99, True),
            ],
            "Desserts": [
                ("Cheesecake", "New York style, berry sauce", 4.99, True),
                ("Brownie", "Warm chocolate brownie, ice cream", 4.49, True),
                ("Ice Cream", "3 scoops, choice of flavour", 3.49, False),
            ],
        }
        self._menu_items = {}
        for cat_name, items in categories.items():
            cat, _ = Category.objects.get_or_create(name=cat_name, defaults={"is_active": True})
            for name, desc, price, available in items:
                item, _ = MenuItem.objects.get_or_create(name=name, defaults={"category": cat, "description": desc, "price": Decimal(str(price)), "is_available": available})
                self._menu_items[name] = item
        self.stdout.write("  Created menu")

    def _create_orders(self):
        if Order.objects.exists():
            self.stdout.write("  Orders already exist, skipping")
            return

        today = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        def make_time(hours, minutes=0):
            return today + datetime.timedelta(hours=hours, minutes=minutes)

        t1 = Table.objects.get(number=1)
        t2 = Table.objects.get(number=2)
        t3 = Table.objects.get(number=3)
        t4 = Table.objects.get(number=4)
        t5 = Table.objects.get(number=5)
        m = self._menu_items

        def create_order(table, order_type, status, items_data, created_at, payment_method=None):
            total = Decimal("0")
            order_items_to_create = []
            for menu_item, qty in items_data:
                price = menu_item.price
                total += price * qty
                order_items_to_create.append(OrderItem(menu_item=menu_item, quantity=qty, price_at_moment=price, total_price=price * qty))
            total_with_tax = total * Decimal("1.1")
            order = Order(table=table, order_type=order_type, status=status, total_amount=total_with_tax)
            order.save()
            Order.objects.filter(pk=order.pk).update(created_at=created_at)
            for oi in order_items_to_create:
                oi.order = order
            OrderItem.objects.bulk_create(order_items_to_create)
            if payment_method:
                payment = Payment.objects.create(order=order, amount=total_with_tax, payment_method=payment_method)
                Payment.objects.filter(pk=payment.pk).update(created_at=created_at)
            return order

        create_order(table=t1, order_type="DI", status="S", items_data=[(m["Classic Burger"], 2), (m["Cola"], 2)], created_at=make_time(12, 10), payment_method="CS")
        create_order(table=t2, order_type="DI", status="S", items_data=[(m["Pepperoni"], 1), (m["Lemonade"], 2)], created_at=make_time(12, 25), payment_method="CR")
        create_order(table=t3, order_type="DI", status="S", items_data=[(m["BBQ Chicken"], 1), (m["Caesar Salad"], 1)], created_at=make_time(12, 40), payment_method="CS")
        create_order(table=t4, order_type="DI", status="S", items_data=[(m["Bacon BBQ Burger"], 2), (m["Cola"], 2)], created_at=make_time(12, 55), payment_method="CR")
        create_order(table=t5, order_type="DI", status="S", items_data=[(m["Greek Salad"], 2), (m["Water"], 2)], created_at=make_time(13, 5), payment_method="CS")
        create_order(table=None, order_type="TA", status="S", items_data=[(m["Veggie Burger"], 1), (m["Coffee"], 1)], created_at=make_time(13, 15), payment_method="CR")
        create_order(table=None, order_type="TA", status="S", items_data=[(m["Cheesecake"], 2), (m["Cola"], 1)], created_at=make_time(13, 30), payment_method="CS")

        create_order(table=None, order_type="TA", status="R", items_data=[(m["Margherita"], 1), (m["Coffee"], 2)], created_at=make_time(12, 0), payment_method="CR")

        create_order(table=None, order_type="TA", status="CO", items_data=[(m["Bacon BBQ Burger"], 1), (m["Cola"], 1)], created_at=make_time(9, 0), payment_method="CS")
        create_order(table=None, order_type="TA", status="CO", items_data=[(m["Margherita"], 1), (m["Coffee"], 1)], created_at=make_time(9, 30), payment_method="CR")
        create_order(table=t1, order_type="DI", status="CO", items_data=[(m["Greek Salad"], 2), (m["Water"], 2)], created_at=make_time(10, 0), payment_method="CS")
        create_order(table=None, order_type="TA", status="CO", items_data=[(m["Brownie"], 2), (m["Coffee"], 2)], created_at=make_time(10, 45), payment_method="CR")
        create_order(table=t2, order_type="DI", status="CO", items_data=[(m["Pepperoni"], 2), (m["Cola"], 2)], created_at=make_time(11, 15), payment_method="CS")
        create_order(table=None, order_type="TA", status="CO", items_data=[(m["Classic Burger"], 1), (m["Lemonade"], 1)], created_at=make_time(11, 50), payment_method="CR")

        create_order(table=None, order_type="TA", status="CA", items_data=[(m["Ice Cream"], 2)], created_at=make_time(9, 20))
        create_order(table=t3, order_type="DI", status="CA", items_data=[(m["Cheesecake"], 1)], created_at=make_time(10, 30))
        create_order(table=None, order_type="TA", status="CA", items_data=[(m["Margherita"], 1)], created_at=make_time(11, 40))

        self.stdout.write("  Created orders")