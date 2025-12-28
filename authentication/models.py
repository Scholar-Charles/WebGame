from django.db import models
import uuid

class Player(models.Model):
    player_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=50, unique=True)
    high_score = models.BigIntegerField(default=0)
    highest_level = models.IntegerField(default=1)
    games_played = models.IntegerField(default=0)
    total_playtime_seconds = models.BigIntegerField(default=0)
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'players'
        managed = False

    def __str__(self):
        return self.username
