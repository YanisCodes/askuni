from django.db import models
from django.conf import settings


class Module(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Question(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='questions')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='questions')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='answers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Answer to: {self.question.title}"


class Resource(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    type = models.CharField(max_length=50, default='book')

    def __str__(self):
        return self.title
