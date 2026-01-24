"""
vNext Learning System Models
============================

MASTER_SPEC v1.0 compliant event-sourced architecture.
Core principles:
- Event-first: System is event-driven, not UI-state based
- Ledger-first: All financial operations go through ledger
- Reset ≠ Delete: Reset creates new epoch, preserves history
- Replay-capable: Any state can be recalculated from events
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model
from uuid import uuid4
import json

User = get_user_model()


class LearningModule(models.TextChoices):
    """Available learning modules - extensible"""
    MULTIPLICATION = 'multiplication', 'Szorzás'
    DIVISION = 'division', 'Osztás'
    FRACTIONS = 'fractions', 'Törtek'


class LearningMode(models.TextChoices):
    """Learning session modes"""
    PRACTICE = 'practice', 'Gyakorlás'
    SCORE = 'score', 'Pontozás'
    CHALLENGE = 'challenge', 'Kihívás'


class EventType(models.TextChoices):
    """Canonical learning events - IMMUTABLE after definition"""
    SESSION_STARTED = 'SESSION_STARTED', 'Session Started'
    TASK_NEXT_REQUESTED = 'TASK_NEXT_REQUESTED', 'Next Task Requested'
    ANSWER_SUBMITTED = 'ANSWER_SUBMITTED', 'Answer Submitted'
    LEVEL_RESET_REQUESTED = 'LEVEL_RESET_REQUESTED', 'Level Reset Requested'
    FULL_RESET_REQUESTED = 'FULL_RESET_REQUESTED', 'Full Reset Requested'
    MODE_CHANGED = 'MODE_CHANGED', 'Mode Changed'
    SESSION_ENDED = 'SESSION_ENDED', 'Session Ended'
    MODULE_CHANGED = 'MODULE_CHANGED', 'Module Changed'
    LEVEL_COMPLETED = 'LEVEL_COMPLETED', 'Level Completed'
    STREAK_MILESTONE = 'STREAK_MILESTONE', 'Streak Milestone'
    CHALLENGE_STARTED = 'CHALLENGE_STARTED', 'Challenge Started'
    CHALLENGE_ENDED = 'CHALLENGE_ENDED', 'Challenge Ended'


class CellState(models.TextChoices):
    """Pythagoras cell states - pedagogically ordered"""
    UNSEEN = 'unseen', 'Nem látott'
    INCORRECT_RECENT = 'incorrect_recent', 'Nemrég hibás'
    CORRECT_ONCE = 'correct_once', 'Egyszer helyes'
    CORRECT_STABLE = 'correct_stable', 'Stabilan helyes'
    MASTERED = 'mastered', 'Elsajátított'


class LearningSession(models.Model):
    """
    Active learning session - represents a user's current learning context.
    Not event-sourced itself, but tracks current state derived from events.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='learning_sessions_vnext'
    )

    active_module = models.CharField(
        max_length=32,
        choices=LearningModule.choices,
        default=LearningModule.MULTIPLICATION
    )

    mode = models.CharField(
        max_length=16,
        choices=LearningMode.choices,
        default=LearningMode.PRACTICE
    )

    current_level = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )

    # Current task state (derived, can be recomputed)
    current_task_data = models.JSONField(
        default=dict,
        blank=True,
        help_text="Current task: {operand1, operand2, operation, ...}"
    )

    is_active = models.BooleanField(default=True)

    started_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(auto_now=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Learning Session (vNext)"
        verbose_name_plural = "Learning Sessions (vNext)"
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', 'is_active']),
            models.Index(fields=['user', 'active_module']),
        ]

    def __str__(self):
        return f"Session {self.id} - {self.user} ({self.active_module})"

    def end_session(self):
        """End the session"""
        from django.utils import timezone
        self.is_active = False
        self.ended_at = timezone.now()
        self.save()


