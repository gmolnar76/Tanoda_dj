from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.urls import reverse
import os
import json


def index(request):
    return render(request, 'index.html')

@login_required
def evfolyamok(request):
    evfolyamok_lista = [
        {
            'szam': 4,
            'url': reverse('evfolyam', args=[4]),
            'nev': '4. évfolyam'
        },
        {
            'szam': 5,
            'url': reverse('evfolyam', args=[5]),
            'nev': '5. évfolyam'
        },
        {
            'szam': 6,
            'url': reverse('evfolyam_6'),  # Ezt meghagyjuk a kompatibilitás miatt
            'nev': '6. évfolyam'
        },
        {
            'szam': 7,
            'url': reverse('evfolyam', args=[7]),
            'nev': '7. évfolyam'
        },
        {
            'szam': 8,
            'url': reverse('evfolyam', args=[8]),
            'nev': '8. évfolyam'
        }
    ]
    
    return render(request, 'evfolyamok.html', {'evfolyamok': evfolyamok_lista})

def evfolyam(request):
    return render(request, 'evfolyam.html')

@login_required
def evfolyam_view(request, evfolyam_id):
    """Egységes nézet az évfolyamok kezeléséhez."""
    # Csak akkor próbáljuk betölteni a konfigurációt, ha az évfolyam fájl létezik
    template_path = f'evfolyamok/{evfolyam_id}/evf{evfolyam_id}.html'
    
    # Alapértelmezett kontextus
    context = {
        'evfolyam_id': evfolyam_id,
        'active_module': None,
        'active_lesson': None,
    }
    
    try:
        # Konfiguráció betöltése (amikor később lesz ilyen fájl)
        # config_path = os.path.join('tanoda', 'static', 'data', f'evfolyam_{evfolyam_id}_config.json')
        # with open(config_path, 'r', encoding='utf-8') as f:
        #     evfolyam_config = json.load(f)
        #     context['evfolyam_config'] = evfolyam_config
        pass
    except (FileNotFoundError, json.JSONDecodeError):
        # Ha nincs konfig fájl vagy hibás, üres konfig
        pass
    
    return render(request, template_path, context)

@login_required
def evfolyam_modul_view(request, evfolyam_id, modul):
    """Évfolyam-specifikus modul nézet."""
    context = {
        'evfolyam_id': evfolyam_id,
        'active_module': modul,
        'active_lesson': None,
    }
    
    # Itt később betölthetnénk a modulhoz tartozó konfig adatokat
    
    # Alapértelmezett sablon az évfolyam könyvtárában
    template_path = f'evfolyamok/{evfolyam_id}/evf{evfolyam_id}.html'
    
    return render(request, template_path, context)

@login_required
def evfolyam_lecke_view(request, evfolyam_id, modul, lecke):
    """Évfolyam-specifikus lecke nézet."""
    context = {
        'evfolyam_id': evfolyam_id,
        'active_module': modul,
        'active_lesson': lecke,
    }
    
    # Itt később betölthetnénk a leckéhez tartozó konfig adatokat és template-et
    
    # Alapértelmezett sablon az évfolyam könyvtárában
    template_path = f'evfolyamok/{evfolyam_id}/evf{evfolyam_id}.html'
    
    # Ha létezik specifikus lecke sablon, azt használjuk
    specific_template = f'evfolyamok/{evfolyam_id}/{modul}/{lecke}.html'
    try:
        from django.template.loader import get_template
        get_template(specific_template)
        template_path = specific_template
    except:
        pass
    
    return render(request, template_path, context)

def evfolyam_6(request):
    return render(request, 'evfolyamok/6/evf6.html')

def muveletek(request):
    return render(request, 'evfolyamok/6/muveletek.html')


@login_required
def dashboard_view(request):
    return render(request, "dashboard.html")