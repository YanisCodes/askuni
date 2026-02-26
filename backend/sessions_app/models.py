from django.db import models
from django.conf import settings
from qa.models import Module


class StudySession(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='sessions')
    chapter = models.CharField(max_length=255, blank=True, default='')
    date = models.DateField()
    time_slot = models.CharField(max_length=50)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_sessions')
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='joined_sessions', blank=True)
    max_participants = models.IntegerField(default=5)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.module.code} - {self.chapter} ({self.date})"
