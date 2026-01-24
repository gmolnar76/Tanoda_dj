"""
Level Engine Service
====================

IMPLEMENTATION PROMPT specification:
- Check completion
- Manage epochs
- Allow reset of ANY level independently
- Full reset = batch epoch increment
"""

from typing import Optional
from django.db import transaction
from django.utils import timezone

from ..models import LevelDefinition, UserLevelProgress, ProgressStatus


class LevelEngine:
    """
    Level progression and reset management.

    PROMPT REQUIREMENT: Reset = new epoch, NOT delete.
    """

    # Completion thresholds
    COMPLETION_ACCURACY = 0.80  # 80%
    COMPLETION_MIN_ATTEMPTS = 20

    # Regression thresholds
    REGRESSION_ACCURACY = 0.50  # 50%
    REGRESSION_MIN_ATTEMPTS = 10

    @classmethod
    @transaction.atomic
    def update_progress_from_attempt(
        cls,
        user,
        level: LevelDefinition,
        epoch: int,
        is_correct: bool
    ) -> UserLevelProgress:
        """
        Update user level progress after an attempt.

        Returns:
            Updated UserLevelProgress object
        """
        progress = UserLevelProgress.get_or_create_current(user, level)

        # Ensure we're on the right epoch
        if progress.epoch != epoch:
            # This shouldn't happen, but handle it
            progress = UserLevelProgress.objects.get_or_create(
                user=user,
                level=level,
                epoch=epoch,
                defaults={'status': ProgressStatus.NOT_STARTED}
            )[0]

        progress.update_from_attempt(is_correct)
        return progress

    @classmethod
    def check_completion(
        cls,
        progress: UserLevelProgress
    ) -> bool:
        """
        PROMPT REQUIREMENT: Check if level is completed.

        Returns:
            True if level should be marked as completed
        """
        if progress.status == ProgressStatus.COMPLETED:
            return False  # Already completed

        if progress.total_attempts < cls.COMPLETION_MIN_ATTEMPTS:
            return False  # Not enough attempts

        accuracy = progress.accuracy_rate / 100.0
        return accuracy >= cls.COMPLETION_ACCURACY

    @classmethod
    def check_regression(
        cls,
        progress: UserLevelProgress
    ) -> bool:
        """
        Check if user should regress to a lower level.

        Returns:
            True if regression is recommended
        """
        if progress.total_attempts < cls.REGRESSION_MIN_ATTEMPTS:
            return False

        accuracy = progress.accuracy_rate / 100.0
        return accuracy < cls.REGRESSION_ACCURACY

    @classmethod
    @transaction.atomic
    def reset_level(
        cls,
        user,
        level: LevelDefinition
    ) -> UserLevelProgress:
        """
        PROMPT REQUIREMENT: Reset = new epoch, preserves history.

        Args:
            user: User object
            level: LevelDefinition to reset

        Returns:
            New UserLevelProgress with incremented epoch
        """
        current_progress = UserLevelProgress.get_or_create_current(user, level)
        new_progress = current_progress.reset()
        return new_progress

    @classmethod
    @transaction.atomic
    def full_reset(cls, user) -> list[UserLevelProgress]:
        """
        PROMPT REQUIREMENT: Full reset = batch epoch increment.

        Resets all levels for a user.

        Returns:
            List of new UserLevelProgress objects
        """
        all_levels = LevelDefinition.objects.all()
        new_progress_list = []

        for level in all_levels:
            current = UserLevelProgress.objects.filter(
                user=user,
                level=level
            ).order_by('-epoch').first()

            if current:
                new_progress = current.reset()
            else:
                # Create first epoch if never started
                new_progress = UserLevelProgress.objects.create(
                    user=user,
                    level=level,
                    epoch=1,
                    status=ProgressStatus.NOT_STARTED
                )

            new_progress_list.append(new_progress)

        return new_progress_list

    @classmethod
    def get_current_level_for_user(cls, user) -> Optional[LevelDefinition]:
        """
        Get the recommended current level for a user.

        Logic:
        - First incomplete level
        - Or highest completed level
        - Or level 1
        """
        # Find first in-progress or not-started level
        progress = UserLevelProgress.objects.filter(
            user=user,
            status__in=[ProgressStatus.NOT_STARTED, ProgressStatus.IN_PROGRESS]
        ).order_by('level__level_number').first()

        if progress:
            return progress.level

        # All completed? Return highest level
        progress = UserLevelProgress.objects.filter(
            user=user,
            status=ProgressStatus.COMPLETED
        ).order_by('-level__level_number').first()

        if progress:
            return progress.level

        # Default to level 1
        return LevelDefinition.objects.filter(level_number=1).first()

    @classmethod
    def calculate_stars_for_level(cls, progress: UserLevelProgress) -> int:
        """
        Calculate stars (0-3) for a level based on performance.

        Stars:
        - 1 star: Completed (80%+)
        - 2 stars: 90%+ accuracy
        - 3 stars: 95%+ accuracy
        """
        if progress.status != ProgressStatus.COMPLETED:
            return 0

        accuracy = progress.accuracy_rate / 100.0

        if accuracy >= 0.95:
            return 3
        elif accuracy >= 0.90:
            return 2
        elif accuracy >= 0.80:
            return 1
        else:
            return 0

    @classmethod
    @transaction.atomic
    def award_stars(cls, progress: UserLevelProgress) -> int:
        """
        Award stars to a completed level.

        Returns:
            Number of stars awarded
        """
        stars = cls.calculate_stars_for_level(progress)
        progress.stars = stars
        progress.save(update_fields=['stars'])
        return stars
