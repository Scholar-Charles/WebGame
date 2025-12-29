from django.db import models
import uuid

class Tower(models.Model):
    tower_id = models.AutoField(primary_key=True)
    tower_name = models.CharField(max_length=50)
    base_damage = models.IntegerField()
    attack_speed = models.FloatField()
    range = models.FloatField()
    cost = models.IntegerField()
    image_path = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'towers'
        managed = False

    def __str__(self):
        return self.tower_name


class TowerUpgrade(models.Model):
    upgrade_id = models.AutoField(primary_key=True)
    tower = models.ForeignKey(Tower, on_delete=models.CASCADE)
    upgrade_level = models.IntegerField()
    damage_bonus = models.IntegerField(default=0)
    speed_bonus = models.FloatField(default=0)
    range_bonus = models.FloatField(default=0)
    cost = models.IntegerField()
    image_path = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'tower_upgrades'
        managed = False

    def __str__(self):
        return f"{self.tower.tower_name} - Level {self.upgrade_level}"


class Enemy(models.Model):
    enemy_id = models.AutoField(primary_key=True)
    enemy_name = models.CharField(max_length=50)
    base_hp = models.IntegerField()
    base_def = models.IntegerField()
    speed = models.FloatField()
    reward_gold = models.IntegerField()
    score_reward = models.IntegerField()
    image_path = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'enemies'
        managed = False

    def __str__(self):
        return self.enemy_name


class Wave(models.Model):
    wave_id = models.AutoField(primary_key=True)
    wave_number = models.IntegerField()

    class Meta:
        db_table = 'waves'
        managed = False

    def __str__(self):
        return f"Wave {self.wave_number}"


class WaveEnemy(models.Model):
    wave_enemy_id = models.AutoField(primary_key=True)
    wave = models.ForeignKey(Wave, on_delete=models.CASCADE)
    enemy = models.ForeignKey(Enemy, on_delete=models.CASCADE)
    enemy_count = models.IntegerField()
    spawn_interval = models.FloatField()

    class Meta:
        db_table = 'wave_enemies'
        managed = False

    def __str__(self):
        return f"Wave {self.wave.wave_number} - {self.enemy.enemy_name}"


class GameSession(models.Model):
    session_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player = models.ForeignKey('authentication.Player', on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    final_score = models.BigIntegerField(default=0)
    level_reached = models.IntegerField(default=1)

    class Meta:
        db_table = 'game_sessions'
        managed = False

    def __str__(self):
        return f"Session {self.session_id}"


class SessionStats(models.Model):
    stat_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    towers_built = models.IntegerField(default=0)
    towers_upgraded = models.IntegerField(default=0)
    enemies_killed = models.IntegerField(default=0)
    gold_earned = models.IntegerField(default=0)

    class Meta:
        db_table = 'session_stats'
        managed = False

    def __str__(self):
        return f"Stats for {self.session_id}"


class Leaderboard(models.Model):
    leaderboard_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player = models.ForeignKey('authentication.Player', on_delete=models.CASCADE)
    rank = models.IntegerField()
    score = models.BigIntegerField()
    level = models.IntegerField(default=1)
    achieved_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leaderboard'
        managed = False

    def __str__(self):
        return f"{self.player.username} - Rank {self.rank}"


class Achievement(models.Model):
    achievement_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player = models.ForeignKey('authentication.Player', on_delete=models.CASCADE)
    achievement_name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    achieved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'achievements'
        managed = False

    def __str__(self):
        return f"{self.player.username} - {self.achievement_name}"


class AdClick(models.Model):
    click_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player = models.ForeignKey('authentication.Player', on_delete=models.SET_NULL, null=True, blank=True)
    session = models.ForeignKey(GameSession, on_delete=models.SET_NULL, null=True, blank=True)
    ad_identifier = models.CharField(max_length=100)
    clicked_at = models.DateTimeField(auto_now_add=True)
    target_url = models.TextField()
    source_context = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'ad_clicks'
        managed = False

    def __str__(self):
        return f"Ad Click - {self.ad_identifier}"

class Buff(models.Model):
    buff_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player = models.ForeignKey('authentication.Player', on_delete=models.CASCADE)
    session = models.ForeignKey(GameSession, on_delete=models.CASCADE)
    ad_click = models.ForeignKey(AdClick, on_delete=models.SET_NULL, null=True, blank=True)
    
    BUFF_TYPES = [
        ('2x_damage', '2x Damage'),
        ('2x_attack_speed', '2x Attack Speed'),
        ('2x_gameplay', '2x Gameplay Speed'),
    ]
    
    buff_type = models.CharField(max_length=50, choices=BUFF_TYPES)
    multiplier = models.FloatField(default=2.0)
    
    activated_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'buffs'
        managed = False
        indexes = [
            models.Index(fields=['player', 'is_active']),
            models.Index(fields=['session', 'is_active']),
            models.Index(fields=['is_active', 'expires_at']),
        ]

    def __str__(self):
        return f"{self.player.username} - {self.buff_type}"

    @property
    def is_expired(self):
        from django.utils import timezone
        return timezone.now() > self.expires_at