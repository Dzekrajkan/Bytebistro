from django.urls import path
from .views import CategoryApiView, CategoryDetail, MenuItemApiView, MenuItemDetail

urlpatterns = [
    path("categories/", CategoryApiView.as_view()),
    path("categories/<int:pk>/", CategoryDetail.as_view()),
    path("menu-items/", MenuItemApiView.as_view()),
    path("menu-items/<int:pk>/", MenuItemDetail.as_view())
]