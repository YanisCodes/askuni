from django.db import models
from django.conf import settings
from qa.models import Module


class StudySession(models.Model):
    STATUS_CHOICES = [
        ('upcoming', 'Upcoming'),
        ('live', 'Live'),
        ('ended', 'Ended'),
    ]
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='sessions')
    chapter = models.CharField(max_length=255, blank=True, default='')
    date = models.DateField()
    time_slot = models.CharField(max_length=50)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_sessions')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='joined_sessions', blank=True)
    max_participants = models.IntegerField(default=5)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='upcoming')
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    host_peer_id = models.CharField(max_length=100, blank=True, default='')
    active_peer_ids = models.JSONField(default=dict, blank=True)  # {user_id: peer_id} for mesh networking
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.module.code} - {self.chapter} ({self.date})"


class ChatMessage(models.Model):
    MESSAGE_TYPE_CHOICES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
    ]
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    content = models.TextField(blank=True, default='')
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='text')
    file_url = models.URLField(blank=True, default='')
    file_name = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Msg by {self.user} in session {self.session_id}"


class FocusScore(models.Model):
    session = models.ForeignKey(StudySession, on_delete=models.CASCADE, related_name='focus_scores')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='focus_scores')
    score = models.IntegerField()
    focused_seconds = models.IntegerField(default=0)
    distracted_seconds = models.IntegerField(default=0)
    phone_alerts_count = models.IntegerField(default=0)
    duration_seconds = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('session', 'user')

    def __str__(self):
        return f"{self.user} score {self.score} in session {self.session_id}"
