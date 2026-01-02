"""
URL configuration for tanoda project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static
import egesz_szamok.views
import plotly_chart.views
import tanoda.views


urlpatterns = [
    # Adminisztrációs és alapvető útvonalak
    path('admin/', admin.site.urls),
    path('', views.index, name='index'),
    
    # Évfolyamok egységes kezelése
    path('evfolyamok/', views.evfolyamok, name='evfolyamok'),
    path('evfolyam/<int:evfolyam_id>/', views.evfolyam_view, name='evfolyam'),
    path('evfolyam/<int:evfolyam_id>/<str:modul>/', views.evfolyam_modul_view, name='evfolyam_modul'),
    path('evfolyam/<int:evfolyam_id>/<str:modul>/<str:lecke>/', views.evfolyam_lecke_view, name='evfolyam_lecke'),
    
    # A 6. évfolyam régi útvonala (kompatibilitási okokból)
    path('evf6/', views.evfolyam_6, name='evfolyam_6'),
    path('evf6/muveletek/', views.muveletek, name='muveletek'),
    
    # Alkalmazások útvonalai
    path('accounts/', include('account.urls')),
    path('egesz_szamok/', include('egesz_szamok.urls')),
    path('statisztika/', include('statisztika.urls')),
    path('pont/', include('pont.urls')),
    path('mathsolver/', include('mathsolver.urls')),
    path('kerdoiv/', include('kerdoiv.urls')),
    path('plotly_chart/', include('plotly_chart.urls')),
    path('navbar/', include('navbar.urls')),
    path('blockly/', include('blockly.urls')),
    path('threejs_app/', include('threejs_app.urls')),
    path('tron_bit/', include('TRON_Bit.urls')),  # Hozzáadva TRON_Bit app
]

# Statikus és media fájlok kezelése fejlesztési környezetben
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)