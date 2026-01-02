# kerdoiv/urls.py
from django.urls import path
from . import views

app_name = 'kerdoiv' # Namespace az URL-ekhez

urlpatterns = [
    path('', views.kerdoiv_lista, name='kerdoiv_lista'), # Lista nézet URL-je
    path('<int:kerdoiv_id>/', views.kerdoiv_kitoltes, name='kerdoiv_kitoltes'), # Kitöltő nézet URL-je
    path('<int:kerdoiv_id>/eredmeny/', views.kerdoiv_eredmeny, name='kerdoiv_eredmeny'), # Eredmény nézet URL-je (később implementáljuk)
]