from django.urls import path
from . import views
from . import ad_views

urlpatterns = [
    path('', views.game_home, name='game_home'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('api/start/', views.start_game, name='start_game'),
    path('api/end/', views.end_game, name='end_game'),
    path('api/waves/', views.get_waves, name='get_waves'),
    path('api/towers/', views.get_towers, name='get_towers'),
    path('api/leaderboard/', views.get_leaderboard, name='get_leaderboard'),
    path('api/update-stats/', views.update_session_stats, name='update_session_stats'),
    
    # Ad and Buff System URLs
    path('record-ad-click/', ad_views.record_ad_click, name='record_ad_click'),
    path('activate-buff/', ad_views.activate_buff, name='activate_buff'),
    path('get-active-buffs/', ad_views.get_active_buffs, name='get_active_buffs'),
    path('deactivate-buff/', ad_views.deactivate_buff, name='deactivate_buff'),
    path('get-buff-multiplier/', ad_views.get_buff_multiplier, name='get_buff_multiplier'),
]
