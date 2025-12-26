from django.urls import path
from . import views

urlpatterns = [
    path('', views.game_home, name='game_home'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('api/start/', views.start_game, name='start_game'),
    path('api/end/', views.end_game, name='end_game'),
    path('api/waves/', views.get_waves, name='get_waves'),
    path('api/towers/', views.get_towers, name='get_towers'),
    path('api/update-stats/', views.update_session_stats, name='update_session_stats'),
]
