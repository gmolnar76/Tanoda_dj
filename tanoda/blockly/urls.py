from django.urls import path
from . import views

urlpatterns = [
    path('blockly/', views.blockly_view, name='blockly'),
    path('3d_blockly/', views.blockly_3d_view, name='3d_blockly'),
    path('blockly_three_test/', views.blockly_three_test_view, name='blockly_three_test'),
    path('blockly_threejs/', views.blockly_threejs_view, name='blockly_threejs'),
]