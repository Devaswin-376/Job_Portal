from django.db import models
from django.conf import settings
# Create your models here.

User = settings.AUTH_USER_MODEL

class Event(models.Model):
    title = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    posted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="events")
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.title
    
    @property
    def likes_count(self):
        return self.reactions.filter(like=True).count()
    
    @property
    def dislikes_count(self):
        return self.reactions.filter(like=False).count()
    
    
class EventImage(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="event_images/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Image for {self.event.title}"
    
class EventReaction(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="event_reaction")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="reactions")
    like= models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ("user", "event")
        
    def __str__(self):
        if self.like is True:
            return f"{self.user} liked {self.event}"
        elif self.like is False:
            return f"{self.user} disliked {self.event}"
        return f"{self.user} has no reaction to {self.event}"
    
        
class EventComment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="event_comments")
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user} commented on {self.event.title}"
        