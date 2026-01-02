from django.urls import path
from . import views

app_name = 'pont'

urlpatterns = [
    path('osszesites/', views.pontszam_osszesites, name='osszesites'),

    # API endpoint-ok
    path('api/aktualis/', views.api_aktualis_pontszam, name='api_aktualis'),
    path('api/szint/', views.api_szint_info, name='api_szint'),
    path('api/badges/', views.api_badges, name='api_badges'),
    path('api/streak/', views.api_streak, name='api_streak'),
    path('api/leaderboard/', views.api_leaderboard, name='api_leaderboard'),
]