class LearningEvent(models.Model):
    """
    Immutable event log - the source of truth.
    INVARIANT: Never update or delete events.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

    session = models.ForeignKey(
        LearningSession,
        on_delete=models.CASCADE,
        related_name='events'
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='learning_events_vnext'
    )

    event_type = models.CharField(
        max_length=32,
        choices=EventType.choices,
        db_index=True
    )

    # Idempotency support
    client_event_id = models.CharField(
        max_length=64,
        unique=True,
        db_index=True,
        help_text="Client-provided idempotency key"
    )

    # Event payload - flexible JSON for different event types
    payload = models.JSONField(
        default=dict,
        help_text="Event-specific data"
    )

    # Context at time of event
    module = models.CharField(
        max_length=32,
        choices=LearningModule.choices
    )

    level = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)]
    )

    epoch = models.IntegerField(
        default=1,
        help_text="Reset epoch for this level"
    )

    mode = models.CharField(
        max_length=16,
        choices=LearningMode.choices
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Learning Event"
        verbose_name_plural = "Learning Events"
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['session', 'event_type']),
            models.Index(fields=['user', 'module', 'level', 'epoch']),
        ]

    def __str__(self):
        return f"{self.event_type} - {self.user} @ {self.created_at}"

    def delete(self, *args, **kwargs):
        """BLOCKED - Events are immutable"""
        raise PermissionError("LearningEvent cannot be deleted (immutable)")

    def save(self, *args, **kwargs):
        """Block updates after creation"""
        if self.pk and LearningEvent.objects.filter(pk=self.pk).exists():
            raise PermissionError("LearningEvent cannot be modified (immutable)")
        super().save(*args, **kwargs)


class Attempt(models.Model):
    """
    Individual answer attempt - immutable record.
    INVARIANT: Never deleted, only new attempts created.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

    event = models.OneToOneField(
        LearningEvent,
        on_delete=models.CASCADE,
        related_name='attempt',
        help_text="The ANSWER_SUBMITTED event that created this attempt"
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attempts_vnext'
    )

    session = models.ForeignKey(
        LearningSession,
        on_delete=models.CASCADE,
        related_name='attempts'
    )

    # Task details
    module = models.CharField(max_length=32, choices=LearningModule.choices)
    level = models.IntegerField()
    epoch = models.IntegerField(default=1)

    # Multiplication-specific (can be extended for other modules)
    operand1 = models.IntegerField()
    operand2 = models.IntegerField()
    correct_answer = models.IntegerField()
    user_answer = models.IntegerField()

    is_correct = models.BooleanField()

    # Timing
    response_time_ms = models.IntegerField(
        null=True,
        blank=True,
        help_text="Time taken to answer in milliseconds"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Attempt"
        verbose_name_plural = "Attempts"
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['user', 'module', 'level', 'epoch']),
            models.Index(fields=['user', 'is_correct', 'created_at']),
            models.Index(fields=['operand1', 'operand2']),
        ]

    def __str__(self):
        status = "✓" if self.is_correct else "✗"
        return f"{status} {self.operand1}×{self.operand2}={self.user_answer} ({self.user})"

    def delete(self, *args, **kwargs):
        """BLOCKED - Attempts are immutable"""
        raise PermissionError("Attempt cannot be deleted (immutable)")


