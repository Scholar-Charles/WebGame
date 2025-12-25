from django.urls import path
from . import views

urlpatterns = [
    path('', views.game_home, name='game_home'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('start/', views.start_game, name='start_game'),
    path('end/', views.end_game, name='end_game'),
    path('update-stats/', views.update_session_stats, name='update_session_stats'),
]
