from rest_framework.decorators import api_view
from rest_framework.response import Response
from sessions_app.models import StudySession
from qa.models import Resource
from sessions_app.serializers import SessionListSerializer
from qa.serializers import ResourceSerializer


@api_view(['POST'])
def suggest(request):
    module_id = request.data.get('module_id')
    time_slots = request.data.get('time_slots', [])

    suggested_sessions = StudySession.objects.filter(
        module_id=module_id,
        time_slot__in=time_slots
    ).select_related('module', 'creator').prefetch_related('participants')

    resource = Resource.objects.filter(module_id=module_id).first()

    return Response({
        'suggested_sessions': SessionListSerializer(suggested_sessions, many=True).data,
        'resource': ResourceSerializer(resource).data if resource else None,
    })
