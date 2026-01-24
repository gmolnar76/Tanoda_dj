from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Wallet, LedgerEntry, EntryType
from decimal import Decimal

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def wallet_view(request):
    wallet = Wallet.objects.get(user=request.user)
    return Response({
        'available': float(wallet.balance_available),
        'locked': float(wallet.balance_locked),
        'paid_out': float(wallet.balance_paid_out),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ledger_view(request):
    entries = LedgerEntry.objects.filter(user=request.user).order_by('-created_at')[:20]
    return Response([
        {
            'id': str(e.id),
            'entry_type': e.entry_type,
            'amount': float(e.amount),
            'created_at': e.created_at.strftime('%Y-%m-%d %H:%M'),
        } for e in entries
    ])

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def deposit_view(request):
    amount = Decimal(request.data.get('amount', 0))
    if amount <= 0:
        return Response({'error': 'Érvénytelen összeg'}, status=400)
    # Auditált feltöltés
    from .models import EntryType
    LedgerEntry.objects.create(
        user=request.user,
        entry_type=EntryType.DEPOSIT,
        amount=amount,
        idempotency_key=f"manual_deposit_{request.user.id}_{LedgerEntry.objects.count()}"
    )
    wallet = Wallet.objects.get(user=request.user)
    wallet.recalculate_from_ledger()
    return Response({'success': True})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def payout_view(request):
    # Egyszerűsített payout (csak demo)
    wallet = Wallet.objects.get(user=request.user)
    if wallet.balance_available <= 0:
        return Response({'error': 'Nincs elérhető egyenleg'}, status=400)
    from .models import EntryType
    LedgerEntry.objects.create(
        user=request.user,
        entry_type=EntryType.PAYOUT,
        amount=wallet.balance_available,
        idempotency_key=f"manual_payout_{request.user.id}_{LedgerEntry.objects.count()}"
    )
    wallet.recalculate_from_ledger()
    return Response({'success': True})
