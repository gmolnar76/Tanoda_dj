"""
Learning Engine Service
=======================

IMPLEMENTATION PROMPT specification:
submit_answer(session, task, value, client_event_id) -> StateDTO

Steps:
1. Idempotency check via client_event_id
2. Correctness evaluation
3. Create Attempt
4. Update GridCellState (via GridEngine)
5. Update UserLevelProgress (via LevelEngine)
6. Trigger MonetizationEngine if milestone
7. Trigger NotificationEngine if policy matches
8. Return updated state snapshot
"""

from typing import Optional, Dict, Any
from dataclasses import dataclass
from django.db import transaction

from ..models import (
    LearningSession,
    Task,
    Attempt,
    LevelDefinition,
    UserLevelProgress,
    GridCellState,
    MasteryState,
)
from .grid_engine import GridEngine
from .level_engine import LevelEngine
from .monetization_hook import MonetizationHook
from .notification_hook import ParentNotificationHook


@dataclass
class StateDTO:
    """
    PROMPT REQUIREMENT: Return type for submit_answer.

    Contains complete state snapshot after an operation.
    """
    # Answer result
    is_correct: bool
    correct_answer: int
    user_answer: int

    # Updated progress
    level_progress: Dict[str, Any]
    grid_state: Dict[str, Any]
    mastery: Dict[str, Any]

    # Events triggered
    level_completed: bool = False
    level_regressed: bool = False
    new_level: Optional[int] = None
    rewards: list = None
    notifications: list = None

    def __post_init__(self):
        if self.rewards is None:
            self.rewards = []
        if self.notifications is None:
            self.notifications = []


