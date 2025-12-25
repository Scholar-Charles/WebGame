from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from authentication.models import Player
from .models import GameSession, SessionStats, Tower, Enemy, Wave, Leaderboard
from django.utils import timezone
import uuid

@login_required(login_url='login')
def game_home(request):
    player = Player.objects.get(user=request.user)
    towers = Tower.objects.all()
    enemies = Enemy.objects.all()
    waves = Wave.objects.all()
    
    context = {
        'player': player,
        'towers': towers,
        'enemies': enemies,
        'waves': waves,
    }
    return render(request, 'game/home.html', context)

@login_required(login_url='login')
def leaderboard(request):
    leaderboard = Leaderboard.objects.all().order_by('rank')[:100]
    return render(request, 'game/leaderboard.html', {'leaderboard': leaderboard})

@login_required(login_url='login')
def start_game(request):
    player = Player.objects.get(user=request.user)
    session = GameSession.objects.create(
        session_id=uuid.uuid4(),
        player=player,
        start_time=timezone.now()
    )
    SessionStats.objects.create(
        stat_id=uuid.uuid4(),
        session=session
    )
    return JsonResponse({'session_id': str(session.session_id)})

@login_required(login_url='login')
def end_game(request):
    if request.method == 'POST':
        session_id = request.POST.get('session_id')
        final_score = request.POST.get('final_score', 0)
        level_reached = request.POST.get('level_reached', 1)

        try:
            session = GameSession.objects.get(session_id=session_id)
            session.end_time = timezone.now()
            session.final_score = final_score
            session.level_reached = level_reached
            session.save()

            player = session.player
            player.high_score = max(player.high_score, int(final_score))
            player.games_played += 1
            player.save()

            return JsonResponse({'success': True})
        except GameSession.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Session not found'})

    return JsonResponse({'success': False, 'error': 'Invalid request'})

@login_required(login_url='login')
def update_session_stats(request):
    if request.method == 'POST':
        session_id = request.POST.get('session_id')
        towers_built = request.POST.get('towers_built', 0)
        enemies_killed = request.POST.get('enemies_killed', 0)
        gold_earned = request.POST.get('gold_earned', 0)

        try:
            session = GameSession.objects.get(session_id=session_id)
            stats = SessionStats.objects.get(session=session)
            stats.towers_built = towers_built
            stats.enemies_killed = enemies_killed
            stats.gold_earned = gold_earned
            stats.save()

            return JsonResponse({'success': True})
        except (GameSession.DoesNotExist, SessionStats.DoesNotExist):
            return JsonResponse({'success': False, 'error': 'Session or stats not found'})

    return JsonResponse({'success': False, 'error': 'Invalid request'})
