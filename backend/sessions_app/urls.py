from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.session_list),
    path('sessions/<int:pk>/', views.session_detail),
    path('sessions/<int:pk>/join/', views.join_session),
    path('sessions/<int:pk>/leave/', views.leave_session),
]
