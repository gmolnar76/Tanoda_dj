from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Wallet, LedgerEntry, EntryType



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary_view(request):
    try:
        wallet, _ = Wallet.objects.get_or_create(user=request.user)
        sources_count = (
            LedgerEntry.objects
            .filter(user=request.user, entry_type=EntryType.DEPOSIT)
            .count()
        )
        data = {
            "available": float(wallet.balance_available or 0),
            "locked": float(wallet.balance_locked or 0),
            "paid_out": float(wallet.balance_paid_out or 0),
            "sources_count": sources_count,
        }
        return Response(data)
    except Exception as e:
        return Response(
            {
                "error": "dashboard_summary_failed",
                "detail": str(e),
            },
            status=500,
        )



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_timeline_view(request):
    try:
        try:
            limit = int(request.GET.get("limit", 20))
        except (TypeError, ValueError):
            limit = 20
        limit = max(1, min(limit, 50))  # safety cap

        entries = (
            LedgerEntry.objects
            .filter(user=request.user)
            .order_by("-created_at")[:limit]
        )

        def map_entry(entry: LedgerEntry) -> dict:
            if entry.entry_type == EntryType.DEPOSIT:
                return {"type": "DEPOSIT", "label": "Támogatás érkezett", "direction": "in"}
            if entry.entry_type == EntryType.PAYOUT:
                return {"type": "PAYOUT", "label": "Kifizetés", "direction": "out"}
            return {"type": "OTHER", "label": "Esemény", "direction": "neutral"}

        result = [
            {
                "id": str(e.id),
                "amount": float(e.amount),
                "created_at": e.created_at.strftime("%Y-%m-%d %H:%M"),
                **map_entry(e),
            }
            for e in entries
        ]
        return Response(result)
    except Exception as e:
        return Response(
            {
                "error": "dashboard_timeline_failed",
                "detail": str(e),
            },
            status=500,
        )
