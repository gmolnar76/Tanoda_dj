from django.contrib import admin
from .models import Wallet, LedgerEntry, ModuleDeposit

@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'entry_type', 'amount', 'created_at', 'related_deposit', 'idempotency_key']
    list_filter = ['entry_type', 'created_at']
    search_fields = ['user__username', 'idempotency_key']
    readonly_fields = ['id', 'user', 'entry_type', 'amount', 'created_at', 'related_deposit', 'idempotency_key']

    def has_add_permission(self, request):
        return False  # Ledger entries created by service only

    def has_delete_permission(self, request, obj=None):
        return False  # Append-only

@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['user', 'balance_locked', 'balance_available', 'balance_paid_out', 'updated_at']
    search_fields = ['user__username']
    readonly_fields = ['user', 'balance_locked', 'balance_available', 'balance_paid_out', 'updated_at']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(ModuleDeposit)
class ModuleDepositAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'amount', 'status', 'created_at', 'settled_at', 'content_type', 'object_id']
    list_filter = ['status', 'created_at', 'content_type']
    search_fields = ['user__username', 'id']
    readonly_fields = ['id', 'user', 'amount', 'status', 'created_at', 'settled_at', 'content_type', 'object_id']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
