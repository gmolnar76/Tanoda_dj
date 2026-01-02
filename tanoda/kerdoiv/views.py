# kerdoiv/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden, HttpResponse
from .models import Kerdoiv, Kerdes, Valaszlehetoseg, KerdoivKitoltes, TanuloValasz
from .forms import KerdoivKitoltesForm # Importáljuk az új formot

@login_required
def kerdoiv_lista(request):
    """
    Megjeleníti az aktív, kitölthető kérdőívek listáját.
    """
    kerdoivek = Kerdoiv.objects.filter(aktiv=True)
    context = {
        'kerdoivek': kerdoivek,
    }
    return render(request, 'kerdoiv/kerdoiv_lista.html', context)


@login_required
def kerdoiv_kitoltes(request, kerdoiv_id):
    """
    Megjeleníti a kérdőív kitöltő felületét és feldolgozza a válaszokat Form használatával.
    """
    kerdoiv = get_object_or_404(Kerdoiv, id=kerdoiv_id, aktiv=True)
    kerdesek = kerdoiv.kerdesek.prefetch_related('valaszlehetosegek').order_by('sorrend', 'id')

    kitoltes, created = KerdoivKitoltes.objects.get_or_create(
        felhasznalo=request.user,
        kerdoiv=kerdoiv,
        defaults={'befejezve': False}
    )

    if kitoltes.befejezve:
        return redirect('kerdoiv:kerdoiv_eredmeny', kerdoiv_id=kerdoiv.id)

    if request.method == 'POST':
        form = KerdoivKitoltesForm(request.POST, kerdesek=kerdesek) # Átadjuk a POST adatokat és a kérdéseket
        if form.is_valid():
            osszes_pont = 0
            helyes_valaszok_szama = 0

            for kerdes in kerdesek:
                field_name = f'kerdes_{kerdes.id}'
                cleaned_value = form.cleaned_data.get(field_name)

                tanulo_valasz, _ = TanuloValasz.objects.update_or_create(
                    kitoltes=kitoltes,
                    kerdes=kerdes,
                    defaults={'szoveges_valasz': None, 'helyes_e': None}
                )
                tanulo_valasz.valasztott_lehetosegek.clear()

                helyes_volt = False

                if kerdes.tipus == 'FELELETVALASZTOS_EGY':
                    if cleaned_value: # cleaned_value itt az opció ID stringként
                        try:
                            valasztott_opcio = Valaszlehetoseg.objects.get(id=int(cleaned_value), kerdes=kerdes)
                            tanulo_valasz.valasztott_lehetosegek.add(valasztott_opcio)
                            if valasztott_opcio.helyes:
                                helyes_volt = True
                        except (Valaszlehetoseg.DoesNotExist, ValueError):
                            pass # Hibás ID

                elif kerdes.tipus == 'FELELETVALASZTOS_TOBB':
                    if cleaned_value: # cleaned_value itt ID stringek listája
                        # Változás: Ne követeljük meg az összes helyes választ
                        # Elég, ha egyetlen helytelent sem választ és legalább egy helyeset igen
                        
                        helyes_opciok_id = set(kerdes.valaszlehetosegek.filter(helyes=True).values_list('id', flat=True))
                        valasztott_opciok_id = set()
                        van_helytelen_valasztott = False
                        
                        for vid_str in cleaned_value:
                            try:
                                vid = int(vid_str)
                                valasztott_opcio = Valaszlehetoseg.objects.get(id=vid, kerdes=kerdes)
                                tanulo_valasz.valasztott_lehetosegek.add(valasztott_opcio)
                                valasztott_opciok_id.add(vid)
                                
                                # Ha olyan opciót választott ami nem helyes, akkor helytelen a válasz
                                if not valasztott_opcio.helyes:
                                    van_helytelen_valasztott = True
                            except (Valaszlehetoseg.DoesNotExist, ValueError):
                                pass # Hibás ID
                        
                        # A válasz akkor helyes, ha:
                        # 1. Legalább egy helyes opciót választott (metszet nem üres)
                        # 2. Nem választott egyetlen helytelen opciót sem
                        if not van_helytelen_valasztott and bool(valasztott_opciok_id & helyes_opciok_id):
                            helyes_volt = True

                elif kerdes.tipus == 'SZÖVEGES':
                    tanulo_valasz.szoveges_valasz = cleaned_value if cleaned_value else ""
                    # Szöveges válasz kiértékelése továbbra is manuális/egyedi lehet
                    helyes_volt = None

                tanulo_valasz.helyes_e = helyes_volt
                tanulo_valasz.save()

                if helyes_volt:
                    osszes_pont += kerdes.pontszam
                    helyes_valaszok_szama += 1

            kitoltes.pontszam = osszes_pont
            kitoltes.befejezve = True
            kitoltes.save()

            return redirect('kerdoiv:kerdoiv_eredmeny', kerdoiv_id=kerdoiv.id)
        # Ha a form nem valid, a renderelés újra megjeleníti az űrlapot a hibákkal
    else:
        # GET kérés: Üres formot hozunk létre a kérdésekkel
        form = KerdoivKitoltesForm(kerdesek=kerdesek)

    context = {
        'kerdoiv': kerdoiv,
        'form': form, # Átadjuk a formot a sablonnak
        'kitoltes': kitoltes,
        'aktiv_modul': 'pythagoras',  # Hozzáadva az aktiv_modul, hogy a sablon megfelelően jelenítse meg
    }
    return render(request, 'kerdoiv/kerdoiv_kitoltes.html', context)


