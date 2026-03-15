from rest_framework import serializers
from django.db.models import Sum
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
    vote_count = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = Answer
        fields = ['id', 'question_id', 'content', 'author', 'created_at', 'vote_count', 'user_vote']
        read_only_fields = ['id', 'author', 'created_at']

    def get_vote_count(self, obj):
        result = obj.votes.aggregate(total=Sum('value'))['total']
        return result or 0

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        vote = obj.votes.filter(user=request.user).first()
        return vote.value if vote else 0


class QuestionListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    module = ModuleSerializer(read_only=True)
    module_id = serializers.IntegerField(write_only=True)
    answer_count = serializers.IntegerField(source='answers.count', read_only=True)
    vote_count = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'title', 'description', 'module', 'module_id', 'author',
                  'answer_count', 'created_at', 'vote_count', 'user_vote']
        read_only_fields = ['id', 'author', 'created_at']

    def get_vote_count(self, obj):
        result = obj.votes.aggregate(total=Sum('value'))['total']
        return result or 0

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        vote = obj.votes.filter(user=request.user).first()
        return vote.value if vote else 0


class QuestionDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    module = ModuleSerializer(read_only=True)
    module_id = serializers.IntegerField(write_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    vote_count = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'title', 'description', 'module', 'module_id', 'author',
                  'answers', 'created_at', 'vote_count', 'user_vote']
        read_only_fields = ['id', 'author', 'created_at']

    def get_vote_count(self, obj):
        result = obj.votes.aggregate(total=Sum('value'))['total']
        return result or 0

    def get_user_vote(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        vote = obj.votes.filter(user=request.user).first()
        return vote.value if vote else 0
