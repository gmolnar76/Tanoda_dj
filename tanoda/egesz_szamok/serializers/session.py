"""
Session Serializers
===================

Serializers for session management endpoints.
"""

from rest_framework import serializers
from uuid import uuid4

from ..models import LearningModule, LearningMode
from .task import TaskSerializer
from .level import LevelInfoSerializer, LevelProgressSerializer
from .bootstrap import MasterySerializer


class StartSessionSerializer(serializers.Serializer):
    """Serializer for starting a new session"""
    module = serializers.ChoiceField(
        choices=LearningModule.choices,
        default=LearningModule.MULTIPLICATION
    )
    mode = serializers.ChoiceField(
        choices=LearningMode.choices,
        default=LearningMode.PRACTICE
    )
    level = serializers.IntegerField(min_value=1, max_value=10, default=1)
    client_event_id = serializers.CharField(
        max_length=64,
        required=False,
        default=None
    )

    def validate_client_event_id(self, value):
        if value is None:
            return str(uuid4())
        return value


class EndSessionSerializer(serializers.Serializer):
    """Serializer for ending a session"""
    session_id = serializers.UUIDField()
    client_event_id = serializers.CharField(
        max_length=64,
        required=False,
        default=None
    )


class SessionStateSerializer(serializers.Serializer):
    """Serializer for full session state"""
    session_id = serializers.CharField()
    active_module = serializers.CharField()
    mode = serializers.CharField()
    current_level = serializers.IntegerField()
    current_task = TaskSerializer(allow_null=True)
    is_active = serializers.BooleanField()
    started_at = serializers.CharField()
    epoch = serializers.IntegerField()
    level_progress = LevelProgressSerializer()
    mastery = MasterySerializer()
    level_info = LevelInfoSerializer()
