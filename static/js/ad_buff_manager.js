/**
 * Ads and Buff System Manager
 * Handles advertisement display, tracking, and buff activation
 */

class AdBuffManager {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.gameInstance = null; // Reference to TowerDefenseGame instance
        this.adMobInitialized = false;
        this.currentAdClick = null;
        this.activateAdmobScript();
        this.initializeEventListeners();
        this.buffUpdateInterval = null;
    }

    /**
     * Load Google AdMob script
     * Uses test ads by default - replace with your real ad unit IDs in production
     */
    activateAdmobScript() {
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-app-pub-xxxxxxxxxxxxxxxx';
        script.onload = () => {
            this.adMobInitialized = true;
            console.log('Google AdMob loaded');
            // (adsbygoogle = window.adsbygoogle || []).push({});
        };
        document.head.appendChild(script);
    }

    /**
     * Initialize event listeners for ad and buff UI
     */
    initializeEventListeners() {
        // Watch Ad Button
        const watchAdBtn = document.getElementById('watchAdBtn');
        if (watchAdBtn) {
            watchAdBtn.addEventListener('click', () => this.showAdModal());
        } else {
            console.warn('⚠️ Watch Ad button not found. Check if ad_buff_modal.html is included.');
        }

        // Close Ad Modal
        const adCloseBtn = document.getElementById('adCloseBtn');
        if (adCloseBtn) {
            adCloseBtn.addEventListener('click', () => this.closeAdModal());
        } else {
            console.warn('⚠️ Ad close button not found.');
        }

        // Buff Selection Buttons
        const buffSelectBtns = document.querySelectorAll('.buff-select-btn');
        buffSelectBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const buffType = e.target.getAttribute('data-buff-type');
                this.selectBuff(buffType);
            });
        });
        
        if (buffSelectBtns.length === 0) {
            console.warn('⚠️ Buff selection buttons not found. Check if ad_buff_modal.html is included.');
        } else {
            console.log(`✓ Found ${buffSelectBtns.length} buff buttons`);
        }

        // Start buff update interval
        this.startBuffUpdateInterval();
    }

    /**
     * Show advertisement modal and start ad playback
     */
    async showAdModal() {
        // Check if gameInstance is available (canvas-based modal)
        if (this.gameInstance && typeof this.gameInstance.openAdModalCanvas === 'function') {
            console.log('Using canvas-based ad modal');
            this.gameInstance.openAdModalCanvas();
            // Simulate ad playback in background
            await this.playSimulatedAd();
            return;
        }

        // Fallback to HTML modal if canvas modal not available
        const adModal = document.getElementById('adModal');
        const adSpace = document.getElementById('adSpace');

        if (!adModal) {
            console.error('❌ Ad modal not found in DOM. Check if ad_buff_modal.html is included in home.html');
            return;
        }

        if (!adSpace) {
            console.error('❌ Ad space not found in DOM.');
            return;
        }

        // Show modal
        adModal.classList.remove('hidden');

        // Simulate ad loading
        adSpace.innerHTML = `
            <div class="ad-placeholder">
                <p>Loading Advertisement...</p>
                <div class="loading-spinner"></div>
            </div>
        `;

        // Simulate ad playing for 5 seconds (in production, use real Google AdMob)
        console.log('Ad modal opened - simulating ad playback');
        
        // For production: Use Google AdMob Rewarded Ad
        // This is simplified for demonstration
        await this.playSimulatedAd();
    }

    /**
     * Simulate ad playback (REPLACE WITH REAL ADMOB IN PRODUCTION)
     */
    async playSimulatedAd() {
        return new Promise((resolve) => {
            // Simulate ad duration (5 seconds)
            const adDuration = 5000;
            const startTime = Date.now();

            const updateAdDisplay = () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.ceil((adDuration - elapsed) / 1000);

                if (remaining > 0) {
                    const adStatus = document.getElementById('adStatus');
                    adStatus.classList.remove('hidden');
                    document.getElementById('adStatusMessage').textContent = `Ad playing... ${remaining}s remaining`;
                    setTimeout(updateAdDisplay, 100);
                } else {
                    this.completeAdWatch();
                    resolve();
                }
            };

            updateAdDisplay();
        });
    }

    /**
     * Handle ad completion and record the click
     */
    async completeAdWatch() {
        // Check if using canvas modal
        const usingCanvasModal = this.gameInstance && typeof this.gameInstance.closeAdModalCanvas === 'function';

        if (usingCanvasModal) {
            console.log('Closing canvas ad modal...');
        } else {
            const adStatus = document.getElementById('adStatus');
            // Update status
            adStatus.classList.remove('hidden');
            document.getElementById('adStatusMessage').textContent = 'Ad completed! Recording click...';
        }

        try {
            // Record ad click in database
            const response = await fetch('/game/record-ad-click/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: new URLSearchParams({
                    'session_id': this.sessionId,
                    'ad_identifier': 'test-ad-' + Date.now(),
                    'target_url': 'https://example.com',
                    'source_context': 'game_buff'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentAdClick = data.ad_click_id;
                console.log('Ad click recorded:', data.ad_click_id);

                // Delay before showing buff selection
                setTimeout(() => {
                    if (usingCanvasModal) {
                        // Close ad modal and show buff modal via canvas
                        this.gameInstance.closeAdModalCanvas();
                    } else {
                        const adModal = document.getElementById('adModal');
                        const adStatus = document.getElementById('adStatus');
                        adModal.classList.add('hidden');
                        adStatus.classList.add('hidden');
                        this.showBuffModal();
                    }
                }, 1500);
            } else {
                console.error('Failed to record ad click:', data.error);
                alert('Error recording ad click. Please try again.');
                this.closeAdModal();
            }
        } catch (error) {
            console.error('Error recording ad click:', error);
            alert('Error recording ad click. Please try again.');
            this.closeAdModal();
        }
    }

    /**
     * Close ad modal without watching
     */
    closeAdModal() {
        const adModal = document.getElementById('adModal');
        const adStatus = document.getElementById('adStatus');
        adModal.classList.add('hidden');
        adStatus.classList.add('hidden');
    }

    /**
     * Show buff selection modal
     */
    showBuffModal() {
        const buffModal = document.getElementById('buffModal');
        if (!buffModal) {
            console.error('❌ Buff modal not found in DOM. Check if ad_buff_modal.html is included in home.html');
            return;
        }
        buffModal.classList.remove('hidden');
    }

    /**
     * Close buff modal
     */
    closeBuffModal() {
        const buffModal = document.getElementById('buffModal');
        if (buffModal) {
            buffModal.classList.add('hidden');
        }
    }

    /**
     * Activate selected buff
     */
    async selectBuff(buffType) {
        console.log('Buff selected:', buffType);

        try {
            // Disable all buff buttons during activation
            const buffSelectBtns = document.querySelectorAll('.buff-select-btn');
            buffSelectBtns.forEach(btn => btn.disabled = true);

            // Activate buff on server
            const response = await fetch('/game/activate-buff/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: new URLSearchParams({
                    'session_id': this.sessionId,
                    'buff_type': buffType,
                    'ad_click_id': this.currentAdClick,
                    'duration_seconds': 60
                })
            });

            const data = await response.json();

            if (data.success) {
                console.log('Buff activated:', data);

                // Close modal (canvas or HTML)
                if (this.gameInstance && typeof this.gameInstance.closeBuffModalCanvas === 'function') {
                    this.gameInstance.closeBuffModalCanvas();
                } else {
                    this.closeBuffModal();
                }
                
                this.showBuffNotification(buffType, data.duration_seconds);

                // Re-enable buttons
                buffSelectBtns.forEach(btn => btn.disabled = false);

                // Update game with buff multiplier
                this.applyBuffToGame(buffType, data.multiplier);

            } else {
                console.error('Failed to activate buff:', data.error);
                alert('Error activating buff: ' + data.error);
                buffSelectBtns.forEach(btn => btn.disabled = false);
            }
        } catch (error) {
            console.error('Error activating buff:', error);
            alert('Error activating buff. Please try again.');
            const buffSelectBtns = document.querySelectorAll('.buff-select-btn');
            buffSelectBtns.forEach(btn => btn.disabled = false);
        }
    }

    /**
     * Show buff notification in UI
     */
    showBuffNotification(buffType, durationSeconds) {
        const buffIcon = {
            '2x_damage': '⚔️ 2x DAMAGE',
            '2x_attack_speed': '⚡ 2x ATTACK SPD',
            '2x_gameplay': '⏱️ 2x GAMEPLAY'
        };

        const notifElement = document.createElement('div');
        notifElement.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #00d4ff44 0%, #00d4ff22 100%);
            border: 2px solid #00d4ff;
            color: #00d4ff;
            padding: 20px 40px;
            border-radius: 10px;
            font-family: 'Press Start 2P', cursive;
            font-size: 0.8em;
            z-index: 700;
            box-shadow: 0 0 20px #00d4ff66;
            animation: slideDown 0.5s ease;
            text-align: center;
        `;
        notifElement.textContent = `${buffIcon[buffType] || buffType} ACTIVATED!`;

        // Add to page temporarily
        document.body.appendChild(notifElement);
        setTimeout(() => notifElement.remove(), 3000);
    }

    /**
     * Apply buff effects to game mechanics
     */
    applyBuffToGame(buffType, multiplier) {
        if (!this.gameInstance) {
            console.warn('Game instance not available for buff application');
            return;
        }

        console.log(`Applying ${buffType} with multiplier ${multiplier}`);

        switch (buffType) {
            case '2x_damage':
                this.gameInstance.applyDamageBuffMultiplier(multiplier);
                break;
            case '2x_attack_speed':
                this.gameInstance.applyAttackSpeedBuffMultiplier(multiplier);
                break;
            case '2x_gameplay':
                this.gameInstance.applyGameplaySpeedBuffMultiplier(multiplier);
                break;
            default:
                console.warn('Unknown buff type:', buffType);
        }
    }

    /**
     * Start interval to update active buffs display and check expiration
     */
    startBuffUpdateInterval() {
        this.buffUpdateInterval = setInterval(() => {
            this.updateActiveBuffsDisplay();
        }, 1000); // Update every second
    }

    /**
     * Update active buffs display with remaining time
     */
    async updateActiveBuffsDisplay() {
        if (!this.sessionId) return;

        try {
            const response = await fetch(`/game/get-active-buffs/?session_id=${this.sessionId}`, {
                method: 'GET',
                headers: {
                    'X-CSRFToken': this.getCsrfToken()
                }
            });

            const data = await response.json();

            if (data.success) {
                const activeBuffsList = document.getElementById('activeBuffsList');
                if (!activeBuffsList) return;

                // Clear previous buffs
                activeBuffsList.innerHTML = '';

                if (data.active_buffs.length > 0) {
                    data.active_buffs.forEach(buff => {
                        const buffBadge = document.createElement('div');
                        buffBadge.className = 'buff-badge';

                        const buffName = {
                            '2x_damage': '⚔️ DAMAGE 2x',
                            '2x_attack_speed': '⚡ ATKSPD 2x',
                            '2x_gameplay': '⏱️ SPEED 2x'
                        }[buff.buff_type] || buff.buff_type;

                        const timeRemaining = Math.max(0, Math.ceil(buff.time_remaining_seconds));

                        buffBadge.innerHTML = `
                            <span class="buff-name">${buffName}</span>
                            <span class="buff-timer">${timeRemaining}s</span>
                        `;

                        activeBuffsList.appendChild(buffBadge);
                    });
                }
            }
        } catch (error) {
            console.error('Error updating buffs display:', error);
        }
    }

    /**
     * Get CSRF token from cookies
     */
    getCsrfToken() {
        let csrfToken = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === ('csrftoken' + '=')) {
                    csrfToken = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return csrfToken;
    }

    /**
     * Get buff multiplier for specific type (call this in your game code)
     */
    async getBuffMultiplier(buffType) {
        try {
            const response = await fetch(
                `/game/get-buff-multiplier/?session_id=${this.sessionId}&buff_type=${buffType}`,
                { method: 'GET' }
            );

            const data = await response.json();
            return data.success ? data.multiplier : 1.0;
        } catch (error) {
            console.error('Error getting buff multiplier:', error);
            return 1.0;
        }
    }

    /**
     * Cleanup on game end
     */
    destroy() {
        if (this.buffUpdateInterval) {
            clearInterval(this.buffUpdateInterval);
        }
    }
}

// ========================================
// INTEGRATION WITH GAME CLASS
// ========================================

// Add these methods to your TowerDefenseGame class:

// In TowerDefenseGame constructor, add:
// this.adBuffManager = null;
// this.damageMultiplier = 1.0;
// this.attackSpeedMultiplier = 1.0;
// this.gameplaySpeedMultiplier = 1.0;

// Add these methods to TowerDefenseGame:

/**
 * Initialize ad/buff manager (call when game session starts)
 */
function initAdBuffManager(sessionId) {
    if (!window.adBuffManager) {
        window.adBuffManager = new AdBuffManager(sessionId);
        // Reference game instance for buff application
        window.adBuffManager.gameInstance = this;
    }
}

/**
 * Apply damage buff multiplier to towers
 */
function applyDamageBuffMultiplier(multiplier) {
    this.damageMultiplier = multiplier;
    console.log('Damage multiplier applied:', multiplier);
}

/**
 * Apply attack speed buff multiplier to towers
 */
function applyAttackSpeedBuffMultiplier(multiplier) {
    this.attackSpeedMultiplier = multiplier;
    console.log('Attack speed multiplier applied:', multiplier);
}

/**
 * Apply gameplay speed buff multiplier
 */
function applyGameplaySpeedBuffMultiplier(multiplier) {
    this.gameplaySpeedMultiplier = multiplier;
    console.log('Gameplay speed multiplier applied:', multiplier);
}

/**
 * Get effective tower damage with buff applied
 */
function getEffectiveTowerDamage(baseDamage) {
    return baseDamage * this.damageMultiplier;
}

/**
 * Get effective attack speed with buff applied
 */
function getEffectiveTowerAttackSpeed(baseSpeed) {
    return baseSpeed * this.attackSpeedMultiplier;
}

/**
 * Get effective game speed with buff applied
 */
function getEffectiveGameplaySpeed() {
    return this.gameplaySpeedMultiplier;
}
