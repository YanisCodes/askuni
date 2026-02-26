from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),
    path('api/', include('qa.urls')),
    path('api/', include('sessions_app.urls')),
    path('api/', include('notifications_app.urls')),
    path('api/', include('planner.urls')),
]
