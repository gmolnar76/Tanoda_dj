"""
Event Processor Service
=======================

Processes learning events and updates derived state.
MASTER_SPEC: Event-first architecture
"""

from typing import Optional, Dict, Any
from django.db import transaction
from django.utils import timezone

from ..models_vnext import (
    LearningSession,
    LearningEvent,
    Attempt,
    UserLevelProgress,
    GridCellState,
    MasteryState,
    EventType,
    LearningModule,
    CellState,
)


class EventProcessor:
    """
    Process learning events and update derived state.
    All state changes flow through events - this is the core of event sourcing.
    """

    # Accuracy threshold for level completion
    LEVEL_COMPLETION_THRESHOLD = 0.80  # 80%
    LEVEL_COMPLETION_MIN_ATTEMPTS = 20

    # Accuracy threshold for level regression
    LEVEL_REGRESSION_THRESHOLD = 0.50  # 50%
    LEVEL_REGRESSION_MIN_ATTEMPTS = 10

    @classmethod
    @transaction.atomic
    def process_event(cls, event: LearningEvent) -> Dict[str, Any]:
        """
        Process a learning event and return any side effects.

        Args:
            event: The learning event to process

        Returns:
            Dict with side effects: {
                'level_completed': bool,
                'level_regressed': bool,
                'new_level': Optional[int],
                'streak_milestone': Optional[int],
                'rewards': list,
                'notifications': list,
            }
        """
        result = {
            'level_completed': False,
            'level_regressed': False,
            'new_level': None,
            'streak_milestone': None,
            'rewards': [],
            'notifications': [],
        }

        handler = cls._get_event_handler(event.event_type)
        if handler:
            handler_result = handler(event)
            result.update(handler_result or {})

        return result

    @classmethod
    def _get_event_handler(cls, event_type: str):
        """Get the handler for an event type"""
        handlers = {
            EventType.SESSION_STARTED: cls._handle_session_started,
            EventType.TASK_NEXT_REQUESTED: cls._handle_task_next_requested,
            EventType.ANSWER_SUBMITTED: cls._handle_answer_submitted,
            EventType.LEVEL_RESET_REQUESTED: cls._handle_level_reset,
            EventType.FULL_RESET_REQUESTED: cls._handle_full_reset,
            EventType.MODE_CHANGED: cls._handle_mode_changed,
            EventType.SESSION_ENDED: cls._handle_session_ended,
            EventType.MODULE_CHANGED: cls._handle_module_changed,
        }
        return handlers.get(event_type)

    @classmethod
    def _handle_session_started(cls, event: LearningEvent) -> Dict[str, Any]:
        """Handle session start event"""
        # Ensure mastery state exists
        MasteryState.objects.get_or_create(
            user=event.user,
            module=event.module,
            defaults={'stars': 0}
        )

        # Ensure level progress exists
        UserLevelProgress.get_or_create_current(
            user=event.user,
            module=event.module,
            level=event.level
        )

        return {}

    @classmethod
    def _handle_task_next_requested(cls, event: LearningEvent) -> Dict[str, Any]:
        """Handle next task request - mostly for logging"""
        return {}

    @classmethod
    def _handle_answer_submitted(cls, event: LearningEvent) -> Dict[str, Any]:
        """Handle answer submission - core learning event"""
        payload = event.payload
        result = {
            'level_completed': False,
            'level_regressed': False,
            'new_level': None,
            'streak_milestone': None,
            'rewards': [],
            'notifications': [],
        }

        # Extract attempt data from payload
        operand1 = payload.get('operand1')
        operand2 = payload.get('operand2')
        user_answer = payload.get('user_answer')
        correct_answer = payload.get('correct_answer')
        response_time_ms = payload.get('response_time_ms')
        is_correct = user_answer == correct_answer

        # Create attempt record
        attempt = Attempt.objects.create(
            event=event,
            user=event.user,
            session=event.session,
            module=event.module,
            level=event.level,
            epoch=event.epoch,
            operand1=operand1,
            operand2=operand2,
            correct_answer=correct_answer,
            user_answer=user_answer,
            is_correct=is_correct,
            response_time_ms=response_time_ms
        )

        # Update level progress
        progress = UserLevelProgress.get_or_create_current(
            user=event.user,
            module=event.module,
            level=event.level
        )
        progress.update_from_attempt(is_correct)

        # Update grid cell state
        row = abs(operand1) if operand1 else 1
        col = abs(operand2) if operand2 else 1
        if 1 <= row <= 10 and 1 <= col <= 10:
            cell = GridCellState.get_or_create_cell(
                user=event.user,
                module=event.module,
                level=event.level,
                epoch=event.epoch,
                row=row,
                col=col
            )
            cell.update_from_attempt(is_correct)

        # Update mastery state
        mastery, _ = MasteryState.objects.get_or_create(
            user=event.user,
            module=event.module
        )
        mastery.total_attempts += 1
        if is_correct:
            mastery.total_correct += 1
        mastery.overall_accuracy = (mastery.total_correct / mastery.total_attempts) * 100
        mastery.save()

        # Check for streak milestones
        milestones = [5, 10, 25, 50, 100]
        if progress.current_streak in milestones:
            result['streak_milestone'] = progress.current_streak
            result['notifications'].append({
                'type': 'streak_milestone',
                'message': f'{progress.current_streak} helyes válasz egymás után!',
                'streak': progress.current_streak
            })

        # Check for level completion
        if cls._should_complete_level(progress):
            result['level_completed'] = True
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save()

            # Update mastery completed levels
            if event.level not in mastery.completed_levels:
                mastery.completed_levels.append(event.level)
                mastery.recalculate_stars()

            # Auto-advance to next level
            if event.level < 10:
                result['new_level'] = event.level + 1
                result['notifications'].append({
                    'type': 'level_completed',
                    'message': f'Gratulálok! Teljesítetted a {event.level}. szintet!',
                    'new_level': event.level + 1
                })

            # Add reward
            result['rewards'].append({
                'type': 'level_completion',
                'level': event.level,
                'points': event.level * 100
            })

        # Check for level regression
        elif cls._should_regress_level(progress):
            if event.level > 1:
                result['level_regressed'] = True
                result['new_level'] = event.level - 1
                result['notifications'].append({
                    'type': 'level_regressed',
                    'message': f'Gyakorolj még egy kicsit! Visszaléptünk a {event.level - 1}. szintre.',
                    'new_level': event.level - 1
                })

        return result

    @classmethod
    def _handle_level_reset(cls, event: LearningEvent) -> Dict[str, Any]:
        """Handle level reset - creates new epoch"""
        # Get current progress
        current_progress = UserLevelProgress.get_or_create_current(
            user=event.user,
            module=event.module,
            level=event.level
        )

        # Create new epoch (old data preserved)
        new_progress = current_progress.reset()

        return {
            'notifications': [{
                'type': 'level_reset',
                'message': f'A {event.level}. szint újrakezdve',
                'new_epoch': new_progress.epoch
            }]
        }

    @classmethod
    def _handle_full_reset(cls, event: LearningEvent) -> Dict[str, Any]:
        """Handle full reset - resets all levels to new epochs"""
        # Reset each level progress
        for level in range(1, 11):
            current = UserLevelProgress.objects.filter(
                user=event.user,
                module=event.module,
                level=level
            ).order_by('-epoch').first()

            if current:
                current.reset()

        return {
            'notifications': [{
                'type': 'full_reset',
                'message': 'Minden szint újrakezdve'
            }]
        }

    @classmethod
    def _handle_mode_changed(cls, event: LearningEvent) -> Dict[str, Any]:
        """Handle mode change"""
        new_mode = event.payload.get('new_mode')
        return {
            'notifications': [{
                'type': 'mode_changed',
                'message': f'Mód megváltozott: {new_mode}'
            }]
        }

    @classmethod
    def _handle_session_ended(cls, event: LearningEvent) -> Dict[str, Any]:
        """Handle session end"""
        event.session.end_session()
        return {}

    @classmethod
    def _handle_module_changed(cls, event: LearningEvent) -> Dict[str, Any]:
        """Handle module change"""
        new_module = event.payload.get('new_module')

        # Ensure mastery state exists for new module
        MasteryState.objects.get_or_create(
            user=event.user,
            module=new_module,
            defaults={'stars': 0}
        )

        return {
            'notifications': [{
                'type': 'module_changed',
                'message': f'Modul megváltozott: {new_module}'
            }]
        }

    @classmethod
    def _should_complete_level(cls, progress: UserLevelProgress) -> bool:
        """Check if level should be marked as completed"""
        if progress.is_completed:
            return False

        if progress.total_attempts < cls.LEVEL_COMPLETION_MIN_ATTEMPTS:
            return False

        return progress.accuracy_rate >= (cls.LEVEL_COMPLETION_THRESHOLD * 100)

    @classmethod
    def _should_regress_level(cls, progress: UserLevelProgress) -> bool:
        """Check if user should be moved to a lower level"""
        if progress.total_attempts < cls.LEVEL_REGRESSION_MIN_ATTEMPTS:
            return False

        return progress.accuracy_rate < (cls.LEVEL_REGRESSION_THRESHOLD * 100)
