"""
Ad and Buff Management Views
Handles advertisement tracking and buff system for game rewards
"""
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta
import uuid
import logging

from authentication.models import Player
from .models import GameSession, AdClick, Buff

logger = logging.getLogger(__name__)

# ==========================================
# AD CLICK TRACKING ENDPOINTS
# ==========================================

@require_http_methods(["POST"])
def record_ad_click(request):
    """
    Record an advertisement click/view
    
    Expected POST parameters:
    - session_id: Current game session UUID
    - ad_identifier: ID/identifier from ad network (e.g., from AdMob)
    - target_url: Where the ad links to
    - source_context: Where ad was shown (e.g., 'game_buff', 'gameplay_speed')
    
    Returns:
        JSON with success status and ad click ID
    """
    try:
        if not request.user.is_authenticated:
            return JsonResponse({
                'success': False, 
                'error': 'User not authenticated'
            }, status=401)
        
        # Get parameters
        session_id = request.POST.get('session_id')
        ad_identifier = request.POST.get('ad_identifier', 'unknown')
        target_url = request.POST.get('target_url', '')
        source_context = request.POST.get('source_context', 'game_buff')
        
        # Validate session exists
        try:
            session = GameSession.objects.get(session_id=session_id)
        except GameSession.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Game session not found'
            }, status=404)
        
        # Get player
        player = Player.objects.get(username=request.user.username)
        
        # Create ad click record
        ad_click = AdClick.objects.create(
            click_id=uuid.uuid4(),
            player=player,
            session=session,
            ad_identifier=ad_identifier,
            target_url=target_url,
            source_context=source_context,
            clicked_at=timezone.now()
        )
        
        logger.info(
            f"Ad click recorded: player={player.username}, "
            f"ad_id={ad_identifier}, context={source_context}"
        )
        
        return JsonResponse({
            'success': True,
            'ad_click_id': str(ad_click.click_id),
            'message': 'Ad click recorded successfully'
        })
        
    except Player.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Player not found'
        }, status=400)
    except Exception as e:
        logger.error(f"Error recording ad click: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Error recording ad click: {str(e)}'
        }, status=500)


# ==========================================
# BUFF SYSTEM ENDPOINTS
# ==========================================

@require_http_methods(["POST"])
def activate_buff(request):
    """
    Activate a buff for the player
    
    Expected POST parameters:
    - session_id: Current game session UUID
    - buff_type: Type of buff ('2x_damage', '2x_attack_speed', '2x_gameplay')
    - ad_click_id: (Optional) Link to the ad that triggered this buff
    - duration_seconds: How long buff lasts (default: 60)
    
    Returns:
        JSON with buff details and activation status
    """
    try:
        if not request.user.is_authenticated:
            return JsonResponse({
                'success': False,
                'error': 'User not authenticated'
            }, status=401)
        
        # Get parameters
        session_id = request.POST.get('session_id')
        buff_type = request.POST.get('buff_type')
        ad_click_id = request.POST.get('ad_click_id')
        duration_seconds = int(request.POST.get('duration_seconds', 60))
        
        # Validate buff_type
        valid_buffs = ['2x_damage', '2x_attack_speed', '2x_gameplay']
        if buff_type not in valid_buffs:
            return JsonResponse({
                'success': False,
                'error': f'Invalid buff type. Must be one of: {", ".join(valid_buffs)}'
            }, status=400)
        
        # Validate session exists
        try:
            session = GameSession.objects.get(session_id=session_id)
        except GameSession.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Game session not found'
            }, status=404)
        
        # Get player
        player = Player.objects.get(username=request.user.username)
        
        # Optional: Link to ad click
        ad_click = None
        if ad_click_id:
            try:
                ad_click = AdClick.objects.get(click_id=ad_click_id)
            except AdClick.DoesNotExist:
                logger.warning(f"Ad click {ad_click_id} not found")
        
        # Calculate expiration time
        activated_at = timezone.now()
        expires_at = activated_at + timedelta(seconds=duration_seconds)
        
        # Create buff record
        buff = Buff.objects.create(
            buff_id=uuid.uuid4(),
            player=player,
            session=session,
            ad_click=ad_click,
            buff_type=buff_type,
            multiplier=2.0,  # All buffs are 2x
            activated_at=activated_at,
            expires_at=expires_at,
            is_active=True
        )
        
        logger.info(
            f"Buff activated: player={player.username}, "
            f"type={buff_type}, duration={duration_seconds}s"
        )
        
        return JsonResponse({
            'success': True,
            'buff_id': str(buff.buff_id),
            'buff_type': buff_type,
            'multiplier': buff.multiplier,
            'activated_at': activated_at.isoformat(),
            'expires_at': expires_at.isoformat(),
            'duration_seconds': duration_seconds,
            'message': f'Buff {buff_type} activated for {duration_seconds} seconds'
        })
        
    except Player.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Player not found'
        }, status=400)
    except ValueError as e:
        return JsonResponse({
            'success': False,
            'error': f'Invalid parameter: {str(e)}'
        }, status=400)
    except Exception as e:
        logger.error(f"Error activating buff: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Error activating buff: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
def get_active_buffs(request):
    """
    Get all currently active buffs for the player's current session
    
    Query parameters:
    - session_id: Game session UUID
    
    Returns:
        JSON list of active buffs with expiration times
    """
    try:
        if not request.user.is_authenticated:
            return JsonResponse({
                'success': False,
                'error': 'User not authenticated'
            }, status=401)
        
        session_id = request.GET.get('session_id')
        if not session_id:
            return JsonResponse({
                'success': False,
                'error': 'session_id required'
            }, status=400)
        
        # Validate session exists
        try:
            session = GameSession.objects.get(session_id=session_id)
        except GameSession.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Game session not found'
            }, status=404)
        
        player = Player.objects.get(username=request.user.username)
        
        # Get active buffs - using Python to avoid datetime comparison issues
        now = timezone.now()
        all_buffs = Buff.objects.filter(
            session=session,
            player=player,
            is_active=True
        ).order_by('expires_at')
        
        buffs_data = []
        expired_buff_ids = []
        
        for buff in all_buffs:
            # Ensure both datetimes are timezone-aware for comparison
            buff_expires = buff.expires_at
            if buff_expires.tzinfo is None:
                # If naive, assume UTC
                from django.utils.timezone import make_aware
                from datetime import datetime as dt
                buff_expires = make_aware(buff_expires)
            
            # Check if expired
            if buff_expires <= now:
                expired_buff_ids.append(buff.buff_id)
            else:
                time_remaining = (buff_expires - now).total_seconds()
                buffs_data.append({
                    'buff_id': str(buff.buff_id),
                    'buff_type': buff.buff_type,
                    'multiplier': buff.multiplier,
                    'activated_at': buff.activated_at.isoformat() if buff.activated_at else None,
                    'expires_at': buff_expires.isoformat(),
                    'time_remaining_seconds': max(0, time_remaining)
                })
        
        # Deactivate expired buffs
        if expired_buff_ids:
            Buff.objects.filter(buff_id__in=expired_buff_ids).update(is_active=False)
            logger.info(f"Deactivated {len(expired_buff_ids)} expired buffs for player {player.username}")
        
        return JsonResponse({
            'success': True,
            'active_buffs': buffs_data,
            'count': len(buffs_data)
        })
        
    except Player.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Player not found'
        }, status=400)
    except Exception as e:
        logger.error(f"Error getting active buffs: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Error getting active buffs: {str(e)}'
        }, status=500)