@login_required
def kerdoiv_eredmeny(request, kerdoiv_id):
    """
    Megjeleníti a kitöltött kérdőív eredményét.
    Ezen a ponton újraértékeljük a válaszokat a módosított logika szerint.
    """
    kerdoiv = get_object_or_404(Kerdoiv, id=kerdoiv_id)
    try:
        kitoltes = KerdoivKitoltes.objects.prefetch_related(
            'valaszok__kerdes__valaszlehetosegek', # Optimalizálás
            'valaszok__valasztott_lehetosegek'
        ).get(felhasznalo=request.user, kerdoiv=kerdoiv, befejezve=True)
    except KerdoivKitoltes.DoesNotExist:
        return redirect('kerdoiv:kerdoiv_lista')

    # Újraértékelés a módosított logika szerint
    osszes_pont = 0
    tanulo_valaszok = kitoltes.valaszok.order_by('kerdes__sorrend', 'kerdes__id')
    
    for tanulo_valasz in tanulo_valaszok:
        helyes_volt = False
        kerdes = tanulo_valasz.kerdes
        
        if kerdes.tipus == 'FELELETVALASZTOS_EGY':
            # Egyszerű egy válaszos eset
            valasztott_opciok = tanulo_valasz.valasztott_lehetosegek.all()
            if valasztott_opciok.count() == 1 and valasztott_opciok.first().helyes:
                helyes_volt = True
                
        elif kerdes.tipus == 'FELELETVALASZTOS_TOBB':
            # Többszörös választásos eset - új, megengedőbb logika
            valasztott_opciok = tanulo_valasz.valasztott_lehetosegek.all()
            helyes_opciok = kerdes.valaszlehetosegek.filter(helyes=True)
            
            # Valami helyeset választott-e?
            van_helyes_valasztott = any(opcio.helyes for opcio in valasztott_opciok)
            
            # Van-e helytelen választása?
            van_helytelen_valasztott = any(not opcio.helyes for opcio in valasztott_opciok)
            
            # Akkor helyes, ha van helyes választás és nincs helytelen
            if van_helyes_valasztott and not van_helytelen_valasztott:
                helyes_volt = True
                
        elif kerdes.tipus == 'SZÖVEGES':
            # Szöveges választ nem értékelünk automatikusan
            helyes_volt = tanulo_valasz.helyes_e
            
        # Frissítsük a válasz helyességét és a pontszámát
        if helyes_volt != tanulo_valasz.helyes_e:
            tanulo_valasz.helyes_e = helyes_volt
            tanulo_valasz.save()
            
        if helyes_volt:
            osszes_pont += kerdes.pontszam
    
    # A teljes kitöltés pontszámának frissítése, ha szükséges
    if kitoltes.pontszam != osszes_pont:
        kitoltes.pontszam = osszes_pont
        kitoltes.save()
            
    max_pontszam = sum(k.pontszam for k in kerdoiv.kerdesek.all())

    context = {
        'kerdoiv': kerdoiv,
        'kitoltes': kitoltes,
        'max_pontszam': max_pontszam,
        'tanulo_valaszok': tanulo_valaszok,
        'aktiv_modul': 'pythagoras',  # Hozzáadva az aktiv_modul, hogy a sablon megfelelően jelenítse meg
    }
    return render(request, 'kerdoiv/kerdoiv_eredmeny.html', context)
