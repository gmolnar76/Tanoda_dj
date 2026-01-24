from django.db import models

class NotificationEvent(models.Model):
    id = models.CharField(primary_key=True, max_length=64)  # stable string id
    type = models.CharField(max_length=32)
    message = models.CharField(max_length=255)
    timestamp = models.DateTimeField(db_index=True)
    status = models.CharField(max_length=16)

    class Meta:
        ordering = ['-timestamp', '-id']


class ApprovalRequest(models.Model):
    id = models.CharField(primary_key=True, max_length=64)  # stable string id
    message = models.CharField(max_length=255)
    status = models.CharField(
        max_length=16,
        choices=[
            ('pending', 'pending'),
            ('approved', 'approved'),
            ('rejected', 'rejected'),
        ],
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    event = models.ForeignKey(
        NotificationEvent,
        on_delete=models.CASCADE,
        related_name='approval_requests',
    )
