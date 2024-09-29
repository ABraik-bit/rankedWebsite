from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from .views import leaderboard_view, player_stats_view, available_seasons_view, player_mmr_view, player_matches_view, player_icon_view

urlpatterns = [
    path('leaderboard/<str:season>/', leaderboard_view, name='leaderboard'),
    path('player-stats/<str:season>/<str:player_name>/', player_stats_view, name='player_stats'),
    path('player-matches/<str:season>/<str:player_name>/', player_matches_view, name='player_matches'),
    path('available-seasons/', available_seasons_view, name='available_seasons'),
    path('player-icon/<str:discord_id>/', player_icon_view, name='player_icon'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)