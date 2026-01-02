from django.shortcuts import render
from django.contrib.auth.decorators import login_required

def index(request):
    """Three.js kezdőoldal"""
    context = {
        'aktiv_modul': 'threejs',
        'page_title': 'Three.js Kezdőlap',
    }
    return render(request, 'threejs_app/index.html', context)

@login_required
def basic_scene(request):
    """Alapvető Three.js jelenet"""
    context = {
        'aktiv_modul': 'threejs_basic_scene',
        'page_title': 'Three.js Alapjelenetek',
        'scene_type': 'basic',
        'debug': request.GET.get('debug', False)
    }
    return render(request, 'threejs_app/scenes/basic_scene.html', context)

@login_required
def advanced_scene(request):
    """Haladó Three.js jelenet"""
    context = {
        'aktiv_modul': 'threejs_advanced_scene',
        'page_title': 'Three.js Haladó Jelenetek',
        'scene_type': 'advanced',
        'debug': request.GET.get('debug', False)
    }
    return render(request, 'threejs_app/scenes/advanced_scene.html', context)

@login_required
def geometry_showcase(request):
    """Geometriai alakzatok bemutatója"""
    context = {
        'aktiv_modul': 'threejs_geometry',
        'page_title': '3D Geometriai Alakzatok',
        'scene_type': 'geometry',
        'debug': request.GET.get('debug', False)
    }
    return render(request, 'threejs_app/scenes/geometry_showcase.html', context)

@login_required
def blockly_integration(request):
    """Blockly és Three.js integrációs felület"""
    context = {
        'aktiv_modul': 'threejs_blockly',
        'page_title': 'Blockly és Three.js Integráció',
        'scene_type': 'blockly',
        'debug': request.GET.get('debug', False)
    }
    return render(request, 'threejs_app/integration/blockly_threejs.html', context)

@login_required
def experiment_scene(request):
    """Kísérleti Three.js jelenet színes 3D objektumokkal"""
    context = {
        'aktiv_modul': 'threejs_experiment',
        'page_title': 'Three.js Kísérleti Jelenet',
        'scene_type': 'experiment',
        'debug': request.GET.get('debug', False)
    }
    return render(request, 'threejs_app/scenes/experiment-scene.html', context)

def simple_experiment(request):
    """Egyszerű Three.js kísérlet különálló HTML-ben"""
    return render(request, 'threejs_app/scenes/simple-experiment.html')

def math_particle_system(request):
    """Matematikai részecske rendszer Three.js-ben"""
    return render(request, 'threejs_app/scenes/math_particle_system.html')

def particle_background(request):
    """Interaktív 3D részecske háttér Three.js-ben"""
    return render(request, 'threejs_app/scenes/particle_background.html')

@login_required
def text_3d_animation(request):
    """3D Tanoda szöveg animációval és effektekkel"""
    context = {
        'aktiv_modul': 'threejs_3d_text',
        'page_title': '3D Tanoda Szöveg Animáció',
        'scene_type': 'text3d',
        'debug': request.GET.get('debug', False)
    }
    return render(request, 'threejs_app/scenes/text_3d_animation.html', context)
