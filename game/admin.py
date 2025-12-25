from django.contrib import admin
from .models import (
    Player, GameSession, Advertisement, AdClick, PlayerAchievement,
    Leaderboard, ScoreHistory, PlayerProgression, GameAnalytics,
    ABTest, RetentionTracking
)

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('user', 'high_score', 'games_played', 'level', 'registration_date')
    search_fields = ('user__username', 'user__email')
    list_filter = ('registration_date', 'level')

@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ('player', 'status', 'start_time', 'final_score', 'level_reached')
    search_fields = ('player__user__username',)
    list_filter = ('status', 'start_time')

@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ('ad_name', 'placement_type', 'is_active', 'created_at')
    search_fields = ('ad_name', 'ad_id')
    list_filter = ('is_active', 'placement_type')

@admin.register(AdClick)
class AdClickAdmin(admin.ModelAdmin):
    list_display = ('player', 'advertisement', 'timestamp', 'source_context')
    search_fields = ('player__user__username', 'advertisement__ad_name')
    list_filter = ('timestamp', 'advertisement')

@admin.register(PlayerAchievement)
class PlayerAchievementAdmin(admin.ModelAdmin):
    list_display = ('player', 'title', 'achievement_type', 'reward_points', 'is_completed')
    search_fields = ('player__user__username', 'title')
    list_filter = ('achievement_type', 'is_completed')

@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ('rank', 'player', 'score', 'level', 'updated_at')
    search_fields = ('player__user__username',)
    list_filter = ('rank', 'level')

@admin.register(ScoreHistory)
class ScoreHistoryAdmin(admin.ModelAdmin):
    list_display = ('player', 'score', 'timestamp')
    search_fields = ('player__user__username',)
    list_filter = ('timestamp',)

@admin.register(PlayerProgression)
class PlayerProgressionAdmin(admin.ModelAdmin):
    list_display = ('player', 'current_level', 'experience_points', 'bonus_points')
    search_fields = ('player__user__username',)
    list_filter = ('current_level',)

@admin.register(GameAnalytics)
class GameAnalyticsAdmin(admin.ModelAdmin):
    list_display = ('player', 'date', 'sessions_played', 'preferred_game_mode', 'ads_clicked')
    search_fields = ('player__user__username',)
    list_filter = ('date', 'preferred_game_mode')

@admin.register(ABTest)
class ABTestAdmin(admin.ModelAdmin):
    list_display = ('test_name', 'status', 'variant_a_clicks', 'variant_b_clicks', 'start_date')
    list_filter = ('status', 'start_date')

@admin.register(RetentionTracking)
class RetentionTrackingAdmin(admin.ModelAdmin):
    list_display = ('player', 'retention_status', 'login_streak', 'days_active', 'updated_at')
    search_fields = ('player__user__username',)
    list_filter = ('retention_status', 'updated_at')
