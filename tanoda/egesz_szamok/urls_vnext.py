"""
vNext API URL Configuration
===========================

URL patterns for the learning API.
All endpoints are under /api/learning/
"""

from django.urls import path
from . import views_vnext as views

app_name = 'learning_vnext'

urlpatterns = [
    # Session management
    path('session/', views.GetSessionView.as_view(), name='session-get'),
    path('session/start/', views.StartSessionView.as_view(), name='session-start'),
    path('session/end/', views.EndSessionView.as_view(), name='session-end'),

    # Task operations
    path('answer/', views.SubmitAnswerView.as_view(), name='answer-submit'),
    path('task/next/', views.NextTaskView.as_view(), name='task-next'),

    # Level & mode operations
    path('level/change/', views.ChangeLevelView.as_view(), name='level-change'),
    path('level/reset/', views.ResetLevelView.as_view(), name='level-reset'),
    path('mode/change/', views.ChangeModeView.as_view(), name='mode-change'),
    path('module/change/', views.ChangeModuleView.as_view(), name='module-change'),

    # Statistics & grid
    path('statistics/', views.StatisticsView.as_view(), name='statistics'),
    path('pythagoras/', views.PythagorasGridView.as_view(), name='pythagoras'),
    path('levels/', views.LevelsInfoView.as_view(), name='levels-info'),
]
