from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.session_list),
    path('sessions/<int:pk>/', views.session_detail),
    path('sessions/<int:pk>/join/', views.join_session),
    path('sessions/<int:pk>/leave/', views.leave_session),
    path('sessions/<int:pk>/start/', views.start_session),
    path('sessions/<int:pk>/end/', views.end_session),
    path('sessions/<int:pk>/messages/', views.chat_messages),
    path('sessions/<int:pk>/focus-score/', views.submit_focus_score),
    path('sessions/<int:pk>/focus-scores/', views.session_focus_scores),
    path('sessions/<int:pk>/peer-registry/', views.register_peer),
]
