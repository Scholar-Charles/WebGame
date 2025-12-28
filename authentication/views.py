from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from .models import Player
import uuid

def register(request):
    if request.user.is_authenticated:
        return redirect('game_home')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password_confirm = request.POST.get('password_confirm')

        if password != password_confirm:
            messages.error(request, 'Passwords do not match!')
            return redirect('register')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists!')
            return redirect('register')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists!')
            return redirect('register')

        if Player.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists!')
            return redirect('register')

        user = User.objects.create_user(username=username, email=email, password=password)
        Player.objects.create(
            player_id=uuid.uuid4(),
            username=username
        )
        messages.success(request, 'Account created successfully! Please login.')
        return redirect('login')

    return render(request, 'authentication/register.html')

def login_view(request):
    if request.user.is_authenticated:
        return redirect('game_home')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, f'Welcome back, {username}!')
            return redirect('game_home')
        else:
            messages.error(request, 'Invalid username or password!')

    return render(request, 'authentication/login.html')

@login_required(login_url='login')
def logout_view(request):
    logout(request)
    messages.success(request, 'You have been logged out.')
    return redirect('login')

@login_required(login_url='login')
def profile(request):
    player, created = Player.objects.get_or_create(
        username=request.user.username,
        defaults={'player_id': uuid.uuid4()}
    )
    return render(request, 'authentication/profile.html', {'player': player})

@login_required(login_url='login')
def api_profile(request):
    try:
        player = Player.objects.get(username=request.user.username)
        return JsonResponse({
            'success': True,
            'user': request.user.username,
            'email': request.user.email,
            'highest_score': player.high_score,
            'highest_level': player.highest_level,
            'total_games': player.games_played
        })
    except Player.DoesNotExist:
        # Create player if doesn't exist
        player = Player.objects.create(
            player_id=uuid.uuid4(),
            username=request.user.username
        )
        return JsonResponse({
            'success': True,
            'user': request.user.username,
            'email': request.user.email,
            'highest_score': player.high_score,
            'highest_level': player.highest_level,
            'total_games': player.games_played
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=400)
