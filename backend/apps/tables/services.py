from django.db import transaction
from django.shortcuts import get_object_or_404
from .models import Table

def reserve_table():
    with transaction.atomic():
        table = Table.objects.select_for_update().filter(status=Table.Status.FREE).first()

        if table is None:
            raise ValueError("There are no free tables.")
        
        table.status = Table.Status.RESERVED
        table.save(update_fields=["status"])

        return table
    
def free_table(pk):
    table = get_object_or_404(Table, pk=pk)

    table.status = Table.Status.FREE
    table.save(update_fields=["status"])

    return table