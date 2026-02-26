from rest_framework import serializers
from .models import StudySession
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
            'creator', 'participant_ids', 'max_participants', 'created_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at']


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
            'creator', 'participant_ids', 'participants', 'max_participants', 'created_at'
        ]
        read_only_fields = ['id', 'creator', 'created_at']
