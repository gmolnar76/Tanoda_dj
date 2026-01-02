from django.urls import path
from . import views

app_name = 'TRON_Bit'

urlpatterns = [
    path('', views.tron_index_view, name='tron_index'), # Index oldal
    path('experiment1/', views.experiment1_view, name='experiment1'), # Első kísérlet
    path('experiment2/', views.experiment2_view, name='experiment2'), # Második kísérlet (forgó gömb)
    path('experiment3/', views.experiment3_view, name='experiment3'), # Harmadik kísérlet (egyszerű 3D testek)
    path('original/', views.tron_bit_view, name='tron_bit_original'), # Eredeti nézet átnevezve
]