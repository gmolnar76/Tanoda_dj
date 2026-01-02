import os
import json
from pathlib import Path

def evfolyam_config(request):
    """
    Évfolyam-specifikus konfigurációs adatok betöltése és hozzáadása a sablonok kontextusához.
    """
    context = {
        'evfolyam_config': None
    }
    
    # Ellenőrizzük, hogy a kérés évfolyam-specifikus-e
    if not hasattr(request, 'resolver_match') or not request.resolver_match:
        return context
    
    # Kinyerjük az évfolyam azonosítót a kérésből
    evfolyam_id = None
    
    if hasattr(request.resolver_match, 'kwargs'):
        evfolyam_id = request.resolver_match.kwargs.get('evfolyam_id')
    
    if not evfolyam_id:
        # Ellenőrizzük a speciális 6. évfolyam útvonalat
        if request.resolver_match.url_name == 'evfolyam_6' or request.resolver_match.url_name == 'muveletek':
            evfolyam_id = 6
    
    if not evfolyam_id:
        return context
    
    # Évfolyam konfigurációs adatok betöltése fájlból
    # Egyelőre alapértelmezett konfigurációt használunk, később JSON-ból vagy adatbázisból betölthető
    config = get_default_config(evfolyam_id)
    
    context['evfolyam_id'] = evfolyam_id
    context['evfolyam_config'] = config
    
    return context

def get_default_config(evfolyam_id):
    """Alapértelmezett konfiguráció generálása az évfolyamhoz, ha nincs betölthető konfig fájl."""
    # Itt később megpróbálhatnánk beolvasni a konfigot fájlból:
    # json_path = Path(f"tanoda/static/data/evfolyam_{evfolyam_id}_config.json")
    # if json_path.exists():
    #    with open(json_path, 'r', encoding='utf-8') as f:
    #        return json.load(f)
    
    # Alapértelmezett konfigurációs struktúra
    config = {
        "id": evfolyam_id,
        "title": f"{evfolyam_id}. Évfolyam",
        "description": f"{evfolyam_id}. évfolyam matematikai és programozási tananyagai",
        "theme": {
            "primary_color": get_primary_color(evfolyam_id),
            "secondary_color": get_secondary_color(evfolyam_id),
            "accent_color": "#BB86FC"
        },
        "modules": get_default_modules(evfolyam_id)
    }
    
    return config

def get_primary_color(evfolyam_id):
    """Alapértelmezett elsődleges szín az évfolyam alapján."""
    colors = {
        4: "#ff6b6b",  # Piros árnyalat a legfiatalabbaknak
        5: "#4ecca3",  # Zöld árnyalat
        6: "#5C81A6",  # Kék árnyalat
        7: "#9b59b6",  # Lila árnyalat
        8: "#f39c12",  # Narancs árnyalat
    }
    return colors.get(evfolyam_id, "#bb86fc")  # Alapértelmezett lila

def get_secondary_color(evfolyam_id):
    """Alapértelmezett másodlagos szín az évfolyam alapján."""
    colors = {
        4: "#4ecdc4",
        5: "#1a2849",
        6: "#3C6080",
        7: "#8e44ad",
        8: "#e67e22",
    }
    return colors.get(evfolyam_id, "#03dac6")  # Alapértelmezett türkiz

def get_default_modules(evfolyam_id):
    """Alapértelmezett modulok az évfolyam alapján."""
    if evfolyam_id == 4:
        return [
            {
                "id": "szamok",
                "title": "Számok világa",
                "icon": "fas fa-calculator",
                "lessons": [
                    {"id": "szamolas_100", "title": "Számolás 100-ig"},
                    {"id": "osszeadas_kivonas", "title": "Összeadás és kivonás"},
                    {"id": "szorzotabla", "title": "Szorzótábla"}
                ]
            },
            {
                "id": "geometria",
                "title": "Formák és méretek",
                "icon": "fas fa-shapes",
                "lessons": [
                    {"id": "sikidomok", "title": "Síkidomok"},
                    {"id": "mertek", "title": "Mértékegységek"}
                ]
            }
        ]
    elif evfolyam_id == 5:
        return [
            {
                "id": "szamok",
                "title": "Számok és műveletek",
                "icon": "fas fa-calculator",
                "lessons": [
                    {"id": "termeszetes_szamok", "title": "Természetes számok"},
                    {"id": "alapmuveletek", "title": "Alapműveletek"},
                    {"id": "tortek", "title": "Törtek"}
                ]
            },
            {
                "id": "geometria",
                "title": "Geometria",
                "icon": "fas fa-shapes",
                "lessons": [
                    {"id": "alakzatok", "title": "Síkbeli alakzatok"},
                    {"id": "meresek", "title": "Mérések, mértékegységek"}
                ]
            }
        ]
    elif evfolyam_id == 6:
        return [
            {
                "id": "egesz_szamok",
                "title": "Egész számok, oszthatóság",
                "icon": "fas fa-calculator",
                "lessons": [
                    {"id": "muveletek", "title": "Műveletek az egész számok körében"},
                    {"id": "szorzas", "title": "Szorzás gyakorlása"},
                    {"id": "pythagoras", "title": "Pythagoras tábla"},
                    {"id": "helyiertek_matrix", "title": "Helyiérték mátrix"}
                ]
            },
            {
                "id": "programozas",
                "title": "Programozási alapok",
                "icon": "fas fa-code",
                "lessons": [
                    {"id": "blockly", "title": "Blockly programozás"},
                    {"id": "3d_blockly", "title": "3D Blockly"},
                    {"id": "blockly_threejs", "title": "Blockly-ThreeJS"},
                    {"id": "ciklusok", "title": "Ciklusok gyakorlása"}
                ]
            }
        ]
    
    # 7. és 8. évfolyam moduljai (fejlesztés alatt)
    return []