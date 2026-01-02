from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _

from .models import CustomUser
from .forms import CustomUserCreationForm, CustomUserChangeForm

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = ('email', 'first_name', 'last_name', 'osztaly', 'is_staff', 'is_active',) # Add 'osztaly'
    list_filter = ('is_staff', 'is_active', 'osztaly',) # Add 'osztaly'
    search_fields = ('email', 'first_name', 'last_name', 'osztaly',) # Add 'osztaly'
    ordering = ('email',)
    
    # Define fieldsets for add and change views to include 'osztaly'
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'osztaly')}), # Add 'osztaly' here
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password', 'password2', 'first_name', 'last_name', 'osztaly'), # Add 'osztaly' here
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return ['date_joined', 'last_login']
        return []

admin.site.register(CustomUser, CustomUserAdmin)