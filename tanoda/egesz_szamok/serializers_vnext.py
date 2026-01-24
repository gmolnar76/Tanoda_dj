"""
vNext API Serializers
=====================

DRF serializers for the learning API.
"""

from rest_framework import serializers
from uuid import uuid4

from .models_vnext import (
    LearningSession,
    LearningEvent,
    Attempt,
    UserLevelProgress,
    GridCellState,
    MasteryState,
    LearningModule,
    LearningMode,
    EventType,
    CellState,
)


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


class NextTaskSerializer(serializers.Serializer):
    """Serializer for getting next task"""
    session_id = serializers.UUIDField()
    client_event_id = serializers.CharField(
        max_length=64,
        required=False,
        default=None
    )


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
    """Serializer for changing module"""
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


class EndSessionSerializer(serializers.Serializer):
    """Serializer for ending a session"""
    session_id = serializers.UUIDField()
    client_event_id = serializers.CharField(
        max_length=64,
        required=False,
        default=None
    )


class TaskSerializer(serializers.Serializer):
    """Serializer for a task"""
    module = serializers.CharField()
    level = serializers.IntegerField()
    operand1 = serializers.IntegerField()
    operand2 = serializers.IntegerField()
    correct_answer = serializers.IntegerField(write_only=True)
    operation = serializers.CharField()
    hint = serializers.CharField(allow_null=True, required=False)


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


class MasterySerializer(serializers.Serializer):
    """Serializer for mastery state"""
    stars = serializers.IntegerField()
    completed_levels = serializers.ListField(child=serializers.IntegerField())
    overall_accuracy = serializers.FloatField()


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


class GridCellSerializer(serializers.Serializer):
    """Serializer for a grid cell"""
    row = serializers.IntegerField()
    col = serializers.IntegerField()
    product = serializers.IntegerField()
    state = serializers.CharField()
    attempts = serializers.IntegerField()
    correct = serializers.IntegerField()
    consecutive_correct = serializers.IntegerField()


class PythagorasGridSerializer(serializers.Serializer):
    """Serializer for Pythagoras grid"""
    module = serializers.CharField()
    level = serializers.IntegerField()
    epoch = serializers.IntegerField()
    max_operand = serializers.IntegerField()
    grid = serializers.ListField(
        child=serializers.ListField(child=GridCellSerializer())
    )


class LevelStatSerializer(serializers.Serializer):
    """Serializer for level statistics"""
    level = serializers.IntegerField()
    epoch = serializers.IntegerField()
    total_attempts = serializers.IntegerField()
    correct_attempts = serializers.IntegerField()
    accuracy_rate = serializers.FloatField()
    is_completed = serializers.BooleanField()
    current_streak = serializers.IntegerField()
    best_streak = serializers.IntegerField()


class StatisticsSerializer(serializers.Serializer):
    """Serializer for full statistics"""
    module = serializers.CharField()
    stars = serializers.IntegerField()
    completed_levels = serializers.ListField(child=serializers.IntegerField())
    total_attempts = serializers.IntegerField()
    total_correct = serializers.IntegerField()
    overall_accuracy = serializers.FloatField()
    badges = serializers.ListField(child=serializers.CharField())
    levels = LevelStatSerializer(many=True)
