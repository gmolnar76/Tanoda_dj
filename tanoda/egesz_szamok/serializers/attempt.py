"""
Attempt Serializers
===================

Serializers for answer submission and attempt tracking.
"""

from rest_framework import serializers
from uuid import uuid4

from .task import TaskSerializer


class SubmitAnswerSerializer(serializers.Serializer):
    """Serializer for submitting an answer"""
    session_id = serializers.UUIDField()
    user_answer = serializers.IntegerField()
    response_time_ms = serializers.IntegerField(required=False, allow_null=True)
    client_event_id = serializers.CharField(
        max_length=64,
        required=False,
        default=None
    )

    def validate_client_event_id(self, value):
        if value is None:
            return str(uuid4())
        return value


class AnswerResultSerializer(serializers.Serializer):
    """Serializer for answer submission result"""
    is_correct = serializers.BooleanField()
    correct_answer = serializers.IntegerField()
    user_answer = serializers.IntegerField()
    next_task = TaskSerializer()
    level = serializers.IntegerField()
    level_completed = serializers.BooleanField()
    level_regressed = serializers.BooleanField()
    streak_milestone = serializers.IntegerField(allow_null=True)
    rewards = serializers.ListField(child=serializers.DictField())
    notifications = serializers.ListField(child=serializers.DictField())
    hint = serializers.CharField(allow_null=True)
