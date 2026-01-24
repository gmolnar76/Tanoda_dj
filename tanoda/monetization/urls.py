from django.urls import path
from .api_views import wallet_view, ledger_view, deposit_view, payout_view
from .dashboard_views import dashboard_summary_view, dashboard_timeline_view

urlpatterns = [
    path('wallet/', wallet_view, name='wallet'),
    path('ledger/', ledger_view, name='ledger'),
    path('deposit/', deposit_view, name='deposit'),
    path('payout/', payout_view, name='payout'),

    path("monetization/dashboard/summary/", dashboard_summary_view, name="dashboard-summary"),
    path("monetization/dashboard/timeline/", dashboard_timeline_view, name="dashboard-timeline"),
]
