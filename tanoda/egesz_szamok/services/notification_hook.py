"""
Parent Notification Hook Service
================================

Integrates learning events with the parent notification system.
MASTER_SPEC: Policy-vezérelt notifications.

Notification triggers:
- Level completion
- Sustained regression (consecutive failures)
- Reset abuse (too many resets)
- Monetization events
"""

from typing import Optional, Dict, Any, List
from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from tanoda.models import NotificationEvent, ApprovalRequest


class NotificationPolicy:
    """Notification policies configuration"""

    # Regression: notify after this many consecutive incorrect answers
    REGRESSION_THRESHOLD = 10

    # Reset abuse: notify after this many resets in a time window
    RESET_ABUSE_THRESHOLD = 3
    RESET_ABUSE_WINDOW_HOURS = 24

    # Minimum time between notifications of same type (hours)
    NOTIFICATION_COOLDOWN_HOURS = 4


class ParentNotificationHook:
    """
    Hook into the learning system for parent notifications.
    Policy-driven: only sends notifications for significant events.
    """

    @classmethod
    @transaction.atomic
    def on_level_completed(
        cls,
        user,
        level: int,
        module: str,
        accuracy: float,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        Notify parent when child completes a level.
        """
        event_id = f"level_complete:{user.id}:{module}:{level}:{timezone.now().date()}"

        # Check if already notified today
        if NotificationEvent.objects.filter(id=event_id).exists():
            return None

        # Create notification event
        event = NotificationEvent.objects.create(
            id=event_id,
            type='level_completed',
            message=f'{user.first_name or user.email} teljesítette a {level}. szintet ({module}) {accuracy:.1f}% pontossággal!',
            timestamp=timezone.now(),
            status='delivered',
        )

        return {
            'notification_id': event_id,
            'type': 'level_completed',
            'message': event.message,
        }

    @classmethod
    @transaction.atomic
    def on_sustained_regression(
        cls,
        user,
        level: int,
        module: str,
        consecutive_errors: int,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        Notify parent when child has sustained difficulties.
        Only triggers after threshold is reached.
        """
        if consecutive_errors < NotificationPolicy.REGRESSION_THRESHOLD:
            return None

        # Check cooldown
        cooldown_time = timezone.now() - timedelta(
            hours=NotificationPolicy.NOTIFICATION_COOLDOWN_HOURS
        )
        recent = NotificationEvent.objects.filter(
            id__startswith=f"regression:{user.id}:",
            timestamp__gte=cooldown_time,
        ).exists()

        if recent:
            return None

        event_id = f"regression:{user.id}:{module}:{level}:{timezone.now().isoformat()}"

        event = NotificationEvent.objects.create(
            id=event_id,
            type='sustained_regression',
            message=f'{user.first_name or user.email} nehézségekbe ütközik a {level}. szinten ({module}). {consecutive_errors} egymást követő hibás válasz.',
            timestamp=timezone.now(),
            status='delivered',
        )

        return {
            'notification_id': event_id,
            'type': 'sustained_regression',
            'message': event.message,
        }

    @classmethod
    @transaction.atomic
    def on_level_reset(
        cls,
        user,
        level: int,
        module: str,
        new_epoch: int,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        Monitor for reset abuse.
        Notify parent if child resets too frequently.
        """
        # Count recent resets
        window_start = timezone.now() - timedelta(
            hours=NotificationPolicy.RESET_ABUSE_WINDOW_HOURS
        )

        recent_resets = NotificationEvent.objects.filter(
            id__startswith=f"reset:{user.id}:",
            timestamp__gte=window_start,
        ).count()

        # Always log the reset
        reset_id = f"reset:{user.id}:{module}:{level}:{timezone.now().isoformat()}"
        NotificationEvent.objects.create(
            id=reset_id,
            type='level_reset',
            message=f'{user.first_name or user.email} újrakezdte a {level}. szintet ({module})',
            timestamp=timezone.now(),
            status='logged',  # Not delivered, just logged
        )

        # Check for abuse
        if recent_resets >= NotificationPolicy.RESET_ABUSE_THRESHOLD - 1:
            abuse_id = f"reset_abuse:{user.id}:{timezone.now().date()}"

            if not NotificationEvent.objects.filter(id=abuse_id).exists():
                event = NotificationEvent.objects.create(
                    id=abuse_id,
                    type='reset_abuse',
                    message=f'{user.first_name or user.email} {recent_resets + 1} alkalommal újrakezdett szinteket az elmúlt {NotificationPolicy.RESET_ABUSE_WINDOW_HOURS} órában.',
                    timestamp=timezone.now(),
                    status='delivered',
                )

                return {
                    'notification_id': abuse_id,
                    'type': 'reset_abuse',
                    'message': event.message,
                    'reset_count': recent_resets + 1,
                }

        return None

    @classmethod
    @transaction.atomic
    def on_monetization_event(
        cls,
        user,
        event_type: str,
        amount: float,
        description: str,
        requires_approval: bool = False,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """
        Notify parent of monetization events.
        Some events may require parent approval.
        """
        event_id = f"money:{user.id}:{event_type}:{timezone.now().isoformat()}"

        event = NotificationEvent.objects.create(
            id=event_id,
            type='monetization',
            message=f'{user.first_name or user.email}: {description} ({amount:.2f} Ft)',
            timestamp=timezone.now(),
            status='pending' if requires_approval else 'delivered',
        )

        result = {
            'notification_id': event_id,
            'type': 'monetization',
            'message': event.message,
        }

        # Create approval request if needed
        if requires_approval:
            approval = ApprovalRequest.objects.create(
                id=f"approval:{event_id}",
                message=f'Jóváhagyás szükséges: {description} ({amount:.2f} Ft)',
                status='pending',
                event=event,
            )
            result['approval_id'] = approval.id
            result['requires_approval'] = True

        return result

    @classmethod
    def get_parent_notifications(
        cls,
        user,
        limit: int = 20,
        include_logged: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Get notifications for parent dashboard.
        """
        queryset = NotificationEvent.objects.all()

        if not include_logged:
            queryset = queryset.exclude(status='logged')

        # Filter by user (assuming notification id contains user id)
        # This is a simplification - in production you'd have a proper foreign key
        notifications = queryset.order_by('-timestamp')[:limit]

        return [
            {
                'id': n.id,
                'type': n.type,
                'message': n.message,
                'timestamp': n.timestamp.isoformat(),
                'status': n.status,
            }
            for n in notifications
        ]

    @classmethod
    def get_pending_approvals(cls, user) -> List[Dict[str, Any]]:
        """
        Get pending approval requests for parent.
        """
        approvals = ApprovalRequest.objects.filter(
            status='pending'
        ).select_related('event').order_by('-created_at')

        return [
            {
                'id': a.id,
                'message': a.message,
                'status': a.status,
                'created_at': a.created_at.isoformat(),
                'event_type': a.event.type if a.event else None,
            }
            for a in approvals
        ]
