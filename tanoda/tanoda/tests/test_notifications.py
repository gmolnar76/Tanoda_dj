# TODO: Refactor tests for parent scoping and runnable test users
# import pytest
# from django.urls import reverse
# from rest_framework.test import APIClient
# from app.models import NotificationEvent, ApprovalRequest
# from django.utils import timezone
#
# @pytest.mark.django_db
# def test_ordering_and_cursor():
#     # Create events with different timestamps and ids
#     NotificationEvent.objects.create(
#         id='evt1', type='payment_link_created', message='A', timestamp=timezone.now(), status='info'
#     )
#     NotificationEvent.objects.create(
#         id='evt2', type='payment_success', message='B', timestamp=timezone.now(), status='success'
#     )
#     client = APIClient()
#     client.force_authenticate(user=...)  # Add a parent user
#     resp = client.get(reverse('parent-notifications'))
#     assert resp.status_code == 200
#     assert 'notifications' in resp.data
#
# @pytest.mark.django_db
# def test_approve_and_reject():
#     approval = ApprovalRequest.objects.create(
#         id='apr1', message='Test', status='pending', created_at=timezone.now(), event_id='evt1'
#     )
#     client = APIClient()
#     client.force_authenticate(user=...)  # Add a parent user
#     url = reverse('approval-approve', args=[approval.id])
#     resp = client.post(url, {})
#     assert resp.status_code == 200
#     assert resp.data['status'] == 'approved'
#     approval.refresh_from_db()
#     assert approval.status == 'approved'
#     # Reject
#     approval.status = 'pending'
#     approval.save()
#     url = reverse('approval-reject', args=[approval.id])
#     resp = client.post(url, {})
#     assert resp.status_code == 200
#     assert resp.data['status'] == 'rejected'
