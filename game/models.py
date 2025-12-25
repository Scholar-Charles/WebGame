from django.db import models
from django.contrib.auth.models import User
import uuid

class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    session_id = models.UUIDField(default=uuid.uuid4, unique=True)
    high_score = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0)
    total_playtime = models.IntegerField(default=0)  # in seconds
    registration_date = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)
    level = models.IntegerField(default=1)
    total_earnings = models.DecimalField(max_digits=15, decimal_places=2, default=0)

    def __str__(self):
        return self.user.username

    class Meta:
        ordering = ['-high_score']


class GameSession(models.Model):
    SESSION_STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
    ]

    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='game_sessions')
    session_id = models.UUIDField(default=uuid.uuid4, unique=True)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    final_score = models.IntegerField(default=0)
    level_reached = models.IntegerField(default=1)
    duration = models.IntegerField(default=0)  # in seconds
    status = models.CharField(max_length=20, choices=SESSION_STATUS_CHOICES, default='active')
    
    def __str__(self):
        return f"{self.player.user.username} - Session {self.session_id}"

    class Meta:
        ordering = ['-start_time']


class Advertisement(models.Model):
    ad_id = models.CharField(max_length=100, unique=True)
    ad_name = models.CharField(max_length=255)
    target_url = models.URLField()
    description = models.TextField(blank=True)
    placement_type = models.CharField(max_length=50)  # e.g., 'banner', 'interstitial', 'reward'
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.ad_name


class AdClick(models.Model):
    click_id = models.UUIDField(default=uuid.uuid4, unique=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='ad_clicks')
    game_session = models.ForeignKey(GameSession, on_delete=models.CASCADE, related_name='ad_clicks', null=True, blank=True)
    advertisement = models.ForeignKey(Advertisement, on_delete=models.CASCADE, related_name='clicks')
    timestamp = models.DateTimeField(auto_now_add=True)
    target_url = models.URLField()
    source_context = models.CharField(max_length=255)  # where in game the ad was clicked
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    def __str__(self):
        return f"Ad Click - {self.player.user.username} - {self.advertisement.ad_name}"

    class Meta:
        ordering = ['-timestamp']


class PlayerAchievement(models.Model):
    ACHIEVEMENT_TYPES = [
        ('unlock', 'Unlock'),
        ('level', 'Level'),
        ('score', 'Score Milestone'),
        ('gameplay', 'Gameplay'),
    ]

    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=255)
    description = models.TextField()
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    reward_points = models.IntegerField(default=0)
    unlocked_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.player.user.username} - {self.title}"

    class Meta:
        ordering = ['-unlocked_at']


class Leaderboard(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='leaderboard')
    rank = models.IntegerField()
    score = models.IntegerField(default=0)
    games_played = models.IntegerField(default=0)
    total_playtime = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Rank #{self.rank} - {self.player.user.username}"

    class Meta:
        ordering = ['rank']


class ScoreHistory(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='score_history')
    game_session = models.OneToOneField(GameSession, on_delete=models.CASCADE)
    score = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player.user.username} - Score: {self.score}"

    class Meta:
        ordering = ['-timestamp']


class PlayerProgression(models.Model):
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='progression')
    current_level = models.IntegerField(default=1)
    experience_points = models.IntegerField(default=0)
    total_experience = models.IntegerField(default=0)
    unlocked_features = models.JSONField(default=list)  # list of unlocked feature IDs
    bonus_points = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.player.user.username} - Level {self.current_level}"


class GameAnalytics(models.Model):
    PLAY_MODE_CHOICES = [
        ('idle', 'Idle'),
        ('active', 'Active'),
        ('hybrid', 'Hybrid'),
    ]

    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='analytics')
    date = models.DateField(auto_now_add=True)
    sessions_played = models.IntegerField(default=0)
    total_time_played = models.IntegerField(default=0)  # in seconds
    average_session_duration = models.IntegerField(default=0)
    preferred_game_mode = models.CharField(max_length=20, choices=PLAY_MODE_CHOICES, default='idle')
    ads_clicked = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.player.user.username} - {self.date}"

    class Meta:
        ordering = ['-date']


class ABTest(models.Model):
    TEST_STATUS = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('paused', 'Paused'),
    ]

    test_name = models.CharField(max_length=255)
    description = models.TextField()
    variant_a = models.CharField(max_length=255)  # e.g., ad placement, game mechanic
    variant_b = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=TEST_STATUS, default='active')
    start_date = models.DateTimeField(auto_now_add=True)
    end_date = models.DateTimeField(null=True, blank=True)
    variant_a_clicks = models.IntegerField(default=0)
    variant_b_clicks = models.IntegerField(default=0)

    def __str__(self):
        return self.test_name


class RetentionTracking(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='retention_data')
    last_played = models.DateTimeField(auto_now=True)
    days_since_registration = models.IntegerField(default=0)
    days_active = models.IntegerField(default=0)  # total days player has played
    retention_status = models.CharField(max_length=50, default='active')  # active, inactive, churned
    login_streak = models.IntegerField(default=0)  # consecutive days played
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.player.user.username} - Status: {self.retention_status}"

    class Meta:
        ordering = ['-updated_at']
