"""
Bootstrap Serializers
=====================

Serializers for statistics, grid data, and initial state loading.
These are typically used for loading initial data when the app starts.
"""

from rest_framework import serializers


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


class MasterySerializer(serializers.Serializer):
    """Serializer for mastery state"""
    stars = serializers.IntegerField()
    completed_levels = serializers.ListField(child=serializers.IntegerField())
    overall_accuracy = serializers.FloatField()


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
