"""
Task Serializers
================

Serializers for task generation and retrieval.
"""

from rest_framework import serializers


class TaskSerializer(serializers.Serializer):
    """Serializer for a task"""
    module = serializers.CharField()
    level = serializers.IntegerField()
    operand1 = serializers.IntegerField()
    operand2 = serializers.IntegerField()
    correct_answer = serializers.IntegerField(write_only=True)
    operation = serializers.CharField()
    hint = serializers.CharField(allow_null=True, required=False)


class NextTaskSerializer(serializers.Serializer):
    """Serializer for getting next task"""
    session_id = serializers.UUIDField()
    client_event_id = serializers.CharField(
        max_length=64,
        required=False,
        default=None
    )
