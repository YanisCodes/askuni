from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Sum
from .models import Question, Answer, Module, Resource, QuestionVote, AnswerVote
from .serializers import (
    QuestionListSerializer, QuestionDetailSerializer,
    AnswerSerializer, ModuleSerializer, ResourceSerializer
)
from notifications_app.models import Notification


@api_view(['GET', 'POST'])
def question_list(request):
    if request.method == 'GET':
        questions = Question.objects.select_related('author', 'module').prefetch_related('answers').all()
        serializer = QuestionListSerializer(questions, many=True, context={'request': request})
        return Response(serializer.data)

    serializer = QuestionListSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(author=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def question_detail(request, pk):
    try:
        question = Question.objects.select_related('author', 'module').prefetch_related('answers__author').get(pk=pk)
    except Question.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = QuestionDetailSerializer(question, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
def add_answer(request, pk):
    try:
        question = Question.objects.get(pk=pk)
    except Question.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AnswerSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    answer = serializer.save(author=request.user, question=question)

    if question.author != request.user:
        name = request.user.first_name or request.user.username
        Notification.objects.create(
            user=question.author,
            message=f"{name} answered your question",
            question=question,
        )

    return Response(AnswerSerializer(answer, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def vote_question(request, pk):
    try:
        question = Question.objects.get(pk=pk)
    except Question.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    value = request.data.get('value')
    if value not in (1, -1):
        return Response({'detail': 'value must be 1 or -1'}, status=status.HTTP_400_BAD_REQUEST)

    vote, created = QuestionVote.objects.get_or_create(
        question=question, user=request.user,
        defaults={'value': value}
    )

    if not created:
        if vote.value == value:
            vote.delete()
            user_vote = 0
        else:
            vote.value = value
            vote.save()
            user_vote = value
    else:
        user_vote = value

    vote_count = question.votes.aggregate(total=Sum('value'))['total'] or 0
    return Response({'vote_count': vote_count, 'user_vote': user_vote})


@api_view(['POST'])
def vote_answer(request, pk):
    try:
        answer = Answer.objects.get(pk=pk)
    except Answer.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    value = request.data.get('value')
    if value not in (1, -1):
        return Response({'detail': 'value must be 1 or -1'}, status=status.HTTP_400_BAD_REQUEST)

    vote, created = AnswerVote.objects.get_or_create(
        answer=answer, user=request.user,
        defaults={'value': value}
    )

    if not created:
        if vote.value == value:
            vote.delete()
            user_vote = 0
        else:
            vote.value = value
            vote.save()
            user_vote = value
    else:
        user_vote = value

    vote_count = answer.votes.aggregate(total=Sum('value'))['total'] or 0
    return Response({'vote_count': vote_count, 'user_vote': user_vote})


@api_view(['GET'])
def module_list(request):
    modules = Module.objects.all()
    return Response(ModuleSerializer(modules, many=True).data)


@api_view(['GET'])
def resource_list(request):
    resources = Resource.objects.all()
    return Response(ResourceSerializer(resources, many=True).data)
