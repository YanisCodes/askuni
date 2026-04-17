from django.contrib import admin
from .models import StudySession, ChatMessage, FocusScore

admin.site.register(StudySession)
admin.site.register(ChatMessage)
admin.site.register(FocusScore)
