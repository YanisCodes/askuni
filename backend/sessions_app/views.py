from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import StudySession
from .serializers import SessionListSerializer, SessionDetailSerializer
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
