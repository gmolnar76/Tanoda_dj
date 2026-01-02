from django.urls import path
from . import views

app_name = 'statisztika'

urlpatterns = [
    path('', views.felhasznalo_statisztika, name='felhasznalo_statisztika'),
    path('user/<int:user_id>/', views.felhasznalo_statisztika, name='felhasznalo_statisztika_user'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
]