from django.urls import path
from .views import Users, UserDetail, Login, Logout, Me, CookieTokenRefreshView

urlpatterns = [
    path("users/", Users.as_view()),
    path("users/<int:pk>/", UserDetail.as_view()),
    path("login/", Login.as_view()),
    path("logout/", Logout.as_view()),
    path("me/", Me.as_view()),
    path("refresh/", CookieTokenRefreshView.as_view())
]