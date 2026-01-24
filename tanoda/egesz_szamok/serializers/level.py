"""
Level Serializers
=================

Serializers for level management, progress tracking, and mode/module switching.
"""

from rest_framework import serializers

from ..models import LearningMode, LearningModule


class LevelInfoSerializer(serializers.Serializer):
    """Serializer for level information"""
    level = serializers.IntegerField()
    description = serializers.CharField()
    min_operand = serializers.IntegerField(required=False)
    max_operand = serializers.IntegerField(required=False)
    total_cells = serializers.IntegerField(required=False)
    includes_negative = serializers.BooleanField(required=False)


class LevelProgressSerializer(serializers.Serializer):
    """Serializer for level progress"""
    total_attempts = serializers.IntegerField()
    correct_attempts = serializers.IntegerField()
    accuracy_rate = serializers.FloatField()
    current_streak = serializers.IntegerField()
    best_streak = serializers.IntegerField()
    is_completed = serializers.BooleanField()


class ChangeLevelSerializer(serializers.Serializer):
    """Serializer for changing level"""
    session_id = serializers.UUIDField()
    new_level = serializers.IntegerField(min_value=1, max_value=10)
    client_event_id = serializers.CharField(
        max_length=64,
        required=False,
        default=None
    )


class ChangeModeSerializer(serializers.Serializer):
    """Serializer for changing mode"""
    session_id = serializers.UUIDField()
    new_mode = serializers.ChoiceField(choices=LearningMode.choices)
    client_event_id = serializers.CharField(
        max_length=64,
        required=False,
        default=None
    )


class ChangeModuleSerializer(serializers.Serializer):
    """
    IMPLEMENTATION MAP v1.1: Module switching serializer
    """
    session_id = serializers.UUIDField()
    new_module = serializers.ChoiceField(choices=LearningModule.choices)
    client_event_id = serializers.CharField(
        max_length=64,
        required=False,
        default=None
    )


class ResetLevelSerializer(serializers.Serializer):
    """Serializer for resetting a level"""
    session_id = serializers.UUIDField()
    level = serializers.IntegerField(
        min_value=1,
        max_value=10,
        required=False,
        allow_null=True
    )
    client_event_id = serializers.CharField(
        max_length=64,
        required=False,
        default=None
    )
