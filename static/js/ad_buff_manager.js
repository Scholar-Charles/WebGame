/**
 * Ads and Buff System Manager
 * Handles advertisement display, tracking, and buff activation
 * Uses Google AdSense for display ads
 */

class AdBuffManager {
    constructor(sessionId) {
        this.sessionId = sessionId;
        this.gameInstance = null; // Reference to TowerDefenseGame instance
        this.adSenseInitialized = false;
        this.currentAdClick = null;
        this.adIsDisplaying = false;
        this.activateAdSenseScript();
        this.initializeEventListeners();
        this.buffUpdateInterval = null;
    }

    /**
     * Load Google AdSense script
     * Replace YOUR_PUBLISHER_ID with your actual AdSense publisher ID
     */
    activateAdSenseScript() {
        // Load Google AdSense SDK
        const script = document.createElement('script');
        script.async = true;
        // Using Google test publisher ID for development
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3940256099942544';
        script.onload = () => {
            console.log('✓ Google AdSense SDK loaded');
            this.adSenseInitialized = true;
        };
        script.onerror = () => {
            console.warn('⚠️ Failed to load Google AdSense SDK, using simulated ads');
            this.adSenseInitialized = false;
        };
        document.head.appendChild(script);
    }

    /**
     * Initialize AdSense display ads
     */
    initializeAdSense() {
        if (!this.adSenseInitialized) {
            console.log('AdSense not ready, using simulated ads');
            return;
        }
        
        try {
            // Push AdSense ads if available
            if (window.adsbygoogle) {
                window.adsbygoogle = window.adsbygoogle || [];
                window.adsbygoogle.push({});
                console.log('✓ AdSense ads initialized');
            }
        } catch (error) {
            console.warn('AdSense initialization warning:', error);
        }
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
     * Show advertisement modal and display ad
     */
    async showAdModal() {
        // Check if gameInstance is available (canvas-based modal)
        if (this.gameInstance && typeof this.gameInstance.openAdModalCanvas === 'function') {
            console.log('Using canvas-based ad modal');
            this.gameInstance.openAdModalCanvas();
            
            // Display ad and wait for completion
            const adDisplayed = await this.displayAd();
            
            if (adDisplayed) {
                // Close ad modal and show buff selection after ad completes
                this.gameInstance.closeAdModalCanvas();
                setTimeout(() => {
                    this.gameInstance.showBuffSelectionModalCanvas();
                }, 500);
            }
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

        // Display advertisement
        console.log('Starting ad display...');
        const adDisplayed = await this.displayAd();

        if (adDisplayed) {
            // Successfully viewed ad
            setTimeout(() => {
                adModal.classList.add('hidden');
                this.showBuffModal();
            }, 1000);
        } else {
            // Ad was skipped
            adModal.classList.add('hidden');
        }
    }

    /**
     * Display advertisement (AdSense display ad or fallback)
     * Shows a 30-second ad with option to skip after 5 seconds
     */
    async displayAd() {
        try {
            // Try to display real AdSense ad first
            if (this.adSenseInitialized) {
                console.log('Displaying Google AdSense display ad...');
                return await this.displayAdSenseAd();
            } else {
                console.log('AdSense not ready, using simulated ad');
                return await this.displaySimulatedAd();
            }
        } catch (error) {
            console.error('Error during ad display:', error);
            return await this.displaySimulatedAd();
        }
    }

    /**
     * Display real Google AdSense display ad
     */
    async displayAdSenseAd() {
        return new Promise((resolve) => {
            try {
                const adContainer = document.getElementById('adSpace');
                if (!adContainer) {
                    console.log('Ad container not found, using simulated ad');
                    resolve(false);
                    return;
                }

                // Create AdSense display ad container
                adContainer.innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <div style="color: #888; margin-bottom: 10px; font-size: 12px;">Advertisement</div>
                        <!-- Google AdSense Display Ad -->
                        <ins class="adsbygoogle"
                             style="display:block; width:300px; height:250px; margin: 0 auto;"
                             data-ad-client="ca-pub-3940256099942544"
                             data-ad-slot="5224354917"
                             data-ad-format="auto"
                             data-full-width-responsive="true"></ins>
                    </div>
                `;

                // Push AdSense to render the ad
                if (window.adsbygoogle) {
                    window.adsbygoogle.push({});
                }

                // 30-second timer with 5-second skip option
                const adDuration = 30000; // 30 seconds
                const skipTime = 5000; // Can skip after 5 seconds
                const startTime = Date.now();
                let skipped = false;

                // Create skip button after 5 seconds
                const skipButton = document.createElement('button');
                skipButton.innerHTML = 'Skip Ad →';
                skipButton.style.cssText = `
                    position: absolute;
                    bottom: 20px;
                    right: 20px;
                    padding: 10px 20px;
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                    opacity: 0;
                    transition: opacity 0.3s;
                `;
                skipButton.onclick = () => {
                    skipped = true;
                    skipButton.remove();
                    resolve(true);
                };

                const updateAdDisplay = () => {
                    const elapsed = Date.now() - startTime;
                    const remaining = Math.max(0, Math.ceil((adDuration - elapsed) / 1000));

                    // Show skip button after 5 seconds
                    if (elapsed >= skipTime && !skipped) {
                        skipButton.style.opacity = '1';
                        if (!skipButton.parentElement) {
                            adContainer.parentElement?.appendChild(skipButton);
                        }
                    }

                    if (remaining > 0 && !skipped) {
                        setTimeout(updateAdDisplay, 100);
                    } else if (!skipped) {
                        skipButton.remove();
                        console.log('✓ AdSense ad completed');
                        resolve(true);
                    }
                };

                updateAdDisplay();

            } catch (error) {
                console.error('AdSense ad display failed:', error);
                resolve(false);
            }
        });
    }

    /**
     * Play simulated advertisement (fallback when AdSense unavailable)
     * Shows a 30-second countdown with skip option after 5 seconds
     */
    async displaySimulatedAd() {
        return new Promise((resolve) => {
            console.log('Displaying simulated ad (30 seconds)...');
            
            const adSpace = document.getElementById('adSpace');
            if (adSpace) {
                adSpace.innerHTML = `
                    <div class="ad-placeholder" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; position: relative;">
                        <div style="color: white; font-size: 24px; margin-bottom: 20px; text-align: center;">📢 ADVERTISEMENT</div>
                        <div style="color: white; font-size: 18px; margin-bottom: 30px;">View this promotion</div>
                        <div class="loading-spinner"></div>
                        <div id="adCountdown" style="color: white; font-size: 32px; font-weight: bold; margin-top: 20px;">30</div>
                    </div>
                `;
            }

            const adDuration = 30000; // 30 seconds
            const skipTime = 5000; // Can skip after 5 seconds
            const startTime = Date.now();
            let skipped = false;

            // Create skip button
            const skipButton = document.createElement('button');
            skipButton.innerHTML = 'Skip Ad →';
            skipButton.style.cssText = `
                position: absolute;
                bottom: 20px;
                right: 20px;
                padding: 10px 20px;
                background: #ff6b6b;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                opacity: 0;
                transition: opacity 0.3s;
                font-family: 'Press Start 2P', cursive;
                font-size: 12px;
            `;
            skipButton.onclick = () => {
                skipped = true;
                skipButton.remove();
                resolve(true);
            };

            const updateAdDisplay = () => {
                const elapsed = Date.now() - startTime;
                const remaining = Math.max(0, Math.ceil((adDuration - elapsed) / 1000));

                const countdownEl = document.getElementById('adCountdown');
                if (countdownEl) {
                    countdownEl.textContent = remaining;
                }

                // Show skip button after 5 seconds
                if (elapsed >= skipTime && !skipped) {
                    skipButton.style.opacity = '1';
                    if (!skipButton.parentElement) {
                        const adSpace = document.getElementById('adSpace');
                        adSpace?.parentElement?.appendChild(skipButton);
                    }
                }

                if (remaining > 0 && !skipped) {
                    setTimeout(updateAdDisplay, 100);
                } else if (!skipped) {
                    skipButton.remove();
                    console.log('✓ Simulated ad completed');
                    resolve(true);
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

        console.log('Ad watch completed! Recording with server...');

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
                    'ad_identifier': 'web-ad-' + Date.now(),
                    'target_url': 'https://example.com',
                    'source_context': 'game_buff'
                })
            });

            const data = await response.json();

            if (data.success) {
                this.currentAdClick = data.ad_click_id;
                console.log('✓ Ad click recorded:', data.ad_click_id);

                // Delay before showing buff selection
                setTimeout(() => {
                    if (usingCanvasModal) {
                        // Canvas modal will show buff selection automatically
                        console.log('Showing buff selection on canvas...');
                    } else {
                        const adModal = document.getElementById('adModal');
                        const adStatus = document.getElementById('adStatus');
                        if (adModal) adModal.classList.add('hidden');
                        if (adStatus) adStatus.classList.add('hidden');
                        this.showBuffModal();
                    }
                }, 500);
            } else {
                console.error('Failed to record ad click:', data.error);
                alert('Error: ' + (data.error || 'Failed to record ad click'));
            }
        } catch (error) {
            console.error('Error recording ad click:', error);
            alert('Error: Could not record ad. Please try again.');
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
