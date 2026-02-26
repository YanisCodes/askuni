from rest_framework import serializers
from .models import Module, Question, Answer, Resource
from users.serializers import UserSerializer


class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'name', 'code']


class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = ['id', 'module_id', 'title', 'author', 'type']


class AnswerSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Answer
        fields = ['id', 'question_id', 'content', 'author', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class QuestionListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    module = ModuleSerializer(read_only=True)
    module_id = serializers.IntegerField(write_only=True)
    answer_count = serializers.IntegerField(source='answers.count', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'title', 'description', 'module', 'module_id', 'author', 'answer_count', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class QuestionDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    module = ModuleSerializer(read_only=True)
    module_id = serializers.IntegerField(write_only=True)
    answers = AnswerSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'title', 'description', 'module', 'module_id', 'author', 'answers', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']
