from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.middleware.csrf import get_token
from .models import Wave, WaveEnemy, Enemy, Tower, GameSession, SessionStats, Leaderboard
from authentication.models import Player
import json
from datetime import datetime
import uuid
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

def game_home(request):
    """Render the game home page"""
    towers = Tower.objects.all()
    player = None
    if request.user.is_authenticated:
        try:
            player = Player.objects.get(username=request.user.username)
        except Player.DoesNotExist:
            player = None
    return render(request, 'game/home.html', {'towers': towers, 'player': player})

@require_http_methods(["GET"])
def get_waves(request):
    """Fetch all waves with their enemies and counts"""
    try:
        waves_data = []
        waves = Wave.objects.all().order_by('wave_number')
        
        if not waves.exists():
            print("WARNING: No waves found in database")
            return JsonResponse({'waves': [], 'warning': 'No waves configured'})
        
        for wave in waves:
            wave_enemies = WaveEnemy.objects.filter(wave=wave).select_related('enemy')
            enemies = []
            for we in wave_enemies:
                # Format enemy image path - ensure it starts with /static/
                image_path = we.enemy.image_path
                if image_path:
                    if not image_path.startswith('/'):
                        image_path = f'/static/{image_path}'
                    print(f"Enemy image path: {we.enemy.enemy_name} -> {image_path}")
                
                enemies.append({
                    'enemy_id': we.enemy.enemy_id,
                    'enemy_name': we.enemy.enemy_name,
                    'base_hp': we.enemy.base_hp,
                    'base_def': we.enemy.base_def,
                    'speed': we.enemy.speed,
                    'reward_gold': we.enemy.reward_gold,
                    'score_reward': we.enemy.score_reward,
                    'image_path': image_path,
                    'enemy_count': we.enemy_count,
                    'spawn_interval': we.spawn_interval
                })
            
            waves_data.append({
                'wave_id': wave.wave_id,
                'wave_number': wave.wave_number,
                'enemies': enemies
            })
        
        print(f"Waves loaded: {len(waves_data)} waves")
        return JsonResponse({'waves': waves_data})
    except Exception as e:
        print(f"Error in get_waves: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@require_http_methods(["POST"])
def start_game(request):
    """Start a new game session"""
    try:
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'error': 'User not authenticated'}, status=401)
        
        player = Player.objects.get(username=request.user.username)
        session = GameSession.objects.create(
            player=player,
            start_time=timezone.now()
        )
        SessionStats.objects.create(session=session)
        logger.info(f"Game session started for player {player.username}")
        return JsonResponse({'session_id': str(session.session_id), 'success': True})
    except Player.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Player not found. Please log in.'}, status=400)
    except Exception as e:
        logger.error(f"Error in start_game: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@require_http_methods(["POST"])
def end_game(request):
    """End the current game session and update player stats"""
    try:
        session_id = request.POST.get('session_id')
        final_score = int(request.POST.get('final_score', 0))
        level_reached = int(request.POST.get('level_reached', 1))

        session = GameSession.objects.get(session_id=session_id)
        session.end_time = timezone.now()
        session.final_score = final_score
        session.level_reached = level_reached
        session.save()

        player = session.player
        
        # Update player high score and highest level
        player.high_score = max(player.high_score, final_score)
        player.highest_level = max(player.highest_level, level_reached)
        player.games_played += 1
        player.save()

        # Update or create leaderboard entry for this player
        leaderboard_entry, created = Leaderboard.objects.get_or_create(
            player=player,
            defaults={
                'rank': 1,  # Will be recalculated
                'score': player.high_score,
                'level': player.highest_level
            }
        )
        
        if not created:
            # Update existing entry with latest stats
            leaderboard_entry.score = player.high_score
            leaderboard_entry.level = player.highest_level
            leaderboard_entry.save()
        
        # Recalculate all ranks based on scores and levels
        leaderboard_entries = Leaderboard.objects.order_by('-score', '-level', 'updated_at')
        for rank, entry in enumerate(leaderboard_entries, 1):
            if entry.rank != rank:
                entry.rank = rank
                entry.save()

        logger.info(f"Game session ended for player {player.username} with score {final_score}, level {level_reached}")
        return JsonResponse({'success': True})
    except GameSession.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Session not found'}, status=404)
    except Exception as e:
        logger.error(f"Error in end_game: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@require_http_methods(["POST"])
def update_session_stats(request):
    """Update session stats"""
    try:
        session_id = request.POST.get('session_id')
        stats = SessionStats.objects.get(session_id=session_id)
        stats.towers_built = int(request.POST.get('towers_built', 0))
        stats.towers_upgraded = int(request.POST.get('towers_upgraded', 0))
        stats.enemies_killed = int(request.POST.get('enemies_killed', 0))
        stats.gold_earned = int(request.POST.get('gold_earned', 0))
        stats.save()
        return JsonResponse({'success': True})
    except Exception as e:
        logger.error(f"Error in update_session_stats: {str(e)}")
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@require_http_methods(["GET"])
def get_towers(request):
    """Fetch all towers with their properties"""
    towers_data = []
    towers = Tower.objects.all()
    
    for tower in towers:
        # Format image path to include /static/ prefix if not already present
        image_path = tower.image_path
        if image_path and not image_path.startswith('/'):
            image_path = f'/static/{image_path}'
        
        towers_data.append({
            'tower_id': tower.tower_id,
            'tower_name': tower.tower_name,
            'base_damage': tower.base_damage,
            'attack_speed': tower.attack_speed,
            'range': tower.range,
            'cost': tower.cost,
            'image_path': image_path
        })
    
    return JsonResponse({'towers': towers_data})

def leaderboard(request):
    """Render leaderboard page"""
    leaderboard = Leaderboard.objects.all().order_by('rank')[:100]
    return render(request, 'game/leaderboard.html', {'leaderboard': leaderboard})

@require_http_methods(["GET"])
def get_leaderboard(request):
    """Fetch leaderboard data as JSON"""
    try:
        # Fetch top 50 players from leaderboard ordered by rank
        leaderboard_entries = Leaderboard.objects.select_related('player').order_by('rank')[:50]
        
        if not leaderboard_entries.exists():
            return JsonResponse({
                'success': True,
                'leaderboard': []
            })
        
        leaderboard_data = []
        for entry in leaderboard_entries:
            # Use the level stored in the Leaderboard entry (updated when game ends)
            leaderboard_data.append({
                'rank': entry.rank,
                'username': entry.player.username,
                'score': entry.score,
                'level': entry.level
            })
        
        return JsonResponse({
            'success': True,
            'leaderboard': leaderboard_data
        })
    except Exception as e:
        logger.error(f"Error in get_leaderboard: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)
