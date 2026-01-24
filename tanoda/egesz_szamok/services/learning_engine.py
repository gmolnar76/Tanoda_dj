"""
Learning Engine Service
=======================

Main orchestration service for the vNext learning system.
MASTER_SPEC: "a learning engine nem modul-specifikus, hanem modul-paraméterezett"
"""

from typing import Optional, Dict, Any
from dataclasses import asdict
from django.db import transaction
from django.utils import timezone
from uuid import uuid4

from ..models_vnext import (
    LearningSession,
    LearningEvent,
    UserLevelProgress,
    GridCellState,
    MasteryState,
    EventType,
    LearningModule,
    LearningMode,
    CellState,
)
from .task_generator import TaskGenerator, Task
from .event_processor import EventProcessor


class LearningEngine:
    """
    Main orchestration service for learning sessions.
    All operations go through events for auditability.
    """

    def __init__(self, user):
        """Initialize engine for a user"""
        self.user = user

    # =========================================================================
    # SESSION MANAGEMENT
    # =========================================================================

    @transaction.atomic
    def start_session(
        self,
        module: str = LearningModule.MULTIPLICATION,
        mode: str = LearningMode.PRACTICE,
        level: int = 1,
        client_event_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Start a new learning session.

        Returns:
            Session data and first task
        """
        client_event_id = client_event_id or str(uuid4())

        # Check for existing active session
        existing = LearningSession.objects.filter(
            user=self.user,
            is_active=True
        ).first()

        if existing:
            # Return existing session instead of creating new one
            return self._get_session_state(existing)

        # Create new session
        session = LearningSession.objects.create(
            user=self.user,
            active_module=module,
            mode=mode,
            current_level=level
        )

        # Get current epoch for this level
        progress = UserLevelProgress.get_or_create_current(
            user=self.user,
            module=module,
            level=level
        )

        # Create session started event
        event = LearningEvent.objects.create(
            session=session,
            user=self.user,
            event_type=EventType.SESSION_STARTED,
            client_event_id=client_event_id,
            module=module,
            level=level,
            epoch=progress.epoch,
            mode=mode,
            payload={
                'session_id': str(session.id),
                'initial_module': module,
                'initial_mode': mode,
                'initial_level': level,
            }
        )

        # Process the event
        EventProcessor.process_event(event)

        # Generate first task
        task = TaskGenerator.for_module(module, level, progress.epoch, self.user)
        session.current_task_data = asdict(task)
        session.save()

        return self._get_session_state(session)

    @transaction.atomic
    def end_session(
        self,
        session_id: str,
        client_event_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """End a learning session"""
        client_event_id = client_event_id or str(uuid4())

        session = LearningSession.objects.get(id=session_id, user=self.user)

        if not session.is_active:
            return {'status': 'already_ended', 'session_id': str(session.id)}

        # Get current progress
        progress = UserLevelProgress.get_or_create_current(
            user=self.user,
            module=session.active_module,
            level=session.current_level
        )

        # Create session ended event
        event = LearningEvent.objects.create(
            session=session,
            user=self.user,
            event_type=EventType.SESSION_ENDED,
            client_event_id=client_event_id,
            module=session.active_module,
            level=session.current_level,
            epoch=progress.epoch,
            mode=session.mode,
            payload={}
        )

        EventProcessor.process_event(event)

        return {'status': 'ended', 'session_id': str(session.id)}

    def get_active_session(self) -> Optional[Dict[str, Any]]:
        """Get the current active session if any"""
        session = LearningSession.objects.filter(
            user=self.user,
            is_active=True
        ).first()

        if session:
            return self._get_session_state(session)
        return None

    # =========================================================================
    # TASK OPERATIONS
    # =========================================================================

    @transaction.atomic
    def get_next_task(
        self,
        session_id: str,
        client_event_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get the next task for the session"""
        client_event_id = client_event_id or str(uuid4())

        session = LearningSession.objects.get(id=session_id, user=self.user)

        if not session.is_active:
            raise ValueError("Session is not active")

        # Get current progress
        progress = UserLevelProgress.get_or_create_current(
            user=self.user,
            module=session.active_module,
            level=session.current_level
        )

        # Create event
        event = LearningEvent.objects.create(
            session=session,
            user=self.user,
            event_type=EventType.TASK_NEXT_REQUESTED,
            client_event_id=client_event_id,
            module=session.active_module,
            level=session.current_level,
            epoch=progress.epoch,
            mode=session.mode,
            payload={}
        )

        EventProcessor.process_event(event)

        # Generate new task
        task = TaskGenerator.for_module(
            session.active_module,
            session.current_level,
            progress.epoch,
            self.user
        )

        session.current_task_data = asdict(task)
        session.save()

        return {
            'task': asdict(task),
            'session_id': str(session.id),
            'level': session.current_level,
            'epoch': progress.epoch,
        }

    @transaction.atomic
    def submit_answer(
        self,
        session_id: str,
        user_answer: int,
        response_time_ms: Optional[int] = None,
        client_event_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Submit an answer for the current task.

        Returns:
            Result including correctness, rewards, and next task
        """
        client_event_id = client_event_id or str(uuid4())

        session = LearningSession.objects.get(id=session_id, user=self.user)

        if not session.is_active:
            raise ValueError("Session is not active")

        # Get current task
        task_data = session.current_task_data
        if not task_data:
            raise ValueError("No current task")

        operand1 = task_data.get('operand1')
        operand2 = task_data.get('operand2')
        correct_answer = task_data.get('correct_answer')
        is_correct = user_answer == correct_answer

        # Get current progress
        progress = UserLevelProgress.get_or_create_current(
            user=self.user,
            module=session.active_module,
            level=session.current_level
        )

        # Create answer submitted event
        event = LearningEvent.objects.create(
            session=session,
            user=self.user,
            event_type=EventType.ANSWER_SUBMITTED,
            client_event_id=client_event_id,
            module=session.active_module,
            level=session.current_level,
            epoch=progress.epoch,
            mode=session.mode,
            payload={
                'operand1': operand1,
                'operand2': operand2,
                'correct_answer': correct_answer,
                'user_answer': user_answer,
                'response_time_ms': response_time_ms,
            }
        )

        # Process the event
        result = EventProcessor.process_event(event)

        # Handle level changes
        if result.get('new_level'):
            session.current_level = result['new_level']

        # Generate next task with potentially new level
        progress = UserLevelProgress.get_or_create_current(
            user=self.user,
            module=session.active_module,
            level=session.current_level
        )

        next_task = TaskGenerator.for_module(
            session.active_module,
            session.current_level,
            progress.epoch,
            self.user
        )

        session.current_task_data = asdict(next_task)
        session.save()

        return {
            'is_correct': is_correct,
            'correct_answer': correct_answer,
            'user_answer': user_answer,
            'next_task': asdict(next_task),
            'level': session.current_level,
            'level_completed': result.get('level_completed', False),
            'level_regressed': result.get('level_regressed', False),
            'streak_milestone': result.get('streak_milestone'),
            'rewards': result.get('rewards', []),
            'notifications': result.get('notifications', []),
            'hint': task_data.get('hint') if not is_correct else None,
        }

    # =========================================================================
    # LEVEL & MODE OPERATIONS
    # =========================================================================

    @transaction.atomic
    def change_level(
        self,
        session_id: str,
        new_level: int,
        client_event_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Manually change to a different level"""
        if not 1 <= new_level <= 10:
            raise ValueError("Level must be between 1 and 10")

        session = LearningSession.objects.get(id=session_id, user=self.user)
        old_level = session.current_level

        # Get progress for new level
        progress = UserLevelProgress.get_or_create_current(
            user=self.user,
            module=session.active_module,
            level=new_level
        )

        session.current_level = new_level
        session.save()

        # Generate task for new level
        task = TaskGenerator.for_module(
            session.active_module,
            new_level,
            progress.epoch,
            self.user
        )
        session.current_task_data = asdict(task)
        session.save()

        return {
            'old_level': old_level,
            'new_level': new_level,
            'task': asdict(task),
            'level_info': TaskGenerator.get_level_info(session.active_module, new_level),
        }

    @transaction.atomic
    def change_mode(
        self,
        session_id: str,
        new_mode: str,
        client_event_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Change learning mode"""
        client_event_id = client_event_id or str(uuid4())

        session = LearningSession.objects.get(id=session_id, user=self.user)
        old_mode = session.mode

        # Get progress
        progress = UserLevelProgress.get_or_create_current(
            user=self.user,
            module=session.active_module,
            level=session.current_level
        )

        # Create mode changed event
        event = LearningEvent.objects.create(
            session=session,
            user=self.user,
            event_type=EventType.MODE_CHANGED,
            client_event_id=client_event_id,
            module=session.active_module,
            level=session.current_level,
            epoch=progress.epoch,
            mode=new_mode,
            payload={
                'old_mode': old_mode,
                'new_mode': new_mode,
            }
        )

        EventProcessor.process_event(event)

        session.mode = new_mode
        session.save()

        return {
            'old_mode': old_mode,
            'new_mode': new_mode,
        }

    @transaction.atomic
    def reset_level(
        self,
        session_id: str,
        level: Optional[int] = None,
        client_event_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Reset a level (creates new epoch, preserves history)"""
        client_event_id = client_event_id or str(uuid4())

        session = LearningSession.objects.get(id=session_id, user=self.user)
        level = level or session.current_level

        # Get current progress
        current_progress = UserLevelProgress.get_or_create_current(
            user=self.user,
            module=session.active_module,
            level=level
        )

        # Create reset event
        event = LearningEvent.objects.create(
            session=session,
            user=self.user,
            event_type=EventType.LEVEL_RESET_REQUESTED,
            client_event_id=client_event_id,
            module=session.active_module,
            level=level,
            epoch=current_progress.epoch,
            mode=session.mode,
            payload={'reset_level': level}
        )

        result = EventProcessor.process_event(event)

        # Get new epoch progress
        new_progress = UserLevelProgress.get_or_create_current(
            user=self.user,
            module=session.active_module,
            level=level
        )

        # Generate fresh task
        task = TaskGenerator.for_module(
            session.active_module,
            level,
            new_progress.epoch,
            self.user
        )
        session.current_task_data = asdict(task)
        session.save()

        return {
            'level': level,
            'old_epoch': current_progress.epoch,
            'new_epoch': new_progress.epoch,
            'task': asdict(task),
            'notifications': result.get('notifications', []),
        }

    @transaction.atomic
    def change_module(
        self,
        session_id: str,
        new_module: str,
        client_event_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Change active learning module"""
        client_event_id = client_event_id or str(uuid4())

        session = LearningSession.objects.get(id=session_id, user=self.user)
        old_module = session.active_module

        # Get progress for new module
        progress = UserLevelProgress.get_or_create_current(
            user=self.user,
            module=new_module,
            level=session.current_level
        )

        # Create module changed event
        event = LearningEvent.objects.create(
            session=session,
            user=self.user,
            event_type=EventType.MODULE_CHANGED,
            client_event_id=client_event_id,
            module=new_module,
            level=session.current_level,
            epoch=progress.epoch,
            mode=session.mode,
            payload={
                'old_module': old_module,
                'new_module': new_module,
            }
        )

        EventProcessor.process_event(event)

        session.active_module = new_module
        session.save()

        # Generate task for new module
        task = TaskGenerator.for_module(
            new_module,
            session.current_level,
            progress.epoch,
            self.user
        )
        session.current_task_data = asdict(task)
        session.save()

        return {
            'old_module': old_module,
            'new_module': new_module,
            'task': asdict(task),
        }

    # =========================================================================
    # STATISTICS & STATE
    # =========================================================================

    def get_statistics(self, module: Optional[str] = None) -> Dict[str, Any]:
        """Get user statistics"""
        module = module or LearningModule.MULTIPLICATION

        mastery, _ = MasteryState.objects.get_or_create(
            user=self.user,
            module=module
        )

        # Get all level progress
        levels = []
        for level in range(1, 11):
            progress = UserLevelProgress.objects.filter(
                user=self.user,
                module=module,
                level=level
            ).order_by('-epoch').first()

            if progress:
                levels.append({
                    'level': level,
                    'epoch': progress.epoch,
                    'total_attempts': progress.total_attempts,
                    'correct_attempts': progress.correct_attempts,
                    'accuracy_rate': progress.accuracy_rate,
                    'is_completed': progress.is_completed,
                    'current_streak': progress.current_streak,
                    'best_streak': progress.best_streak,
                })
            else:
                levels.append({
                    'level': level,
                    'epoch': 1,
                    'total_attempts': 0,
                    'correct_attempts': 0,
                    'accuracy_rate': 0.0,
                    'is_completed': False,
                    'current_streak': 0,
                    'best_streak': 0,
                })

        return {
            'module': module,
            'stars': mastery.stars,
            'completed_levels': mastery.completed_levels,
            'total_attempts': mastery.total_attempts,
            'total_correct': mastery.total_correct,
            'overall_accuracy': mastery.overall_accuracy,
            'badges': mastery.badges,
            'levels': levels,
        }

    def get_pythagoras_grid(
        self,
        module: Optional[str] = None,
        level: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get the Pythagoras grid state"""
        module = module or LearningModule.MULTIPLICATION

        # Get the current session or use level 1
        session = LearningSession.objects.filter(
            user=self.user,
            is_active=True
        ).first()

        current_level = level or (session.current_level if session else 1)

        # Get current epoch
        progress = UserLevelProgress.objects.filter(
            user=self.user,
            module=module,
            level=current_level
        ).order_by('-epoch').first()

        current_epoch = progress.epoch if progress else 1

        # Get level range
        level_info = TaskGenerator.get_level_info(module, current_level)
        max_val = level_info.get('max_operand', 10)

        # Build grid
        grid = []
        for row in range(1, max_val + 1):
            row_data = []
            for col in range(1, max_val + 1):
                cell = GridCellState.objects.filter(
                    user=self.user,
                    module=module,
                    level=current_level,
                    epoch=current_epoch,
                    row=row,
                    col=col
                ).first()

                if cell:
                    row_data.append({
                        'row': row,
                        'col': col,
                        'product': row * col,
                        'state': cell.state,
                        'attempts': cell.attempts,
                        'correct': cell.correct,
                        'consecutive_correct': cell.consecutive_correct,
                    })
                else:
                    row_data.append({
                        'row': row,
                        'col': col,
                        'product': row * col,
                        'state': CellState.UNSEEN,
                        'attempts': 0,
                        'correct': 0,
                        'consecutive_correct': 0,
                    })
            grid.append(row_data)

        return {
            'module': module,
            'level': current_level,
            'epoch': current_epoch,
            'max_operand': max_val,
            'grid': grid,
        }

    # =========================================================================
    # PRIVATE HELPERS
    # =========================================================================

    def _get_session_state(self, session: LearningSession) -> Dict[str, Any]:
        """Get full session state"""
        # Get current progress
        progress = UserLevelProgress.objects.filter(
            user=self.user,
            module=session.active_module,
            level=session.current_level
        ).order_by('-epoch').first()

        # Get mastery
        mastery, _ = MasteryState.objects.get_or_create(
            user=self.user,
            module=session.active_module
        )

        return {
            'session_id': str(session.id),
            'active_module': session.active_module,
            'mode': session.mode,
            'current_level': session.current_level,
            'current_task': session.current_task_data,
            'is_active': session.is_active,
            'started_at': session.started_at.isoformat(),
            'epoch': progress.epoch if progress else 1,
            'level_progress': {
                'total_attempts': progress.total_attempts if progress else 0,
                'correct_attempts': progress.correct_attempts if progress else 0,
                'accuracy_rate': progress.accuracy_rate if progress else 0.0,
                'current_streak': progress.current_streak if progress else 0,
                'best_streak': progress.best_streak if progress else 0,
                'is_completed': progress.is_completed if progress else False,
            },
            'mastery': {
                'stars': mastery.stars,
                'completed_levels': mastery.completed_levels,
                'overall_accuracy': mastery.overall_accuracy,
            },
            'level_info': TaskGenerator.get_level_info(
                session.active_module,
                session.current_level
            ),
        }