@require_http_methods(["POST"])
def deactivate_buff(request):
    """
    Manually deactivate a buff (for testing or early termination)
    
    Expected POST parameters:
    - buff_id: UUID of buff to deactivate
    
    Returns:
        JSON with success status
    """
    try:
        if not request.user.is_authenticated:
            return JsonResponse({
                'success': False,
                'error': 'User not authenticated'
            }, status=401)
        
        buff_id = request.POST.get('buff_id')
        
        try:
            buff = Buff.objects.get(buff_id=buff_id)
        except Buff.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Buff not found'
            }, status=404)
        
        # Only allow deactivating own buffs
        if buff.player.username != request.user.username:
            return JsonResponse({
                'success': False,
                'error': 'Cannot deactivate other player\'s buff'
            }, status=403)
        
        buff.is_active = False
        buff.save()
        
        logger.info(f"Buff deactivated: buff_id={buff_id}, type={buff.buff_type}")
        
        return JsonResponse({
            'success': True,
            'message': f'Buff {buff.buff_type} deactivated'
        })
        
    except Exception as e:
        logger.error(f"Error deactivating buff: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Error deactivating buff: {str(e)}'
        }, status=500)


@require_http_methods(["GET"])
def get_buff_multiplier(request):
    """
    Calculate total multiplier for a specific buff type in current session
    Useful for applying buff effects to game mechanics
    
    Query parameters:
    - session_id: Game session UUID
    - buff_type: Type of buff ('2x_damage', '2x_attack_speed', '2x_gameplay')
    
    Returns:
        JSON with calculated multiplier value
    """
    try:
        if not request.user.is_authenticated:
            return JsonResponse({
                'success': False,
                'error': 'User not authenticated'
            }, status=401)
        
        session_id = request.GET.get('session_id')
        buff_type = request.GET.get('buff_type')
        
        if not session_id or not buff_type:
            return JsonResponse({
                'success': False,
                'error': 'session_id and buff_type required'
            }, status=400)
        
        # Validate session exists
        try:
            session = GameSession.objects.get(session_id=session_id)
        except GameSession.DoesNotExist:
            return JsonResponse({
                'success': False,
                'error': 'Game session not found'
            }, status=404)
        
        player = Player.objects.get(username=request.user.username)
        
        # Get active buff of this type
        now = timezone.now()
        active_buff = Buff.objects.filter(
            session=session,
            player=player,
            buff_type=buff_type,
            is_active=True,
            expires_at__gt=now
        ).first()
        
        multiplier = active_buff.multiplier if active_buff else 1.0
        
        return JsonResponse({
            'success': True,
            'buff_type': buff_type,
            'multiplier': multiplier,
            'is_active': active_buff is not None,
            'time_remaining_seconds': (
                (active_buff.expires_at - now).total_seconds() 
                if active_buff else 0
            )
        })
        
    except Player.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Player not found'
        }, status=400)
    except Exception as e:
        logger.error(f"Error getting buff multiplier: {str(e)}")
        return JsonResponse({
            'success': False,
            'error': f'Error getting buff multiplier: {str(e)}'
        }, status=500)
