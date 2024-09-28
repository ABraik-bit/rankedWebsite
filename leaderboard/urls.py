from django.urls import path
from .views import leaderboard_view, player_stats_view, available_seasons_view, player_mmr_view, player_matches_view

urlpatterns = [
    path('leaderboard/<str:season>/', leaderboard_view, name='leaderboard'),
    path('player-stats/<str:season>/<str:player_name>/', player_stats_view, name='player_stats'),
    path('available-seasons/', available_seasons_view, name='available_seasons'),
    path('player-mmr/<str:season>/<str:player_name>/', player_mmr_view, name='player_mmr'),
    path('player-matches/<str:season>/<str:player_name>/', player_matches_view, name='player_matches'),
]