class UserLevelProgress(models.Model):
    """
    Per-user, per-module, per-level progress with epoch tracking.
    Reset creates new epoch, preserves history.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='level_progress_vnext'
    )

    module = models.CharField(max_length=32, choices=LearningModule.choices)
    level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    epoch = models.IntegerField(default=1, help_text="Current epoch (incremented on reset)")

    # Derived statistics (can be recomputed from attempts)
    total_attempts = models.IntegerField(default=0)
    correct_attempts = models.IntegerField(default=0)
    accuracy_rate = models.FloatField(default=0.0)

    # Mastery tracking
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Streak tracking (consecutive correct answers)
    current_streak = models.IntegerField(default=0)
    best_streak = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User Level Progress"
        verbose_name_plural = "User Level Progress"
        unique_together = ['user', 'module', 'level', 'epoch']
        indexes = [
            models.Index(fields=['user', 'module', 'level']),
        ]

    def __str__(self):
        return f"{self.user} - {self.module} L{self.level} E{self.epoch}: {self.accuracy_rate:.1f}%"

    def update_from_attempt(self, is_correct: bool):
        """Update statistics after an attempt"""
        self.total_attempts += 1
        if is_correct:
            self.correct_attempts += 1
            self.current_streak += 1
            if self.current_streak > self.best_streak:
                self.best_streak = self.current_streak
        else:
            self.current_streak = 0

        self.accuracy_rate = (self.correct_attempts / self.total_attempts) * 100
        self.save()

    def reset(self):
        """Create new epoch (preserves old data in history)"""
        # Create a new progress record with incremented epoch
        new_progress = UserLevelProgress.objects.create(
            user=self.user,
            module=self.module,
            level=self.level,
            epoch=self.epoch + 1
        )
        return new_progress

    @classmethod
    def get_or_create_current(cls, user, module, level):
        """Get or create the current epoch progress for a user/module/level"""
        # Get the highest epoch for this user/module/level
        latest = cls.objects.filter(
            user=user,
            module=module,
            level=level
        ).order_by('-epoch').first()

        if latest:
            return latest

        # Create first epoch
        return cls.objects.create(
            user=user,
            module=module,
            level=level,
            epoch=1
        )


class GridCellState(models.Model):
    """
    Pythagoras table cell state per user/module/epoch.
    Tracks mastery of individual multiplication facts.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='grid_cells_vnext'
    )

    module = models.CharField(max_length=32, choices=LearningModule.choices)
    level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    epoch = models.IntegerField(default=1)

    # Cell coordinates (1-10 for basic, can extend)
    row = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    col = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])

    state = models.CharField(
        max_length=20,
        choices=CellState.choices,
        default=CellState.UNSEEN
    )

    # Statistics for this cell
    attempts = models.IntegerField(default=0)
    correct = models.IntegerField(default=0)
    last_attempt_at = models.DateTimeField(null=True, blank=True)

    # Consecutive correct answers for mastery
    consecutive_correct = models.IntegerField(default=0)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Grid Cell State"
        verbose_name_plural = "Grid Cell States"
        unique_together = ['user', 'module', 'level', 'epoch', 'row', 'col']
        indexes = [
            models.Index(fields=['user', 'module', 'epoch']),
            models.Index(fields=['user', 'state']),
        ]

    def __str__(self):
        return f"{self.row}×{self.col} = {self.state} ({self.user})"

    def update_from_attempt(self, is_correct: bool):
        """Update cell state based on attempt result"""
        from django.utils import timezone

        self.attempts += 1
        self.last_attempt_at = timezone.now()

        if is_correct:
            self.correct += 1
            self.consecutive_correct += 1

            # State progression based on consecutive correct answers
            if self.consecutive_correct >= 5:
                self.state = CellState.MASTERED
            elif self.consecutive_correct >= 3:
                self.state = CellState.CORRECT_STABLE
            elif self.consecutive_correct >= 1:
                self.state = CellState.CORRECT_ONCE
        else:
            self.consecutive_correct = 0
            self.state = CellState.INCORRECT_RECENT

        self.save()

    @classmethod
    def get_or_create_cell(cls, user, module, level, epoch, row, col):
        """Get or create a cell state"""
        cell, created = cls.objects.get_or_create(
            user=user,
            module=module,
            level=level,
            epoch=epoch,
            row=row,
            col=col,
            defaults={'state': CellState.UNSEEN}
        )
        return cell


class MasteryState(models.Model):
    """
    Per-user overall mastery state for a module.
    Tracks stars, badges, and achievements.
    """
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='mastery_states_vnext'
    )

    module = models.CharField(max_length=32, choices=LearningModule.choices)

    # Star system (0-5)
    stars = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(5)]
    )

    # Completed levels
    completed_levels = models.JSONField(
        default=list,
        help_text="List of completed level numbers"
    )

    # Total statistics (derived)
    total_attempts = models.IntegerField(default=0)
    total_correct = models.IntegerField(default=0)
    overall_accuracy = models.FloatField(default=0.0)

    # Time-based stats
    total_practice_time_seconds = models.IntegerField(default=0)

    # Achievements/badges earned
    badges = models.JSONField(
        default=list,
        help_text="List of earned badge IDs"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Mastery State"
        verbose_name_plural = "Mastery States"
        unique_together = ['user', 'module']

    def __str__(self):
        return f"{self.user} - {self.module}: {self.stars}⭐"

    def recalculate_stars(self):
        """Recalculate stars based on completed levels"""
        completed_count = len(self.completed_levels)
        # 2 levels per star
        self.stars = min(5, completed_count // 2)
        self.save()
