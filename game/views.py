from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from .models import Player

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
        Player.objects.create(user=user)
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
def logout_view(request):
    logout(request)
    return redirect('landing')
