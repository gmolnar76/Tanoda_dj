# kerdoiv/forms.py
from django import forms
from .models import Kerdes, Valaszlehetoseg

class KerdoivKitoltesForm(forms.Form):
    def __init__(self, *args, **kwargs):
        kerdesek = kwargs.pop('kerdesek') # Kivesszük a kérdéseket a kwargs-ból
        super().__init__(*args, **kwargs)

        for kerdes in kerdesek:
            field_name = f'kerdes_{kerdes.id}'
            field_label = kerdes.szoveg
            field_required = True # Alapértelmezetten minden kérdés kötelező

            if kerdes.tipus == 'FELELETVALASZTOS_EGY':
                valaszok = kerdes.valaszlehetosegek.all()
                choices = [(opcio.id, opcio.szoveg) for opcio in valaszok]
                self.fields[field_name] = forms.ChoiceField(
                    label=field_label,
                    choices=choices,
                    widget=forms.RadioSelect, # Rádiógombok
                    required=field_required
                )
            elif kerdes.tipus == 'FELELETVALASZTOS_TOBB':
                valaszok = kerdes.valaszlehetosegek.all()
                choices = [(opcio.id, opcio.szoveg) for opcio in valaszok]
                self.fields[field_name] = forms.MultipleChoiceField(
                    label=field_label,
                    choices=choices,
                    widget=forms.CheckboxSelectMultiple, # Checkboxok
                    required=field_required
                    # Itt lehetne validátort hozzáadni, pl. min/max kiválasztás
                )
            elif kerdes.tipus == 'SZÖVEGES':
                self.fields[field_name] = forms.CharField(
                    label=field_label,
                    widget=forms.Textarea(attrs={'rows': 3, 'class': 'form-control'}),
                    required=field_required
                )
            # További kérdéstípusok kezelése itt...

            # Segítség a sablonban a típus azonosításához (opcionális)
            self.fields[field_name].widget.attrs['data-kerdes-tipus'] = kerdes.tipus
            self.fields[field_name].widget.attrs['data-kerdes-id'] = kerdes.id
            self.fields[field_name].help_text = f"({kerdes.pontszam} pont)" # Pontszám megjelenítése

    # Opcionális: Egyedi validációk hozzáadása, ha szükséges
    # def clean(self):
    #     cleaned_data = super().clean()
    #     # ... egyedi validációs logika ...
    #     return cleaned_data