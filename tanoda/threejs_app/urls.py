from django.urls import path
from . import views

app_name = 'threejs_app'

urlpatterns = [
    path('', views.index, name='index'),
    path('basic-scene/', views.basic_scene, name='basic_scene'),
    path('advanced-scene/', views.advanced_scene, name='advanced_scene'),
    path('geometry-showcase/', views.geometry_showcase, name='geometry_showcase'),
    path('blockly-integration/', views.blockly_integration, name='blockly_integration'),
    path('experiment-scene/', views.experiment_scene, name='experiment_scene'),
    path('simple-experiment/', views.simple_experiment, name='simple_experiment'),
    path('math-particle-system/', views.math_particle_system, name='math_particle_system'),
    path('particle-background/', views.particle_background, name='particle_background'),
    path('text-3d-animation/', views.text_3d_animation, name='text_3d_animation'),
]