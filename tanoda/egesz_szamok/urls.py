
from django.urls import path
from . import views
from django.contrib.admin.views.decorators import staff_member_required

app_name = 'egesz_szamok'

urlpatterns = [
    path('', views.egesz_szamok_main, name='main'),
    path('szorzas/', views.szorzas_gyakorlo, name='szorzas'),
    path('nullaz/', views.nullaz_pontszam, name='nullaz_pontszam'),
    path('szorzas/kihivas/', views.szorzas_gyakorlo, {'mod': 'kihivas'}, name='szorzas_kihivas'),
    path('szorzas_tobbjegyuvel/', views.szorzas_tobbjegyuvel, name='szorzas_tobbjegyuvel'),
    path('helyiertek-matrix/', views.szorzas_helyiertek_matrix, name='szorzas_helyiertek_matrix'),
    path('szorzasok/', views.szorzasok, name='szorzasok'),
    path('szorzas/pythagoras/', views.pythagoras_tabla_view, name='pythagoras'),
    path('pitagorasz-adatok/', views.pitagorasz_adatok_view, name='pitagorasz_adatok'),
    path('leaderboard/', views.leaderboard_view, name='leaderboard'),
    path('ciklusok/', views.ciklusok_view, name='ciklusok'),
    # Pythagorasz quiz API endpoints
    path('api/pythagoras-quiz/questions/', views.pythagoras_quiz_questions, name='pythagoras_quiz_questions'),
    path('api/pythagoras-quiz/check-answer/', views.pythagoras_quiz_check_answer, name='pythagoras_quiz_check_answer'),
    path('api/pythagoras-quiz/status/', views.pythagoras_quiz_status, name='pythagoras_quiz_status'),

    # TEST ONLY: Pythagoras widget test environment (staff only)
    path('testwidget/pythagoras/', views.pythagoras_testwidget_view, name='pythagoras_testwidget'),
]