from django.urls import path
from .views import Tables, TableDetail, TableReserve, TableFree

urlpatterns = [
    path("tables/", Tables.as_view()),
    path("tables/<int:pk>/", TableDetail.as_view()),
    path("tables/reserve/", TableReserve.as_view()),
    path("tables/<int:pk>/free/", TableFree.as_view())
]