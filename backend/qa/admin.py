from django.contrib import admin
from .models import Module, Question, Answer, Resource, QuestionVote, AnswerVote

admin.site.register(Module)
admin.site.register(Question)
admin.site.register(Answer)
admin.site.register(Resource)
admin.site.register(QuestionVote)
admin.site.register(AnswerVote)
