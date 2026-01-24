from django.urls import path
from . import views

app_name = "parent"

urlpatterns = [
    path("dashboard/", views.dashboard, name="dashboard"),
    path("notifications/", views.notifications, name="notifications"),
]
