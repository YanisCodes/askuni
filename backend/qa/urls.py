from django.urls import path
from . import views

urlpatterns = [
    path('questions/', views.question_list),
    path('questions/<int:pk>/', views.question_detail),
    path('questions/<int:pk>/answer/', views.add_answer),
    path('questions/<int:pk>/vote/', views.vote_question),
    path('answers/<int:pk>/vote/', views.vote_answer),
    path('modules/', views.module_list),
    path('resources/', views.resource_list),
]