class LearningEngineV2:
    """
    Main orchestration service for learning sessions.

    PROMPT REQUIREMENT: Implements exact interface specified.
    All operations are deterministic and auditable.
    """

    @classmethod
    @transaction.atomic
    def submit_answer(
        cls,
        session: LearningSession,
        task: Task,
        value: int,
        client_event_id: str
    ) -> StateDTO:
        """
        PROMPT REQUIREMENT: Exact interface.

        Process an answer submission through the complete pipeline.

        Args:
            session: Active LearningSession
            task: The Task being answered
            value: User's answer
            client_event_id: Idempotency key from client

        Returns:
            StateDTO with complete state snapshot

        Raises:
            ValueError: If session is inactive or parameters invalid
        """
        user = session.user

        # STEP 1: Idempotency check
        existing_attempt = cls._check_idempotency(user, client_event_id)
        if existing_attempt:
            # Already processed, return cached state
            return cls._build_state_from_existing_attempt(existing_attempt)

        # STEP 2: Correctness evaluation
        is_correct = (value == task.correct_answer)

        # STEP 3: Create Attempt
        attempt = Attempt.objects.create(
            session=session,
            user=user,
            level=task.level,
            epoch=task.epoch,
            task=task,
            answer_value=value,
            is_correct=is_correct,
            client_event_id=client_event_id
        )

        # STEP 4: Update GridCellState (via GridEngine)
        GridEngine.update_cell_from_attempt(
            user=user,
            level=task.level,
            epoch=task.epoch,
            cell_key=task.cell_key,
            is_correct=is_correct
        )

        # STEP 5: Update UserLevelProgress (via LevelEngine)
        progress = LevelEngine.update_progress_from_attempt(
            user=user,
            level=task.level,
            epoch=task.epoch,
            is_correct=is_correct
        )

        # Initialize result
        result = StateDTO(
            is_correct=is_correct,
            correct_answer=task.correct_answer,
            user_answer=value,
            level_progress=cls._serialize_progress(progress),
            grid_state=GridEngine.get_grid_for_level(user, task.level, task.epoch),
            mastery=cls._get_mastery_state(user)
        )

        # Check for level completion
        if LevelEngine.check_completion(progress):
            result.level_completed = True
            stars = LevelEngine.award_stars(progress)

            # STEP 6: Trigger MonetizationEngine if milestone
            reward = MonetizationHook.on_level_completed(
                user=user,
                level=task.level.level_number,
                session_id=str(session.id)
            )
            if reward:
                result.rewards.append(reward)

            # STEP 7: Trigger NotificationEngine if policy matches
            notification = ParentNotificationHook.on_level_completed(
                user=user,
                level=task.level.level_number,
                module='multiplication',
                accuracy=progress.accuracy_rate
            )
            if notification:
                result.notifications.append(notification)

            # Auto-advance to next level (if not at max)
            if task.level.level_number < 10:
                result.new_level = task.level.level_number + 1

        # Check for regression
        elif LevelEngine.check_regression(progress):
            result.level_regressed = True
            if task.level.level_number > 1:
                result.new_level = task.level.level_number - 1

        # Check for streak milestones
        if progress.current_streak in [5, 10, 25, 50, 100]:
            reward = MonetizationHook.on_streak_milestone(
                user=user,
                streak=progress.current_streak,
                session_id=str(session.id)
            )
            if reward:
                result.rewards.append(reward)

        return result

    @classmethod
    def _check_idempotency(cls, user, client_event_id: str) -> Optional[Attempt]:
        """
        STEP 1: Idempotency check via client_event_id.

        Returns existing Attempt if this event was already processed.
        """
        try:
            return Attempt.objects.get(
                user=user,
                client_event_id=client_event_id
            )
        except Attempt.DoesNotExist:
            return None

    @classmethod
    def _build_state_from_existing_attempt(cls, attempt: Attempt) -> StateDTO:
        """
        Build StateDTO from an existing attempt (idempotent response).
        """
        progress = UserLevelProgress.get_or_create_current(
            attempt.user,
            attempt.level
        )

        return StateDTO(
            is_correct=attempt.is_correct,
            correct_answer=attempt.task.correct_answer,
            user_answer=attempt.answer_value,
            level_progress=cls._serialize_progress(progress),
            grid_state=GridEngine.get_grid_for_level(
                attempt.user,
                attempt.level,
                attempt.epoch
            ),
            mastery=cls._get_mastery_state(attempt.user)
        )

    @classmethod
    def _serialize_progress(cls, progress: UserLevelProgress) -> Dict[str, Any]:
        """Serialize UserLevelProgress for DTO"""
        return {
            'level': progress.level.level_number,
            'epoch': progress.epoch,
            'status': progress.status,
            'stars': progress.stars,
            'total_attempts': progress.total_attempts,
            'correct_attempts': progress.correct_attempts,
            'accuracy_rate': progress.accuracy_rate,
            'current_streak': progress.current_streak,
            'best_streak': progress.best_streak,
            'is_completed': progress.status == 'completed',
        }

    @classmethod
    def _get_mastery_state(cls, user) -> Dict[str, Any]:
        """Get or create mastery state for user"""
        mastery, _ = MasteryState.objects.get_or_create(
            user=user,
            module='multiplication',
            defaults={'stars': 0}
        )

        return {
            'stars': mastery.stars,
            'completed_levels': mastery.completed_levels,
            'total_attempts': mastery.total_attempts,
            'total_correct': mastery.total_correct,
            'overall_accuracy': mastery.overall_accuracy,
            'badges': mastery.badges,
        }

    @classmethod
    @transaction.atomic
    def start_session(
        cls,
        user,
        client_instance_id: str,
        mode: str = 'practice'
    ) -> LearningSession:
        """
        Start a new learning session.

        Args:
            user: User object
            client_instance_id: Client browser/tab identifier
            mode: Session mode (practice/score/challenge)

        Returns:
            New LearningSession
        """
        session = LearningSession.objects.create(
            user=user,
            client_instance_id=client_instance_id,
            mode=mode
        )
        return session

    @classmethod
    @transaction.atomic
    def end_session(cls, session: LearningSession) -> None:
        """End a learning session"""
        session.end_session()
