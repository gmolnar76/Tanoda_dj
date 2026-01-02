from django import forms
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser

class CustomUserCreationForm(UserCreationForm):
    # Explicit declaration of fields with required=True
    first_name = forms.CharField(max_length=150, required=True, label="Keresztnév")
    last_name = forms.CharField(max_length=150, required=True, label="Vezetéknév")
    # Using CharField for simplicity. Could be ChoiceField if classes are predefined.
    osztaly = forms.CharField(max_length=10, required=False, label="Osztály", help_text="Pl.: 1-8-ig (csak a 6. osztály aktív)")

    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('email', 'first_name', 'last_name', 'osztaly') # Add 'osztaly'

class CustomUserChangeForm(UserChangeForm):
    first_name = forms.CharField(max_length=150, required=True, label="Keresztnév")
    last_name = forms.CharField(max_length=150, required=True, label="Vezetéknév")
    osztaly = forms.CharField(max_length=10, required=False, label="Osztály")

    class Meta(UserChangeForm.Meta):
        model = CustomUser
        fields = ('email', 'first_name', 'last_name', 'osztaly', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions') # Add 'osztaly'