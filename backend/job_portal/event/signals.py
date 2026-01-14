#Signal handlers for the Event app.
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Event
from account.models import Follow, Notification

@receiver(post_save, sender=Event)
def create_event_notifications(sender, instance, created, **kwargs):
    if not created:
        return

    # Use the event's author field (created_by) — do NOT use created_at
    followers = Follow.objects.filter(following=instance.posted_by)

    notifications = []
    for f in followers:
        notifications.append(Notification(
            recipient=f.follower,
            sender=instance.posted_by,
            event=instance,  # pass the Event instance (or id)
            message=f"{instance.posted_by.name} posted a new event: {instance.title}"
        ))

    if notifications:
        Notification.objects.bulk_create(notifications)
