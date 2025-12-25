from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('register/', views.register, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('game/', views.game, name='game'),
    path('api/start-session/', views.start_session, name='start_session'),
    path('api/update-score/', views.update_score, name='update_score'),
    path('api/end-session/', views.end_session, name='end_session'),
]
