from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db.models import Q
from .models import NotificationEvent, ApprovalRequest
from .serializers import (
    NotificationEventSerializer,
    ApprovalRequestSerializer,
    ApprovalActionResponseSerializer,
)
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.renderers import JSONRenderer

DEFAULT_LIMIT = 50

# TODO: Replace with ParentOnlyPermission
class ParentOnlyPermission(IsAuthenticated):
    pass

def get_cursor_tuple(obj):
    return (obj.timestamp.isoformat(), obj.id)

class ParentNotificationsView(APIView):
    permission_classes = [ParentOnlyPermission]  # TODO: implement real parent scoping
    renderer_classes = [JSONRenderer]
    def get(self, request):
        cursor = request.query_params.get('cursor')
        events = NotificationEvent.objects.all().order_by('-timestamp', '-id')
        if cursor:
            try:
                ts, eid = cursor.split('|', 1)
                ts_dt = parse_datetime(ts)
                if not ts_dt:
                    raise ValueError
                events = events.filter(
                    Q(timestamp__lt=ts_dt) |
                    Q(timestamp=ts_dt, id__lt=eid)
                )
            except Exception:
                return Response({'detail': 'Invalid cursor'}, status=400)
        events = list(events[:DEFAULT_LIMIT + 1])
        has_next = len(events) > DEFAULT_LIMIT
        events_page = events[:DEFAULT_LIMIT]
        notifications = NotificationEventSerializer(events_page, many=True).data

        next_cursor = None
        if has_next:
            last = events_page[-1]
            next_cursor = f"{last.timestamp.isoformat()}|{last.id}"

        # Scope approval_requests to parent/user
        # TODO: Replace with actual parent scoping, e.g. ApprovalRequest.objects.filter(parent=request.user, status='pending')
        approval_requests = ApprovalRequest.objects.filter(status='pending')
        approval_data = ApprovalRequestSerializer(approval_requests, many=True).data

        return Response({
            "notifications": notifications,
            "approval_requests": approval_data,
            "meta": {
                "has_next": has_next,
                "next_cursor": next_cursor
            }
        })

class ApprovalApproveView(APIView):
    permission_classes = [ParentOnlyPermission]  # TODO: implement real parent scoping

    def post(self, request, id):
        try:
            approval = ApprovalRequest.objects.get(id=id)
        except ApprovalRequest.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)
        if approval.status != 'pending':
            return Response({'detail': 'Already handled'}, status=400)
        approval.status = 'approved'
        approval.save(update_fields=['status', 'updated_at'])
        resp = ApprovalActionResponseSerializer({
            'id': approval.id,
            'status': approval.status,
            'updated_at': approval.updated_at
        })
        return Response(resp.data)

class ApprovalRejectView(APIView):
    permission_classes = [ParentOnlyPermission]  # TODO: implement real parent scoping

    def post(self, request, id):
        try:
            approval = ApprovalRequest.objects.get(id=id)
        except ApprovalRequest.DoesNotExist:
            return Response({'detail': 'Not found'}, status=404)
        if approval.status != 'pending':
            return Response({'detail': 'Already handled'}, status=400)
        approval.status = 'rejected'
        approval.save(update_fields=['status', 'updated_at'])
        resp = ApprovalActionResponseSerializer({
            'id': approval.id,
            'status': approval.status,
            'updated_at': approval.updated_at
        })
        return Response(resp.data)