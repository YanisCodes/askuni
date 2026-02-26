from django.urls import path
from . import views

urlpatterns = [
    path('planner/suggest/', views.suggest),
]
