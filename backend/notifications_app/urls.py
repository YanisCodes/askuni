from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.notification_list),
    path('notifications/<int:pk>/', views.notification_mark_read),
    path('notifications/read-all/', views.mark_all_read),
]
