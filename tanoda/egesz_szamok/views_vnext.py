"""
vNext API Views
===============

Django REST Framework views for the learning API.
All endpoints are idempotent via client_event_id.
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.db import IntegrityError

from .services import LearningEngine
from .serializers_vnext import (
    StartSessionSerializer,
    SubmitAnswerSerializer,
    NextTaskSerializer,
    ChangeLevelSerializer,
    ChangeModeSerializer,
    ChangeModuleSerializer,
    ResetLevelSerializer,
    EndSessionSerializer,
    SessionStateSerializer,
    AnswerResultSerializer,
    PythagorasGridSerializer,
    StatisticsSerializer,
)
from .models_vnext import LearningModule


class StartSessionView(APIView):
    """
    POST /api/learning/session/start/

    Start a new learning session.
    Idempotent: If session already exists, returns existing session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = StartSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        engine = LearningEngine(request.user)

        try:
            result = engine.start_session(
                module=serializer.validated_data['module'],
                mode=serializer.validated_data['mode'],
                level=serializer.validated_data['level'],
                client_event_id=serializer.validated_data.get('client_event_id'),
            )
            return Response(result, status=status.HTTP_200_OK)
        except IntegrityError:
            # Idempotency: event already processed
            session = engine.get_active_session()
            if session:
                return Response(session, status=status.HTTP_200_OK)
            return Response(
                {'error': 'Session creation failed'},
                status=status.HTTP_400_BAD_REQUEST
            )


class GetSessionView(APIView):
    """
    GET /api/learning/session/

    Get the current active session.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        engine = LearningEngine(request.user)
        session = engine.get_active_session()

        if session:
            return Response(session, status=status.HTTP_200_OK)
        return Response(
            {'session': None, 'message': 'No active session'},
            status=status.HTTP_200_OK
        )


class EndSessionView(APIView):
    """
    POST /api/learning/session/end/

    End the current session.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = EndSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        engine = LearningEngine(request.user)

        try:
            result = engine.end_session(
                session_id=str(serializer.validated_data['session_id']),
                client_event_id=serializer.validated_data.get('client_event_id'),
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class SubmitAnswerView(APIView):
    """
    POST /api/learning/answer/

    Submit an answer for the current task.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SubmitAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        engine = LearningEngine(request.user)

        try:
            result = engine.submit_answer(
                session_id=str(serializer.validated_data['session_id']),
                user_answer=serializer.validated_data['user_answer'],
                response_time_ms=serializer.validated_data.get('response_time_ms'),
                client_event_id=serializer.validated_data.get('client_event_id'),
            )
            return Response(result, status=status.HTTP_200_OK)
        except IntegrityError:
            # Idempotency: answer already submitted
            return Response(
                {'error': 'Answer already submitted', 'idempotent': True},
                status=status.HTTP_200_OK
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class NextTaskView(APIView):
    """
    POST /api/learning/task/next/

    Get the next task.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = NextTaskSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        engine = LearningEngine(request.user)

        try:
            result = engine.get_next_task(
                session_id=str(serializer.validated_data['session_id']),
                client_event_id=serializer.validated_data.get('client_event_id'),
            )
            return Response(result, status=status.HTTP_200_OK)
        except IntegrityError:
            # Idempotency: return current task
            session = engine.get_active_session()
            if session:
                return Response({
                    'task': session.get('current_task'),
                    'session_id': session.get('session_id'),
                    'level': session.get('current_level'),
                    'epoch': session.get('epoch'),
                }, status=status.HTTP_200_OK)
            return Response(
                {'error': 'No active session'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ChangeLevelView(APIView):
    """
    POST /api/learning/level/change/

    Change to a different level.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangeLevelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        engine = LearningEngine(request.user)

        try:
            result = engine.change_level(
                session_id=str(serializer.validated_data['session_id']),
                new_level=serializer.validated_data['new_level'],
                client_event_id=serializer.validated_data.get('client_event_id'),
            )
            return Response(result, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ChangeModeView(APIView):
    """
    POST /api/learning/mode/change/

    Change learning mode (practice/score/challenge).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangeModeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        engine = LearningEngine(request.user)

        try:
            result = engine.change_mode(
                session_id=str(serializer.validated_data['session_id']),
                new_mode=serializer.validated_data['new_mode'],
                client_event_id=serializer.validated_data.get('client_event_id'),
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ChangeModuleView(APIView):
    """
    POST /api/learning/module/change/

    Change active learning module.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangeModuleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        engine = LearningEngine(request.user)

        try:
            result = engine.change_module(
                session_id=str(serializer.validated_data['session_id']),
                new_module=serializer.validated_data['new_module'],
                client_event_id=serializer.validated_data.get('client_event_id'),
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class ResetLevelView(APIView):
    """
    POST /api/learning/level/reset/

    Reset a level (creates new epoch, preserves history).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ResetLevelSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        engine = LearningEngine(request.user)

        try:
            result = engine.reset_level(
                session_id=str(serializer.validated_data['session_id']),
                level=serializer.validated_data.get('level'),
                client_event_id=serializer.validated_data.get('client_event_id'),
            )
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class StatisticsView(APIView):
    """
    GET /api/learning/statistics/

    Get user statistics.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        module = request.query_params.get('module', LearningModule.MULTIPLICATION)
        engine = LearningEngine(request.user)

        result = engine.get_statistics(module=module)
        return Response(result, status=status.HTTP_200_OK)


class PythagorasGridView(APIView):
    """
    GET /api/learning/pythagoras/

    Get the Pythagoras grid state.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        module = request.query_params.get('module', LearningModule.MULTIPLICATION)
        level = request.query_params.get('level')
        level = int(level) if level else None

        engine = LearningEngine(request.user)

        result = engine.get_pythagoras_grid(module=module, level=level)
        return Response(result, status=status.HTTP_200_OK)


class LevelsInfoView(APIView):
    """
    GET /api/learning/levels/

    Get information about all levels for a module.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from .services.task_generator import TaskGenerator

        module = request.query_params.get('module', LearningModule.MULTIPLICATION)
        levels = TaskGenerator.get_all_levels(module)

        return Response({
            'module': module,
            'levels': levels
        }, status=status.HTTP_200_OK)
