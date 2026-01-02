from django.urls import path
from . import views

app_name = 'navbar'

urlpatterns = [
    path('config/', views.navbar_config, name='config'),
]