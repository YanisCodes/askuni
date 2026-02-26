from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    question_id = serializers.PrimaryKeyRelatedField(source='question', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'message', 'question_id', 'is_read', 'created_at']
        read_only_fields = ['id', 'message', 'question_id', 'created_at']
