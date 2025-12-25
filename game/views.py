from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods, require_POST
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Player, GameSession, PlayerProgression
import json
from datetime import datetime

@require_http_methods(["GET", "POST"])
def landing(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'landing.html')

@require_http_methods(["GET", "POST"])
def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')

        if password != password_confirm:
            return render(request, 'register.html', {'error': 'Passwords do not match'})

        if User.objects.filter(username=username).exists():
            return render(request, 'register.html', {'error': 'Username already exists'})

        user = User.objects.create_user(username=username, email=email, password=password)
        player = Player.objects.create(user=user)
        PlayerProgression.objects.create(player=player)
        login(request, user)
        return redirect('dashboard')

    return render(request, 'register.html')

@require_http_methods(["GET", "POST"])
def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect('dashboard')
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})

    return render(request, 'login.html')

@login_required
def dashboard(request):
    player = Player.objects.get(user=request.user)
    return render(request, 'dashboard.html', {'player': player})

@login_required
def game(request):
    player = Player.objects.get(user=request.user)
    progression, created = PlayerProgression.objects.get_or_create(player=player)
    return render(request, 'game.html', {'player': player, 'progression': progression})

@login_required
@require_POST
def start_session(request):
    player = Player.objects.get(user=request.user)
    session = GameSession.objects.create(player=player, status='active')
    return JsonResponse({'session_id': str(session.session_id), 'success': True})

@login_required
@require_POST
def update_score(request):
    try:
        data = json.loads(request.body)
        score_increment = data.get('score', 0)
        
        player = Player.objects.get(user=request.user)
        player.high_score += score_increment
        player.save()
        
        return JsonResponse({'success': True, 'high_score': player.high_score})
    except:
        return JsonResponse({'success': False}, status=400)

@login_required
@require_POST
def end_session(request):
    try:
        data = json.loads(request.body)
        session_id = data.get('session_id')
        final_score = data.get('final_score', 0)
        duration = data.get('duration', 0)
        
        player = Player.objects.get(user=request.user)
        session = GameSession.objects.get(session_id=session_id, player=player)
        
        session.final_score = final_score
        session.duration = duration
        session.status = 'completed'
        session.end_time = datetime.now()
        session.save()
        
        player.games_played += 1
        player.total_playtime += duration
        player.save()
        
        return JsonResponse({'success': True})
    except:
        return JsonResponse({'success': False}, status=400)

@login_required
def logout_view(request):
    logout(request)
    return redirect('landing')
