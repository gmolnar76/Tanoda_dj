"""
Learning Engine Tests
=====================

IMPLEMENTATION PROMPT requirement:
- Tests for LearningEngine
- Tests for reset edge cases
- Tests for idempotent submit
- Tests for ledger invariants
"""

from django.test import TestCase
from django.contrib.auth import get_user_model

from ..models import (
    LearningSession,
    Task,
    Attempt,
    LevelDefinition,
    UserLevelProgress,
    GridCellState,
)
from ..services.learning_engine_v2 import LearningEngineV2
from ..services.level_engine import LevelEngine

User = get_user_model()


class LearningEngineTest(TestCase):
    """Test LearningEngine.submit_answer"""

    def setUp(self):
        """Set up test fixtures"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        # Create level definitions
        LevelDefinition.get_or_create_defaults()
        self.level1 = LevelDefinition.objects.get(level_number=1)

        # Create session
        self.session = LearningEngineV2.start_session(
            user=self.user,
            client_instance_id='test-client-1',
            mode='practice'
        )

    def test_submit_answer_correct(self):
        """Test submitting a correct answer"""
        # Create task
        task = Task.objects.create(
            task_type='multiplication',
            operand1=2,
            operand2=3,
            correct_answer=6,
            level=self.level1,
            epoch=1
        )

        # Submit correct answer
        result = LearningEngineV2.submit_answer(
            session=self.session,
            task=task,
            value=6,
            client_event_id='test-event-1'
        )

        # Assertions
        self.assertTrue(result.is_correct)
        self.assertEqual(result.correct_answer, 6)
        self.assertEqual(result.user_answer, 6)

        # Check attempt was created
        attempt = Attempt.objects.get(client_event_id='test-event-1')
        self.assertTrue(attempt.is_correct)
        self.assertEqual(attempt.answer_value, 6)

    def test_submit_answer_incorrect(self):
        """Test submitting an incorrect answer"""
        task = Task.objects.create(
            task_type='multiplication',
            operand1=2,
            operand2=3,
            correct_answer=6,
            level=self.level1,
            epoch=1
        )

        result = LearningEngineV2.submit_answer(
            session=self.session,
            task=task,
            value=5,  # Wrong answer
            client_event_id='test-event-2'
        )

        # Assertions
        self.assertFalse(result.is_correct)
        self.assertEqual(result.correct_answer, 6)
        self.assertEqual(result.user_answer, 5)

    def test_idempotent_submit(self):
        """PROMPT REQUIREMENT: Test idempotent answer submission"""
        task = Task.objects.create(
            task_type='multiplication',
            operand1=2,
            operand2=3,
            correct_answer=6,
            level=self.level1,
            epoch=1
        )

        # Submit first time
        result1 = LearningEngineV2.submit_answer(
            session=self.session,
            task=task,
            value=6,
            client_event_id='idempotent-test-1'
        )

        # Submit again with same client_event_id
        result2 = LearningEngineV2.submit_answer(
            session=self.session,
            task=task,
            value=6,
            client_event_id='idempotent-test-1'  # Same ID!
        )

        # Should return same result
        self.assertEqual(result1.is_correct, result2.is_correct)
        self.assertEqual(result1.user_answer, result2.user_answer)

        # Should only have ONE attempt
        attempts = Attempt.objects.filter(client_event_id='idempotent-test-1')
        self.assertEqual(attempts.count(), 1)


class LevelEngineTest(TestCase):
    """Test LevelEngine reset functionality"""

    def setUp(self):
        """Set up test fixtures"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        LevelDefinition.get_or_create_defaults()
        self.level1 = LevelDefinition.objects.get(level_number=1)

    def test_reset_creates_new_epoch(self):
        """PROMPT REQUIREMENT: Reset = new epoch, NOT delete"""
        # Create initial progress
        progress1 = UserLevelProgress.objects.create(
            user=self.user,
            level=self.level1,
            epoch=1,
            total_attempts=10,
            correct_attempts=8
        )

        # Reset
        progress2 = LevelEngine.reset_level(self.user, self.level1)

        # Check new epoch was created
        self.assertEqual(progress2.epoch, 2)
        self.assertEqual(progress2.total_attempts, 0)  # Fresh start

        # Old progress still exists
        progress1.refresh_from_db()
        self.assertEqual(progress1.total_attempts, 10)  # Unchanged
        self.assertEqual(progress1.epoch, 1)

    def test_full_reset(self):
        """PROMPT REQUIREMENT: Full reset = batch epoch increment"""
        # Create progress for multiple levels
        level1 = LevelDefinition.objects.get(level_number=1)
        level2 = LevelDefinition.objects.get(level_number=2)

        UserLevelProgress.objects.create(
            user=self.user,
            level=level1,
            epoch=1,
            total_attempts=5
        )
        UserLevelProgress.objects.create(
            user=self.user,
            level=level2,
            epoch=1,
            total_attempts=3
        )

        # Full reset
        new_progress_list = LevelEngine.full_reset(self.user)

        # All levels should have epoch 2
        for progress in new_progress_list:
            if progress.level in [level1, level2]:
                self.assertEqual(progress.epoch, 2)
                self.assertEqual(progress.total_attempts, 0)


class ImmutabilityTest(TestCase):
    """Test immutability invariants"""

    def setUp(self):
        """Set up test fixtures"""
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )
        LevelDefinition.get_or_create_defaults()
        level1 = LevelDefinition.objects.get(level_number=1)

        session = LearningSession.objects.create(
            user=self.user,
            client_instance_id='test',
            mode='practice'
        )

        task = Task.objects.create(
            task_type='multiplication',
            operand1=2,
            operand2=3,
            correct_answer=6,
            level=level1,
            epoch=1
        )

        self.attempt = Attempt.objects.create(
            session=session,
            user=self.user,
            level=level1,
            epoch=1,
            task=task,
            answer_value=6,
            is_correct=True,
            client_event_id='test-1'
        )

    def test_attempt_cannot_be_deleted(self):
        """PROMPT REQUIREMENT: Attempt records are NEVER deleted"""
        with self.assertRaises(PermissionError):
            self.attempt.delete()

    def test_attempt_cannot_be_modified(self):
        """Test attempt immutability"""
        self.attempt.answer_value = 999

        with self.assertRaises(PermissionError):
            self.attempt.save()
