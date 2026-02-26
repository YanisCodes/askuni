from django.urls import path
from . import views

urlpatterns = [
    path('questions/', views.question_list),
    path('questions/<int:pk>/', views.question_detail),
    path('questions/<int:pk>/answer/', views.add_answer),
    path('modules/', views.module_list),
    path('resources/', views.resource_list),
]
