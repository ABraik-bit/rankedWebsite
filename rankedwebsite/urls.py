from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('leaderboard.urls')),  # Leaderboard API
    path('api/match/', include('match_replay.urls')),  # Match Replay API
    path('match_replay/', include('match_replay.urls')),
    path('', TemplateView.as_view(template_name='index.html')),  # React app entry point
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)