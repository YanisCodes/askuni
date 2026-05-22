from django.db import models
from django.conf import settings


class Module(models.Model):
    """A course module that questions and sessions are grouped under."""

    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.code} - {self.name}"


class Question(models.Model):
    """A student-authored question posted to a module's Q&A thread."""

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
    """A response to a Question, optionally voted on by peers."""

    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    content = models.TextField()
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='answers')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Answer to: {self.question.title}"


class QuestionVote(models.Model):
    """An upvote or downvote cast by a user on a question."""

    VOTE_CHOICES = [(1, 'Upvote'), (-1, 'Downvote')]
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='question_votes')
    value = models.SmallIntegerField(choices=VOTE_CHOICES)

    class Meta:
        unique_together = ('question', 'user')


class AnswerVote(models.Model):
    """An upvote or downvote cast by a user on an answer."""

    VOTE_CHOICES = [(1, 'Upvote'), (-1, 'Downvote')]
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, related_name='votes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='answer_votes')
    value = models.SmallIntegerField(choices=VOTE_CHOICES)

    class Meta:
        unique_together = ('answer', 'user')


class Resource(models.Model):
    """A recommended learning resource (book, video, etc.) linked to a module."""

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='resources')
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    type = models.CharField(max_length=50, default='book')

    def __str__(self):
        return self.title
