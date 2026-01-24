from rest_framework import serializers
from .models import NotificationEvent, ApprovalRequest

class NotificationEventSerializer(serializers.ModelSerializer):
    approval_id = serializers.SerializerMethodField()

    class Meta:
        model = NotificationEvent
        fields = ['id', 'type', 'message', 'timestamp', 'status', 'approval_id']

    def get_approval_id(self, obj):
        approval = obj.approval_requests.filter(status='pending').first()
        return approval.id if approval else None

class ApprovalRequestSerializer(serializers.ModelSerializer):
    event_id = serializers.SerializerMethodField()

    class Meta:
        model = ApprovalRequest
        fields = ['id', 'message', 'status', 'created_at', 'event_id']

    def get_event_id(self, obj):
        return obj.event.id if obj.event else None

class ApprovalActionResponseSerializer(serializers.Serializer):
    id = serializers.CharField()
    status = serializers.ChoiceField(choices=['approved', 'rejected'])
    updated_at = serializers.DateTimeField()
