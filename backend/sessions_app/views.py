from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from .models import StudySession, ChatMessage, FocusScore
from .serializers import (
    SessionListSerializer, SessionDetailSerializer,
    ChatMessageSerializer, FocusScoreSerializer
)
from notifications_app.models import Notification


@api_view(['GET', 'POST'])
def session_list(request):
    if request.method == 'GET':
        sessions = StudySession.objects.select_related('module', 'creator').prefetch_related('participants').all()
        serializer = SessionListSerializer(sessions, many=True)
        return Response(serializer.data)

    serializer = SessionListSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    session = serializer.save(creator=request.user)
    session.participants.add(request.user)
    return Response(SessionListSerializer(session).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def session_detail(request, pk):
    try:
        session = StudySession.objects.select_related('module', 'creator').prefetch_related('participants').get(pk=pk)
    except StudySession.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response(SessionDetailSerializer(session).data)


@api_view(['POST'])
def join_session(request, pk):
    try:
        session = StudySession.objects.prefetch_related('participants').get(pk=pk)
    except StudySession.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user in session.participants.all():
        return Response({'detail': 'Already joined'}, status=status.HTTP_400_BAD_REQUEST)
    if session.participants.count() >= session.max_participants:
        return Response({'detail': 'Session is full'}, status=status.HTTP_400_BAD_REQUEST)

    session.participants.add(request.user)

    if session.creator != request.user:
        name = request.user.first_name or request.user.username
        Notification.objects.create(
            user=session.creator,
            message=f"{name} joined your study session",
        )

    return Response(SessionDetailSerializer(session).data)


@api_view(['POST'])
def leave_session(request, pk):
    try:
        session = StudySession.objects.prefetch_related('participants').get(pk=pk)
    except StudySession.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user not in session.participants.all():
        return Response({'detail': 'Not a participant'}, status=status.HTTP_400_BAD_REQUEST)

    session.participants.remove(request.user)
    return Response(SessionDetailSerializer(session).data)


@api_view(['POST'])
def start_session(request, pk):
    try:
        session = StudySession.objects.get(pk=pk)
    except StudySession.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != session.creator:
        return Response({'detail': 'Only the creator can start the session'}, status=status.HTTP_403_FORBIDDEN)

    if session.status != 'upcoming':
        return Response({'detail': 'Session cannot be started'}, status=status.HTTP_400_BAD_REQUEST)

    host_peer_id = request.data.get('host_peer_id', '')
    if not host_peer_id:
        return Response({'detail': 'host_peer_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    session.status = 'live'
    session.started_at = timezone.now()
    session.host_peer_id = host_peer_id
    session.save()

    for participant in session.participants.exclude(id=request.user.id):
        name = request.user.first_name or request.user.username
        Notification.objects.create(
            user=participant,
            message=f"{name} started the study session! Join now",
            question=None,
        )

    return Response(SessionDetailSerializer(session).data)


@api_view(['POST'])
def end_session(request, pk):
    try:
        session = StudySession.objects.get(pk=pk)
    except StudySession.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != session.creator:
        return Response({'detail': 'Only the creator can end the session'}, status=status.HTTP_403_FORBIDDEN)

    if session.status != 'live':
        return Response({'detail': 'Session is not live'}, status=status.HTTP_400_BAD_REQUEST)

    session.status = 'ended'
    session.ended_at = timezone.now()
    session.host_peer_id = ''
    session.save()

    return Response(SessionDetailSerializer(session).data)


@api_view(['GET', 'POST'])
def chat_messages(request, pk):
    try:
        session = StudySession.objects.get(pk=pk)
    except StudySession.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        messages = ChatMessage.objects.filter(session=session).select_related('user')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    if request.user not in session.participants.all():
        return Response({'detail': 'Not a participant'}, status=status.HTTP_403_FORBIDDEN)

    serializer = ChatMessageSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(session=session, user=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def submit_focus_score(request, pk):
    try:
        session = StudySession.objects.get(pk=pk)
    except StudySession.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user not in session.participants.all():
        return Response({'detail': 'Not a participant'}, status=status.HTTP_403_FORBIDDEN)

    score, created = FocusScore.objects.update_or_create(
        session=session,
        user=request.user,
        defaults={
            'score': request.data.get('score', 0),
            'focused_seconds': request.data.get('focused_seconds', 0),
            'distracted_seconds': request.data.get('distracted_seconds', 0),
            'phone_alerts_count': request.data.get('phone_alerts_count', 0),
            'duration_seconds': request.data.get('duration_seconds', 0),
        }
    )

    return Response(FocusScoreSerializer(score).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def session_focus_scores(request, pk):
    try:
        session = StudySession.objects.get(pk=pk)
    except StudySession.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    scores = FocusScore.objects.filter(session=session).select_related('user')
    serializer = FocusScoreSerializer(scores, many=True)
    return Response(serializer.data)
