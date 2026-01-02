from django.urls import path
from . import views

app_name = 'plotly_chart'

urlpatterns = [
    path('plotly_chart/kordinata/', views.kordinata, name='kordinata'),
    path('plotly_chart/', views.plotly_main, name='plotly_main'),
]