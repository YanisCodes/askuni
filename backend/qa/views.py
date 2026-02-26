from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Question, Answer, Module, Resource
from .serializers import (
    QuestionListSerializer, QuestionDetailSerializer,
    AnswerSerializer, ModuleSerializer, ResourceSerializer
)
from notifications_app.models import Notification


@api_view(['GET', 'POST'])
def question_list(request):
    if request.method == 'GET':
        questions = Question.objects.select_related('author', 'module').prefetch_related('answers').all()
        serializer = QuestionListSerializer(questions, many=True)
        return Response(serializer.data)

    serializer = QuestionListSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(author=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def question_detail(request, pk):
    try:
        question = Question.objects.select_related('author', 'module').prefetch_related('answers__author').get(pk=pk)
    except Question.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
    serializer = QuestionDetailSerializer(question)
    return Response(serializer.data)


@api_view(['POST'])
def add_answer(request, pk):
    try:
        question = Question.objects.get(pk=pk)
    except Question.DoesNotExist:
        return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = AnswerSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    answer = serializer.save(author=request.user, question=question)

    if question.author != request.user:
        name = request.user.first_name or request.user.username
        Notification.objects.create(
            user=question.author,
            message=f"{name} answered your question",
            question=question,
        )

    return Response(AnswerSerializer(answer).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def module_list(request):
    modules = Module.objects.all()
    return Response(ModuleSerializer(modules, many=True).data)


@api_view(['GET'])
def resource_list(request):
    resources = Resource.objects.all()
    return Response(ResourceSerializer(resources, many=True).data)
