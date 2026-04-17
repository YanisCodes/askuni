from rest_framework import serializers
from .models import StudySession, ChatMessage, FocusScore
from users.serializers import UserSerializer
from qa.serializers import ModuleSerializer


class SessionListSerializer(serializers.ModelSerializer):
    module = ModuleSerializer(read_only=True)
    module_id = serializers.IntegerField(write_only=True)
    creator = UserSerializer(read_only=True)
    participant_ids = serializers.PrimaryKeyRelatedField(
        source='participants', many=True, read_only=True
    )

    class Meta:
        model = StudySession
        fields = [
            'id', 'module', 'module_id', 'chapter', 'date', 'time_slot',
            'creator', 'participant_ids', 'max_participants', 'status',
            'started_at', 'ended_at', 'host_peer_id', 'created_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'status', 'started_at', 'ended_at', 'host_peer_id']


class SessionDetailSerializer(serializers.ModelSerializer):
    module = ModuleSerializer(read_only=True)
    module_id = serializers.IntegerField(write_only=True, required=False)
    creator = UserSerializer(read_only=True)
    participant_ids = serializers.PrimaryKeyRelatedField(
        source='participants', many=True, read_only=True
    )
    participants = UserSerializer(many=True, read_only=True)

    class Meta:
        model = StudySession
        fields = [
            'id', 'module', 'module_id', 'chapter', 'date', 'time_slot',
            'creator', 'participant_ids', 'participants', 'max_participants',
            'status', 'started_at', 'ended_at', 'host_peer_id', 'created_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at', 'status', 'started_at', 'ended_at', 'host_peer_id']


class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'session', 'user', 'content', 'message_type', 'file_url', 'file_name', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class FocusScoreSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FocusScore
        fields = ['id', 'session', 'user', 'score', 'focused_seconds', 'distracted_seconds', 'phone_alerts_count', 'duration_seconds', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
