from django.db import models
from django.conf import settings

# Create your models here.

class Kerdoiv(models.Model):
    cim = models.CharField(max_length=255, verbose_name="Kérdőív címe")
    leiras = models.TextField(blank=True, null=True, verbose_name="Leírás")
    letrehozas_datum = models.DateTimeField(auto_now_add=True, verbose_name="Létrehozás dátuma")
    aktiv = models.BooleanField(default=True, verbose_name="Aktív")
    # Opcionális: Kapcsolat más modellekkel, pl. Tananyag
    # tananyag = models.ForeignKey('tananyagok.Tananyag', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.cim

    class Meta:
        verbose_name = "Kérdőív"
        verbose_name_plural = "Kérdőívek"

class Kerdes(models.Model):
    KERDES_TIPUSOK = (
        ('FELELETVALASZTOS_EGY', 'Feleletválasztós (egy helyes válasz)'),
        ('FELELETVALASZTOS_TOBB', 'Feleletválasztós (több helyes válasz)'),
        ('SZÖVEGES', 'Szöveges válasz'),
        # Bővíthető további típusokkal
    )

    kerdoiv = models.ForeignKey(Kerdoiv, related_name='kerdesek', on_delete=models.CASCADE, verbose_name="Kérdőív")
    szoveg = models.TextField(verbose_name="Kérdés szövege")
    tipus = models.CharField(max_length=50, choices=KERDES_TIPUSOK, verbose_name="Kérdés típusa")
    pontszam = models.PositiveIntegerField(default=1, verbose_name="Pontszám")
    sorrend = models.PositiveIntegerField(default=0, verbose_name="Sorrend") # Kérdések sorrendjének beállításához

    def __str__(self):
        return f"{self.kerdoiv.cim} - Kérdés {self.sorrend if self.sorrend > 0 else self.id}"

    class Meta:
        verbose_name = "Kérdés"
        verbose_name_plural = "Kérdések"
        ordering = ['kerdoiv', 'sorrend', 'id'] # Sorrendezés

class Valaszlehetoseg(models.Model):
    kerdes = models.ForeignKey(Kerdes, related_name='valaszlehetosegek', on_delete=models.CASCADE, verbose_name="Kérdés")
    szoveg = models.CharField(max_length=500, verbose_name="Válasz szövege")
    helyes = models.BooleanField(default=False, verbose_name="Helyes válasz")

    def __str__(self):
        return f"{self.kerdes} - Válasz: {self.szoveg[:30]}..."

    class Meta:
        verbose_name = "Válaszlehetőség"
        verbose_name_plural = "Válaszlehetőségek"

class KerdoivKitoltes(models.Model):
    felhasznalo = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, verbose_name="Kitöltő")
    kerdoiv = models.ForeignKey(Kerdoiv, on_delete=models.CASCADE, verbose_name="Kérdőív")
    kitoltes_datum = models.DateTimeField(auto_now_add=True, verbose_name="Kitöltés dátuma")
    pontszam = models.IntegerField(default=0, verbose_name="Elért pontszám")
    befejezve = models.BooleanField(default=False, verbose_name="Befejezve") # Jelzi, ha a kitöltés lezárult

    def __str__(self):
        return f"{self.felhasznalo.username} - {self.kerdoiv.cim} ({self.kitoltes_datum.strftime('%Y-%m-%d %H:%M')})"

    class Meta:
        verbose_name = "Kérdőív kitöltés"
        verbose_name_plural = "Kérdőív kitöltések"
        unique_together = ('felhasznalo', 'kerdoiv') # Opcionális: Egy felhasználó csak egyszer töltheti ki?

class TanuloValasz(models.Model):
    kitoltes = models.ForeignKey(KerdoivKitoltes, related_name='valaszok', on_delete=models.CASCADE, verbose_name="Kitöltés")
    kerdes = models.ForeignKey(Kerdes, on_delete=models.CASCADE, verbose_name="Kérdés")
    # Feleletválasztós (egy vagy több) válaszok tárolása
    valasztott_lehetosegek = models.ManyToManyField(Valaszlehetoseg, blank=True, verbose_name="Választott lehetőség(ek)")
    # Szöveges válasz tárolása
    szoveges_valasz = models.TextField(blank=True, null=True, verbose_name="Szöveges válasz")
    # Opcionális: A válasz helyessége (kiértékelés után)
    helyes_e = models.BooleanField(null=True, blank=True, verbose_name="Helyes volt-e a válasz?")

    def __str__(self):
        return f"Válasz: {self.kitoltes} - Kérdés {self.kerdes.id}"

    class Meta:
        verbose_name = "Tanuló válasz"
        verbose_name_plural = "Tanuló válaszok"
        unique_together = ('kitoltes', 'kerdes') # Egy kitöltésen belül egy kérdésre csak egy válasz
