class TowerDefenseGame {
    constructor() {
            // Decorative flower tile
            this.flower1Tile = new Image();
            this.flowerDecorations = null;
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.sessionId = null;
        this.isRunning = false;
        this.isPaused = false;
        
        this.playerGold = 500;
        this.playerLives = 20;
        this.currentWave = 1;
        this.score = 0;
        this.gameStartTime = null;
        
        // Buff multipliers for ad rewards
        this.damageMultiplier = 1.0;
        this.attackSpeedMultiplier = 1.0;
        this.gameplaySpeedMultiplier = 1.0;
        
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.floatingTexts = []; // Array to store floating damage numbers
        this.selectedTower = null;
        
        // Buff expiration tracking
        this.activeBuffs = {}; // Track active buffs and their expiration times
        // activeBuffs format: { '2x_damage': expirationTime, '2x_attack_speed': expirationTime, ... }
        
        // Add tower cooldowns tracking
        this.towerCooldowns = {};
        
        this.waves = [];
        this.waveEnemySpawnQueue = [];
        this.waveStartTime = null;
        this.towerImages = {};
        this.enemyImages = {};
        this.allTowersData = [];
        
        // Wave countdown tracking
        this.countdownActive = false;
        this.countdownStartTime = null;
        this.countdownPausedElapsed = 0; // Track elapsed time when paused
        
        // Tileset images
        this.grassTile = new Image();
        this.dirtPath = new Image();
        this.treeRock = new Image();
        this.bush = new Image();
        this.spawnPoint = new Image();
        this.castle = new Image();
        // Decorative stone tiles
        this.stone1Tile = new Image();
        this.stone2Tile = new Image();
        this.tree1Tile = new Image(); // Add tree image
        // Decorative grass tile
        this.grass1Tile = new Image();
        this.grassDecorations = null;
        // Decorative tree trunk tile
        this.treeTrunkTile = new Image();
        this.treeTrunkDecorations = null;
        
        // Define enemy paths - 3 spawn points that merge and lead to castle
        // Each path is an array of waypoints
        this.paths = [
            // Left path: bottom-left → up → right → up to castle
            [
                { x: 120, y: 460 },  // Spawn point (bottom-left)
                { x: 120, y: 300 },  // Go up to horizontal road
                { x: 320, y: 300 },  // Turn right to center
                { x: 320, y: 80 }    // Go up to castle
            ],
            // Center path: bottom-center → straight up to castle
            [
                { x: 320, y: 460 },  // Spawn point (bottom-center)
                { x: 320, y: 300 },  // Go up to horizontal road
                { x: 320, y: 80 }    // Go up to castle
            ],
            // Right path: bottom-right → up → left → up to castle
            [
                { x: 520, y: 460 },  // Spawn point (bottom-right)
                { x: 520, y: 300 },  // Go up to horizontal road
                { x: 320, y: 300 },  // Turn left to center
                { x: 320, y: 80 }    // Go up to castle
            ]
        ];
        
        // Legacy single path (use center path for compatibility)
        this.path = this.paths[1];
        
        // Decorative tiles - REMOVED (using procedural generation)
        this.decorations = null;
        
        // Add zoom/scale factor
        this.zoomLevel = 1.0; // 1:1 scale for 32x32 tiles on 640x480 canvas (20x15 tiles)
        
        // Add lobby image
        this.lobbyImage = new Image();
        
        // Add start button image
        this.startButtonImage = new Image();
        
        // Add logout button image
        this.logoutButtonImage = new Image();
        
        // Add leaderboard button image
        this.leaderboardButtonImage = new Image();
        
        // Add profile button image
        this.profileButtonImage = new Image();
        
        // Add pause button image
        this.pauseButtonImage = new Image();
        
        // Add watch ad button image
        this.watchAdButtonImage = new Image();
        this.watchAdButtonPressed = false;
        this.watchAdButtonPressTime = 0;
        this.watchAdGlowIntensity = 0; // For pulsing glow effect (0 to 1)
        
        // Add tower slot image
        this.towerSlotImage = new Image();
        this.towerSlots = []; // Array to store tower slot positions
        
        // Add game title image
        this.gameTitle = new Image();
        this.gameTitleDropTime = null;
        
        // Add music button images
        this.musicOnImage = new Image();
        this.musicOffImage = new Image();
        this.musicMuted = false;
        
        // Add pause menu button images
        this.playImage = new Image(); // Resume button image
        this.exitGameImage = new Image(); // Exit game button image
        this.pauseMenuBattleMusicMuted = false; // Separate mute state for pause menu
        
        // Button animation states
        this.startButtonPressed = false;
        this.logoutButtonPressed = false;
        this.leaderboardButtonPressed = false;
        this.profileButtonPressed = false;
        this.musicButtonPressed = false;
        this.pauseButtonPressed = false;
        this.startButtonPressTime = 0;
        this.logoutButtonPressTime = 0;
        this.leaderboardButtonPressTime = 0;
        this.profileButtonPressTime = 0;
        this.musicButtonPressTime = 0;
        this.pauseButtonPressTime = 0;
        
        // Pause menu button states
        this.pauseMenuResumePressed = false;
        this.pauseMenuExitPressed = false;
        this.pauseMenuMutePressed = false;
        this.pauseMenuResumePressTime = 0;
        this.pauseMenuExitPressTime = 0;
        this.pauseMenuMutePressTime = 0;
        
        // Building menu
        this.buildingMenuOpen = false;
        this.hammerButtonImage = new Image();
        this.closeButtonImage = new Image();
        this.buildingMenuClosePressed = false;
        this.buildingMenuCloseTime = 0;
        
        // HUD icons
        this.hpIconImage = new Image();
        this.goldIconImage = new Image();
        
        // Projectile image
        this.projectileImage = new Image();
        
        // In-game message display
        this.gameMessage = null;
        this.gameMessageTime = 0;
        this.gameMessageDuration = 2000; // 2 seconds
        
        // Canvas-based modals state
        this.showAdModalState = false;
        this.showBuffModalState = false;
        this.showAdConfirmModalState = false; // Confirmation dialog before watching ad
        this.showAdVideoModalState = false; // Video ad modal
        this.buffSelected = false; // Track if a buff has been selected (prevent spam clicking)
        this.adModalStartTime = null;
        this.adModalDuration = 5000; // 5 seconds
        this.adVideoDuration = 20000; // 20 seconds for video ad
        this.adVideoUrl = 'https://www.youtube.com/dQw4w9WgXcQ'; // Placeholder video URL - change to your ad
        this.adCooldownTime = 0; // Timestamp when cooldown started
        this.adCooldownDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
        
        // Audio elements
        this.lobbyMusic = new Audio();
        this.battleMusic = new Audio();
        this.buttonClickSound = new Audio();
        this.arrowShotSound = new Audio();
        this.hitGoblinSound = new Audio();
        this.musicStarted = false; // Track if music has started
        
        // Tab visibility tracking
        this.isTabVisible = true;
        this.tabHiddenTime = null; // When tab was hidden
        this.lastFrameTime = Date.now(); // Track last frame time for delta time
        
        this.init();
    }

    init() {
        // Load decorative stone1.png and stone2.png
        this.stone1Tile.src = '/static/img/stone1.png';
        this.stone1Tile.onerror = () => { console.warn('Failed to load stone1.png'); };
        this.stone2Tile.src = '/static/img/stone2.png';
        this.stone2Tile.onerror = () => { console.warn('Failed to load stone2.png'); };
        this.generateStoneDecorations();
        // Load tree image for decorations
        this.tree1Tile.src = '/static/img/Tree1.png';
        this.tree1Tile.onerror = () => { console.warn('Failed to load Tree1.png'); };
        // Load grass image for decorations
        this.grass1Tile.src = '/static/img/grass01.png';
        this.grass1Tile.onerror = () => { console.warn('Failed to load grass image at /static/img/grass.01png'); };
        // Load tree trunk image for decorations
        this.treeTrunkTile.src = '/static/img/TreeTrunk.png';
        this.treeTrunkTile.onerror = () => { console.warn('Failed to load tree trunk image at /static/img/TreeTrunk.png'); };
        // Only generate decorations after tower slots are initialized
        // Load tileset images
        // Load flower image for decorations
        this.flower1Tile.src = '/static/img/flower1.png';
        this.flower1Tile.onerror = () => { console.warn('Failed to load flower1.png'); };
        this.grassTile.src = '/static/img/FieldsTile_38.png'; // Grass tile for background
        this.dirtPath.src = '/static/img/Dirt.png'; // Dirt tile for paths
        this.treeRock.src = '/static/img/trees-rocks.png';
        this.bush.src = '/static/img/bush.png';
        this.spawnPoint.src = '/static/img/spawn-point.png';
        this.castle.src = '/static/img/castle.png';
        
        // Load lobby image and redraw when ready
        this.lobbyImage.src = '/static/img/lobby.png';
        this.lobbyImage.onload = () => {
            if (!this.isRunning) {
                this.drawLobbyScreen();
            }
        };
        this.lobbyImage.onerror = () => {
            console.warn('Failed to load lobby image at /static/img/lobby.png');
        };
        
        // Load start button image
        this.startButtonImage.src = '/static/img/start-battle.png';
        this.startButtonImage.onerror = () => {
            console.warn('Failed to load start button image at /static/img/start-battle.png');
        };
        
        // Load logout button image
        this.logoutButtonImage.src = '/static/img/logout.png';
        this.logoutButtonImage.onerror = () => {
            console.warn('Failed to load logout button image at /static/img/logout.png');
        };
        
        // Load leaderboard button image
        this.leaderboardButtonImage.src = '/static/img/view-lb.png';
        this.leaderboardButtonImage.onerror = () => {
            console.warn('Failed to load leaderboard button image at /static/img/view-lb.png');
        };
        
        // Load profile button image
        this.profileButtonImage.src = '/static/img/Profile.png';
        this.profileButtonImage.onerror = () => {
            console.warn('Failed to load profile button image at /static/img/Profile.png');
        };
        
        // Load pause button image
        this.pauseButtonImage.src = '/static/img/pause.png';
        this.pauseButtonImage.onerror = () => {
            console.warn('Failed to load pause button image at /static/img/pause.png');
        };
        
        // Load watch ad button image
        this.watchAdButtonImage.src = '/static/img/watch-ad.png';
        this.watchAdButtonImage.onerror = () => {
            console.warn('Failed to load watch ad button image at /static/img/watch-ad.png');
        };
        
        // Load tower slot image
        this.towerSlotImage.src = '/static/img/tower-slot.png';
        this.towerSlotImage.onerror = () => {
            console.warn('Failed to load tower slot image at /static/img/tower-slot.png');
        };
        
        // Load pause menu button images
        this.playImage.src = '/static/img/play.png';
        this.playImage.onerror = () => {
            console.warn('Failed to load play image at /static/img/play.png');
        };
        
        this.exitGameImage.src = '/static/img/exit-game.png';
        this.exitGameImage.onerror = () => {
            console.warn('Failed to load exit game image at /static/img/exit-game.png');
        };
        
        // Load hammer and close button images
        this.hammerButtonImage.src = '/static/img/hammer.png';
        this.hammerButtonImage.onerror = () => {
            console.warn('Failed to load hammer button image at /static/img/hammer.png');
        };
        
        this.closeButtonImage.src = '/static/img/close.png';
        this.closeButtonImage.onerror = () => {
            console.warn('Failed to load close button image at /static/img/close.png');
        };
        
        // Load HUD icons
        this.hpIconImage.src = '/static/img/hp-icon.png';
        this.hpIconImage.onerror = () => {
            console.warn('Failed to load hp icon at /static/img/hp-icon.png');
        };
        
        this.goldIconImage.src = '/static/img/gold-icon.png';
        this.goldIconImage.onerror = () => {
            console.warn('Failed to load gold icon at /static/img/gold-icon.png');
        };
        
        // Load projectile image
        this.projectileImage.src = '/static/img/archer-tower-projectile.png';
        this.projectileImage.onerror = () => {
            console.warn('Failed to load projectile image at /static/img/archer-tower-projectile.png');
        };
        
        // Load music button images
        this.musicOnImage.src = '/static/img/music-on.png';
        this.musicOnImage.onerror = () => {
            console.warn('Failed to load music on image at /static/img/music-on.png');
        };
        
        this.musicOffImage.src = '/static/img/music-off.png';
        this.musicOffImage.onerror = () => {
            console.warn('Failed to load music off image at /static/img/music-off.png');
        };
        
        // Load game title image
        this.gameTitle.src = '/static/img/GameTitle.png';
        this.gameTitle.onerror = () => {
            console.warn('Failed to load game title image at /static/img/GameTitle.png');
        };
        
        // Load lobby music
        this.lobbyMusic.src = '/static/audio/lobby-music.mp3';
        this.lobbyMusic.loop = true;
        this.lobbyMusic.volume = 0.5; // Set volume to 50%
        this.lobbyMusic.onerror = () => {
            console.warn('Failed to load lobby music at /static/audio/lobby-music.mp3');
        };
        
        // Load button click sound
        this.buttonClickSound.src = '/static/audio/button-click.mp3';
        this.buttonClickSound.volume = 0.7; // Set volume to 70%
        this.buttonClickSound.onerror = () => {
            console.warn('Failed to load button click sound at /static/audio/button-click.mp3');
        };
        
        // Load arrow shot sound
        this.arrowShotSound.src = '/static/audio/arrow-shot.mp3';
        this.arrowShotSound.volume = 0.6; // Set volume to 60%
        this.arrowShotSound.onerror = () => {
            console.warn('Failed to load arrow shot sound at /static/audio/arrow-shot.mp3');
        };
        
        // Load hit goblin sound
        this.hitGoblinSound.src = '/static/audio/hit-goblin.mp3';
        this.hitGoblinSound.volume = 0.7; // Set volume to 70%
        this.hitGoblinSound.onerror = () => {
            console.warn('Failed to load hit goblin sound at /static/audio/hit-goblin.mp3');
        };
        
        // Load battle music
        this.battleMusic.src = '/static/audio/battle-music.mp3';
        this.battleMusic.loop = true;
        this.battleMusic.volume = 0.5; // Set volume to 50%
        this.battleMusic.onerror = () => {
            console.warn('Failed to load battle music at /static/audio/battle-music.mp3');
        };
        
        // Disable image smoothing to prevent gaps between tiles
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.msImageSmoothingEnabled = false;
        
        const startBtn = document.getElementById('startGameBtn');
        const pauseBtn = document.getElementById('pauseGameBtn');
        const endBtn = document.getElementById('endGameBtn');
        
        if (startBtn) startBtn.addEventListener('click', () => {
            this.playButtonClickSound();
            this.startGame();
        });
        if (pauseBtn) pauseBtn.addEventListener('click', () => {
            this.playButtonClickSound();
            this.togglePause();
        });
        if (endBtn) endBtn.addEventListener('click', () => {
            this.playButtonClickSound();
            this.endGame();
        });
        
        document.querySelectorAll('.btn-select-tower').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.playButtonClickSound();
                const towerId = e.target.closest('.tower-card').dataset.towerId;
                this.selectTower(towerId);
            });
        });

        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this.placeOnCanvas(e));
        }
        
        // Set up visibility change detection
        this.setupVisibilityHandling();
        
        // Load waves and tower images on init
        this.loadWavesAndEnemies();
        this.loadTowerImages();
        this.initializeTowerSlots();
        this.drawLobbyScreen();
        this.lobbyLoop();
    }
    
    initializeTowerSlots() {
        this.towerSlots = [];
        const slotSize = 32;
        
        // Tower slot positions properly placed beside each road
        // Road width is 32px, so slots are offset ~24px from road center
        const slotPositions = [
            // === LEFT VERTICAL ROAD (x=120) - from spawn to horizontal ===
            { x: 88, y: 420 },    // Left side, lower
            { x: 152, y: 420 },   // Right side, lower
            { x: 88, y: 360 },    // Left side, upper
            { x: 152, y: 360 },   // Right side, upper
            
            // === CENTER VERTICAL ROAD (x=320) - from spawn to horizontal ===
            { x: 288, y: 420 },   // Left side, lower
            { x: 352, y: 420 },   // Right side, lower
            { x: 288, y: 360 },   // Left side, upper
            { x: 352, y: 360 },   // Right side, upper
            
            // === RIGHT VERTICAL ROAD (x=520) - from spawn to horizontal ===
            { x: 488, y: 420 },   // Left side, lower
            { x: 552, y: 420 },   // Right side, lower
            { x: 488, y: 360 },   // Left side, upper
            { x: 552, y: 360 },   // Right side, upper
            
            // === HORIZONTAL ROAD (y=300) - left section (x=120 to x=320) ===
            { x: 200, y: 268 },   // Above road, left
            { x: 240, y: 268 },   // Above road, right
            
            // === HORIZONTAL ROAD (y=300) - right section (x=320 to x=520) ===
            { x: 400, y: 268 },   // Above road, left
            { x: 440, y: 268 },   // Above road, right
            
            // === UPPER CENTER ROAD (x=320) - from horizontal to castle ===
            { x: 288, y: 220 },   // Left side, lower
            { x: 352, y: 220 },   // Right side, lower
            { x: 288, y: 170 },   // Left side, upper
            { x: 352, y: 170 },   // Right side, upper
        ];
        
        // Create tower slots from defined positions
        slotPositions.forEach(pos => {
            this.towerSlots.push({
                x: pos.x,
                y: pos.y,
                size: slotSize,
                occupied: false,
                towerIndex: null
            });
        });
        
        console.log(`Initialized ${this.towerSlots.length} tower slots for 3-road map`);

        // Generate decorations only once, after slots are ready
        if (!this.decorations) {
            this.generateStoneDecorations();
        }
        // Generate tree decorations only once, after slots are ready
        if (!this.treeDecorations) {
            this.generateTreeDecorations();
        }
        // Generate flower decorations only once, after slots are ready
        if (!this.flowerDecorations) {
            this.generateFlowerDecorations();
        }
        // Generate grass decorations only once, after slots are ready
        if (!this.grassDecorations) {
            this.generateGrassDecorations();
        }
        // Generate tree trunk decorations only once, after slots are ready
        if (!this.treeTrunkDecorations) {
            this.generateTreeTrunkDecorations();
        }
    }
    
    drawTowerSlots() {
        const slotSize = 32;
        
        this.towerSlots.forEach((slot, index) => {
            // Skip drawing if slot is occupied (tower built here)
            if (slot.occupied) return;
            
            const slotImg = this.towerSlotImage;
            
            // Draw slot image if loaded
            if (slotImg && slotImg.complete && slotImg.naturalWidth > 0) {
                this.ctx.drawImage(slotImg, slot.x - slotSize / 2, slot.y - slotSize / 2, slotSize, slotSize);
            } else {
                // Fallback - draw as a simple square with border
                const occupied = slot.occupied;
                this.ctx.fillStyle = occupied ? 'rgba(100, 100, 100, 0.7)' : 'rgba(200, 200, 150, 0.6)';
                this.ctx.fillRect(slot.x - slotSize / 2, slot.y - slotSize / 2, slotSize, slotSize);
                
                this.ctx.strokeStyle = occupied ? '#666666' : '#999900';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(slot.x - slotSize / 2, slot.y - slotSize / 2, slotSize, slotSize);
            }
            
            // Draw slot number only if unoccupied
            // if (!slot.occupied) {
            //     this.ctx.fillStyle = '#ffffff';
            //     this.ctx.font = 'bold 10px Arial';
            //     this.ctx.textAlign = 'center';
            //     this.ctx.textBaseline = 'middle';
            //     this.ctx.fillText((index + 1).toString(), slot.x, slot.y);
            // }
        });
    }
    
    lobbyLoop() {
        if (this.isRunning) return; // Stop lobby loop when game starts
        
        this.drawLobbyScreen();
        requestAnimationFrame(() => this.lobbyLoop());
    }

    setupVisibilityHandling() {
        // Detect when tab/window becomes visible or hidden
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Tab is now hidden
                this.isTabVisible = false;
                this.tabHiddenTime = Date.now();
                
                // Auto-pause the game if it's running
                if (this.isRunning && !this.isPaused) {
                    this.togglePause();
                }
            } else {
                // Tab is now visible
                this.isTabVisible = true;
                
                // Reset frame time to prevent delta time spike
                this.lastFrameTime = Date.now();
                
                // If wave start time was set, update it to account for hidden time
                if (this.waveStartTime) {
                    const hiddenDuration = Date.now() - this.tabHiddenTime;
                    this.waveStartTime += hiddenDuration;
                }
                
                // If countdown was active, update its start time
                if (this.countdownActive && this.countdownStartTime) {
                    const hiddenDuration = Date.now() - this.tabHiddenTime;
                    this.countdownStartTime += hiddenDuration;
                }
            }
        });
        
        // Also handle focus/blur events for additional compatibility
        window.addEventListener('blur', () => {
            this.isTabVisible = false;
            this.tabHiddenTime = Date.now();
            
            if (this.isRunning && !this.isPaused) {
                this.togglePause();
            }
        });
        
        window.addEventListener('focus', () => {
            this.isTabVisible = true;
            
            // Reset frame time
            this.lastFrameTime = Date.now();
            
            // Adjust wave start time
            if (this.waveStartTime) {
                const hiddenDuration = Date.now() - this.tabHiddenTime;
                this.waveStartTime += hiddenDuration;
            }
            
            // Adjust countdown time
            if (this.countdownActive && this.countdownStartTime) {
                const hiddenDuration = Date.now() - this.tabHiddenTime;
                this.countdownStartTime += hiddenDuration;
            }
        });
    }

    drawLobbyScreen() {
        // Draw lobby background
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw lobby image scaled to fill entire canvas (cover mode - may crop)
        if (this.lobbyImage.complete && this.lobbyImage.naturalWidth > 0) {
            const imgAspect = this.lobbyImage.naturalWidth / this.lobbyImage.naturalHeight;
            const canvasAspect = this.canvas.width / this.canvas.height;
            
            let drawWidth, drawHeight, drawX, drawY;
            
            if (canvasAspect < imgAspect) {
                drawHeight = this.canvas.height;
                drawWidth = drawHeight * imgAspect;
                drawX = (this.canvas.width - drawWidth) / 2;
                drawY = 0;
            } else {
                drawWidth = this.canvas.width;
                drawHeight = drawWidth / imgAspect;
                drawX = 0;
                drawY = (this.canvas.height - drawHeight) / 2;
            }
            
            this.ctx.drawImage(this.lobbyImage, drawX, drawY, drawWidth, drawHeight);
        } else {
            this.ctx.fillStyle = '#667eea';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading lobby...', this.canvas.width / 2, this.canvas.height / 2 - 30);
        }
        
        // Draw game title with drop-down animation
        this.drawGameTitle();
        
        // Draw start button
        this.drawStartButton();
        
        // Draw logout button
        this.drawLogoutButton();
        
        // Draw profile button
        this.drawProfileButton();
        
        // Draw leaderboard button
        this.drawLeaderboardButton();
        
        // Draw music button
        this.drawMusicButton();
    }
    
    drawMusicButton() {
        const buttonSize = 40;
        const padding = 10;
        const buttonX = padding + 50; // Positioned to the right of logout button
        const buttonY = this.canvas.height - buttonSize - padding;
        
        // Calculate animation offset
        let offsetX = buttonX;
        let offsetY = buttonY;
        let scale = 1;
        
        if (this.musicButtonPressed) {
            const timeSincePress = Date.now() - this.musicButtonPressTime;
            if (timeSincePress < 100) {
                // Press down animation
                offsetY += 3;
                scale = 0.95;
            } else if (timeSincePress < 200) {
                // Pop back up animation
                const progress = (timeSincePress - 100) / 100;
                offsetY += 3 * (1 - progress);
                scale = 0.95 + (0.05 * progress);
            } else {
                this.musicButtonPressed = false;
            }
        }
        
        // Draw button image based on mute state
        const buttonImage = this.musicMuted ? this.musicOffImage : this.musicOnImage;
        if (buttonImage.complete && buttonImage.naturalWidth > 0) {
            this.ctx.save();
            this.ctx.translate(offsetX + buttonSize / 2, offsetY + buttonSize / 2);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-(buttonSize / 2), -(buttonSize / 2));
            this.ctx.drawImage(buttonImage, 0, 0, buttonSize, buttonSize);
            this.ctx.restore();
        } else {
            // Fallback - draw background and text
            this.ctx.fillStyle = this.musicMuted ? 'rgba(211, 211, 211, 0.9)' : 'rgba(255, 193, 7, 0.9)';
            this.ctx.fillRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            this.ctx.strokeStyle = this.musicMuted ? '#d3d3d3' : '#ffc107';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.musicMuted ? 'M' : '♪', offsetX + (buttonSize * scale) / 2, offsetY + (buttonSize * scale) / 2);
        }
        
        // Store button position (exact button size)
        this.musicButtonPos = {
            left: buttonX,
            top: buttonY,
            right: buttonX + buttonSize,
            bottom: buttonY + buttonSize
        };
    }
    
    drawGameTitle() {
        // Initialize drop animation on first draw
        if (this.gameTitleDropTime === null) {
            this.gameTitleDropTime = Date.now();
        }
        
        const titleSize = 300;
        const centerX = this.canvas.width / 2;
        const finalY = this.canvas.height / 3 - titleSize / 2; // Center vertically
        const dropDuration = 600; // Animation duration in ms
        
        // Calculate animation progress
        const elapsedTime = Date.now() - this.gameTitleDropTime;
        let offsetY = -titleSize; // Start off-screen top
        let opacity = 1;
        let animationComplete = false;
        
        if (elapsedTime < dropDuration) {
            // Drop animation with ease-out cubic effect
            const progress = elapsedTime / dropDuration;
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
            offsetY = -titleSize + (finalY + titleSize) * easeProgress;
            opacity = Math.min(1, easeProgress);
        } else {
            // Stay at final position
            offsetY = finalY;
            opacity = 1;
            animationComplete = true;
        }
        
        // Calculate glow effect after animation completes
        let glowOpacity = 0;
        if (animationComplete) {
            // Pulsing glow effect using sine wave (cycles every 2 seconds)
            const glowCycle = ((Date.now() - this.gameTitleDropTime - dropDuration) / 2000) % 1;
            glowOpacity = Math.sin(glowCycle * Math.PI * 2) * 0.5 + 0.5; // Oscillates between 0 and 1
            glowOpacity *= 0.6; // Max glow opacity at 0.6
        }
        
        // Draw game title image with glow
        if (this.gameTitle.complete && this.gameTitle.naturalWidth > 0) {
            this.ctx.save();
            
            // Draw glow effect
            if (glowOpacity > 0) {
                this.ctx.shadowColor = 'rgba(255, 200, 0, ' + glowOpacity + ')';
                this.ctx.shadowBlur = 30 + (glowOpacity * 20);
                this.ctx.shadowOffsetX = 0;
                this.ctx.shadowOffsetY = 0;
            }
            
            this.ctx.globalAlpha = opacity;
            this.ctx.drawImage(
                this.gameTitle,
                centerX - titleSize / 2,
                offsetY,
                titleSize,
                titleSize
            );
            this.ctx.restore();
        } else {
            this.ctx.save();
            this.ctx.globalAlpha = opacity;
            this.ctx.fillStyle = '#667eea';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('TOWER DEFENSE', centerX, offsetY + titleSize / 2);
            this.ctx.restore();
        }
    }

    drawStartButton() {
        const buttonSize = 90;
        const padding = 10;
        const buttonX = this.canvas.width - buttonSize - padding;
        const buttonY = this.canvas.height - buttonSize - padding;
        
        // Calculate animation offset
        let offsetX = buttonX;
        let offsetY = buttonY;
        let scale = 1;
        
        if (this.startButtonPressed) {
            const timeSincePress = Date.now() - this.startButtonPressTime;
            if (timeSincePress < 100) {
                // Press down animation
                offsetY += 5;
                scale = 0.95;
            } else if (timeSincePress < 200) {
                // Pop back up animation
                const progress = (timeSincePress - 100) / 100;
                offsetY += 5 * (1 - progress);
                scale = 0.95 + (0.05 * progress);
            } else {
                this.startButtonPressed = false;
            }
        }
        
        // Draw button image if loaded
        if (this.startButtonImage.complete && this.startButtonImage.naturalWidth > 0) {
            this.ctx.save();
            this.ctx.translate(offsetX + buttonSize / 2, offsetY + buttonSize / 2);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-(buttonSize / 2), -(buttonSize / 2));
            this.ctx.drawImage(this.startButtonImage, 0, 0, buttonSize, buttonSize);
            this.ctx.restore();
        } else {
            // Fallback - draw background and text
            this.ctx.fillStyle = 'rgba(102, 126, 234, 0.9)';
            this.ctx.fillRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            this.ctx.strokeStyle = '#667eea';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('START', offsetX + (buttonSize * scale) / 2, offsetY + (buttonSize * scale) / 2);
        }
        
        // Store button position (exact button size)
        this.startButtonPos = {
            left: buttonX,
            top: buttonY,
            right: buttonX + buttonSize,
            bottom: buttonY + buttonSize
        };
    }

    drawLogoutButton() {
        const buttonSize = 40;
        const padding = 10;
        const buttonX = padding;
        const buttonY = this.canvas.height - buttonSize - padding;
        
        // Calculate animation offset
        let offsetX = buttonX;
        let offsetY = buttonY;
        let scale = 1;
        
        if (this.logoutButtonPressed) {
            const timeSincePress = Date.now() - this.logoutButtonPressTime;
            if (timeSincePress < 100) {
                // Press down animation
                offsetY += 3;
                scale = 0.95;
            } else if (timeSincePress < 200) {
                // Pop back up animation
                const progress = (timeSincePress - 100) / 100;
                offsetY += 3 * (1 - progress);
                scale = 0.95 + (0.05 * progress);
            } else {
                this.logoutButtonPressed = false;
            }
        }
        
        // Draw button image if loaded
        if (this.logoutButtonImage.complete && this.logoutButtonImage.naturalWidth > 0) {
            this.ctx.save();
            this.ctx.translate(offsetX + buttonSize / 2, offsetY + buttonSize / 2);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-(buttonSize / 2), -(buttonSize / 2));
            this.ctx.drawImage(this.logoutButtonImage, 0, 0, buttonSize, buttonSize);
            this.ctx.restore();
        } else {
            // Fallback - draw background and text
            this.ctx.fillStyle = 'rgba(244, 67, 54, 0.9)';
            this.ctx.fillRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            this.ctx.strokeStyle = '#f44336';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('OUT', offsetX + (buttonSize * scale) / 2, offsetY + (buttonSize * scale) / 2);
        }
        
        // Store button position (exact button size)
        this.logoutButtonPos = {
            left: buttonX,
            top: buttonY,
            right: buttonX + buttonSize,
            bottom: buttonY + buttonSize
        };
    }

    drawProfileButton() {
        const buttonSize = 40;
        const padding = 10;
        const buttonX = this.canvas.width - (buttonSize * 2) - (padding * 2) - 10; // Left of leaderboard button
        const buttonY = padding;
        
        // Calculate animation offset
        let offsetX = buttonX;
        let offsetY = buttonY;
        let scale = 1;
        
        if (this.profileButtonPressed) {
            const timeSincePress = Date.now() - this.profileButtonPressTime;
            if (timeSincePress < 100) {
                // Press down animation
                offsetY += 3;
                scale = 0.95;
            } else if (timeSincePress < 200) {
                // Pop back up animation
                const progress = (timeSincePress - 100) / 100;
                offsetY += 3 * (1 - progress);
                scale = 0.95 + (0.05 * progress);
            } else {
                this.profileButtonPressed = false;
            }
        }
        
        // Draw button image if loaded
        if (this.profileButtonImage.complete && this.profileButtonImage.naturalWidth > 0) {
            this.ctx.save();
            this.ctx.translate(offsetX + buttonSize / 2, offsetY + buttonSize / 2);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-(buttonSize / 2), -(buttonSize / 2));
            this.ctx.drawImage(this.profileButtonImage, 0, 0, buttonSize, buttonSize);
            this.ctx.restore();
        } else {
            // Fallback - draw background and text
            this.ctx.fillStyle = 'rgba(156, 39, 176, 0.9)';
            this.ctx.fillRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            this.ctx.strokeStyle = '#9c27b0';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('P', offsetX + (buttonSize * scale) / 2, offsetY + (buttonSize * scale) / 2);
        }
        
        // Store button position (exact button size)
        this.profileButtonPos = {
            left: buttonX,
            top: buttonY,
            right: buttonX + buttonSize,
            bottom: buttonY + buttonSize
        };
    }

    drawLeaderboardButton() {
        const buttonSize = 40;
        const padding = 10;
        const buttonX = this.canvas.width - buttonSize - padding;
        const buttonY = padding;
        
        // Calculate animation offset
        let offsetX = buttonX;
        let offsetY = buttonY;
        let scale = 1;
        
        if (this.leaderboardButtonPressed) {
            const timeSincePress = Date.now() - this.leaderboardButtonPressTime;
            if (timeSincePress < 100) {
                // Press down animation
                offsetY += 3;
                scale = 0.95;
            } else if (timeSincePress < 200) {
                // Pop back up animation
                const progress = (timeSincePress - 100) / 100;
                offsetY += 3 * (1 - progress);
                scale = 0.95 + (0.05 * progress);
            } else {
                this.leaderboardButtonPressed = false;
            }
        }
        
        // Draw button image if loaded
        if (this.leaderboardButtonImage.complete && this.leaderboardButtonImage.naturalWidth > 0) {
            this.ctx.save();
            this.ctx.translate(offsetX + buttonSize / 2, offsetY + buttonSize / 2);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-(buttonSize / 2), -(buttonSize / 2));
            this.ctx.drawImage(this.leaderboardButtonImage, 0, 0, buttonSize, buttonSize);
            this.ctx.restore();
        } else {
            // Fallback - draw background and text
            this.ctx.fillStyle = 'rgba(76, 175, 80, 0.9)';
            this.ctx.fillRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            this.ctx.strokeStyle = '#4caf50';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('LB', offsetX + (buttonSize * scale) / 2, offsetY + (buttonSize * scale) / 2);
        }
        
        // Store button position (exact button size)
        this.leaderboardButtonPos = {
            left: buttonX,
            top: buttonY,
            right: buttonX + buttonSize,
            bottom: buttonY + buttonSize
        };
    }

    drawPauseButton() {
        const buttonSize = 40;
        const padding = 10;
        const buttonX = this.canvas.width - buttonSize - padding;
        const buttonY = padding;
        
        // Calculate animation offset
        let offsetX = buttonX;
        let offsetY = buttonY;
        let scale = 1;
        
        if (this.pauseButtonPressed) {
            const timeSincePress = Date.now() - this.pauseButtonPressTime;
            if (timeSincePress < 100) {
                // Press down animation
                offsetY += 3;
                scale = 0.95;
            } else if (timeSincePress < 200) {
                // Pop back up animation
                const progress = (timeSincePress - 100) / 100;
                offsetY += 3 * (1 - progress);
                scale = 0.95 + (0.05 * progress);
            } else {
                this.pauseButtonPressed = false;
            }
        }
        
        // Draw button image if loaded
        if (this.pauseButtonImage.complete && this.pauseButtonImage.naturalWidth > 0) {
            this.ctx.save();
            this.ctx.translate(offsetX + buttonSize / 2, offsetY + buttonSize / 2);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-(buttonSize / 2), -(buttonSize / 2));
            this.ctx.drawImage(this.pauseButtonImage, 0, 0, buttonSize, buttonSize);
            this.ctx.restore();
        } else {
            // Fallback - draw background and text
            this.ctx.fillStyle = 'rgba(255, 152, 0, 0.9)';
            this.ctx.fillRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            this.ctx.strokeStyle = '#ff9800';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(offsetX, offsetY, buttonSize * scale, buttonSize * scale);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(this.isPaused ? '▶' : '⏸', offsetX + (buttonSize * scale) / 2, offsetY + (buttonSize * scale) / 2);
        }
        
        // Store button position (exact button size)
        this.pauseButtonPos = {
            left: buttonX,
            top: buttonY,
            right: buttonX + buttonSize,
            bottom: buttonY + buttonSize
        };
    }

    drawWaveInfoDisplay() {
        const padding = 6;
        const lineHeight = 13;
        const textPadding = 8;
        
        // Set up fonts for measurement
        this.ctx.font = 'bold 12px Arial';
        const titleText = `Wave ${this.currentWave}`;
        const titleWidth = this.ctx.measureText(titleText).width;
        
        this.ctx.font = '10px Arial';
        let maxEnemyWidth = 0;
        let enemyCount = 0;
        
        const currentWave = this.waves[this.currentWave - 1];
        if (currentWave) {
            currentWave.enemies.forEach((enemy, index) => {
                if (index < 5) {
                    const enemyText = `${enemy.enemy_name} ×${enemy.enemy_count}`;
                    const width = this.ctx.measureText(enemyText).width;
                    maxEnemyWidth = Math.max(maxEnemyWidth, width);
                    enemyCount++;
                }
            });
            
            if (currentWave.enemies.length > 5) {
                const moreText = `+${currentWave.enemies.length - 5} more`;
                const width = this.ctx.measureText(moreText).width;
                maxEnemyWidth = Math.max(maxEnemyWidth, width);
                enemyCount++;
            }
        }
        
        // Calculate panel dimensions based on content
        const contentWidth = Math.max(titleWidth, maxEnemyWidth);
        const panelWidth = contentWidth + textPadding * 2 + 4;
        const panelHeight = padding + 16 + 8 + (enemyCount * lineHeight) + padding;
        
        const panelX = this.canvas.width - panelWidth - 10;
        const panelY = 60; // Below pause button
        
        // Draw dark interior background
        this.ctx.fillStyle = 'rgba(30, 25, 20, 0.85)';
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Draw light wooden border (outer)
        this.ctx.strokeStyle = '#D4A574';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Draw inner border highlight
        this.ctx.strokeStyle = '#E8C89E';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(panelX + 2, panelY + 2, panelWidth - 4, panelHeight - 4);
        
        // Draw title - Wave number
        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(titleText, panelX + panelWidth / 2, panelY + padding + 2);
        
        // Draw divider line
        this.ctx.strokeStyle = '#D4A574';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(panelX + 4, panelY + padding + 18);
        this.ctx.lineTo(panelX + panelWidth - 4, panelY + padding + 18);
        this.ctx.stroke();
        
        // Draw enemy info
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        if (currentWave) {
            let yOffset = padding + 24;
            
            currentWave.enemies.forEach((enemy, index) => {
                if (index < 5) {
                    const enemyText = `${enemy.enemy_name} ×${enemy.enemy_count}`;
                    this.ctx.fillText(enemyText, panelX + textPadding, panelY + yOffset);
                    yOffset += lineHeight;
                }
            });
            
            // If more than 5 enemies, show indicator
            if (currentWave.enemies.length > 5) {
                this.ctx.fillText(`+${currentWave.enemies.length - 5} more`, panelX + textPadding, panelY + yOffset);
            }
        }

    }

    showPauseMenu() {
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Menu dimensions - smaller rectangular shape
        const menuWidth = 320;
        const menuHeight = 180;
        const menuX = (this.canvas.width - menuWidth) / 2;
        const menuY = (this.canvas.height - menuHeight) / 2;
        const buttonSize = 50;
        const buttonSpacing = 25;
        const padding = 15;
        
        // Draw dark interior background
        this.ctx.fillStyle = 'rgba(35, 30, 25, 0.95)';
        this.ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
        
        // Draw light wooden border (outer)
        this.ctx.strokeStyle = '#D4A574';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
        
        // Draw inner border highlight
        this.ctx.strokeStyle = '#E8C89E';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(menuX + 3, menuY + 3, menuWidth - 6, menuHeight - 6);
        
        // Draw title
        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, menuY + padding);
        
        // Draw divider line
        this.ctx.strokeStyle = '#D4A574';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(menuX + padding, menuY + 45);
        this.ctx.lineTo(menuX + menuWidth - padding, menuY + 45);
        this.ctx.stroke();
        
        // Button layout - 3 buttons in a row, centered
        const buttonsAreaY = menuY + 75;
        const totalButtonWidth = (buttonSize * 3) + (buttonSpacing * 2);
        const buttonsStartX = (this.canvas.width - totalButtonWidth) / 2;
        
        // Resume Button
        const resumeX = buttonsStartX;
        const resumeY = buttonsAreaY;
        this.drawPauseMenuButton(resumeX, resumeY, buttonSize, this.playImage, 'Resume', this.pauseMenuResumePressed, this.pauseMenuResumePressTime, '▶');
        this.pauseMenuResumePos = {
            left: resumeX,
            top: resumeY,
            right: resumeX + buttonSize,
            bottom: resumeY + buttonSize
        };
        
        // Exit Button
        const exitX = buttonsStartX + buttonSize + buttonSpacing;
        const exitY = buttonsAreaY;
        this.drawPauseMenuButton(exitX, exitY, buttonSize, this.exitGameImage, 'Exit', this.pauseMenuExitPressed, this.pauseMenuExitPressTime, '⊗');
        this.pauseMenuExitPos = {
            left: exitX,
            top: exitY,
            right: exitX + buttonSize,
            bottom: exitY + buttonSize
        };
        
        // Mute Button
        const muteX = buttonsStartX + (buttonSize + buttonSpacing) * 2;
        const muteY = buttonsAreaY;
        const muteImage = this.pauseMenuBattleMusicMuted ? this.musicOffImage : this.musicOnImage;
        this.drawPauseMenuButton(muteX, muteY, buttonSize, muteImage, 'Mute', this.pauseMenuMutePressed, this.pauseMenuMutePressTime, this.pauseMenuBattleMusicMuted ? '🔇' : '🔊');
        this.pauseMenuMutePos = {
            left: muteX,
            top: muteY,
            right: muteX + buttonSize,
            bottom: muteY + buttonSize
        };
    }

    drawPauseMenuButton(x, y, size, image, label, isPressed, pressTime, fallbackText) {
        // Calculate animation offset
        let offsetX = x;
        let offsetY = y;
        let scale = 1;
        
        if (isPressed) {
            const timeSincePress = Date.now() - pressTime;
            if (timeSincePress < 100) {
                offsetY += 3;
                scale = 0.95;
            } else if (timeSincePress < 200) {
                // Return to normal
            } else {
                // Reset pressed state
                this.pauseMenuResumePressed = false;
                this.pauseMenuExitPressed = false;
                this.pauseMenuMutePressed = false;
            }
        }
        
        // Draw button background with leather texture
        const gradient = this.ctx.createLinearGradient(offsetX, offsetY, offsetX, offsetY + size);
        gradient.addColorStop(0, '#8b7355');
        gradient.addColorStop(1, '#6d5d52');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(offsetX, offsetY, size * scale, size * scale);
        
        // Button border
        this.ctx.strokeStyle = '#4a342c';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(offsetX, offsetY, size * scale, size * scale);
        
        // Draw button image if loaded
        if (image && image.complete && image.naturalWidth > 0) {
            this.ctx.save();
            this.ctx.translate(offsetX + (size * scale) / 2, offsetY + (size * scale) / 2);
            this.ctx.scale(scale, scale);
            this.ctx.translate(-(size / 2), -(size / 2));
            this.ctx.drawImage(image, 0, 0, size, size);
            this.ctx.restore();
        } else {
            // Fallback - draw icon as text
            this.ctx.fillStyle = '#ffc107';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(fallbackText, offsetX + (size * scale) / 2, offsetY + (size * scale) / 2);
        }
        
        // Draw label below button
        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(label, offsetX + (size * scale) / 2, offsetY + size * scale + 10);
    }

    // ========================================
    // CANVAS-BASED AD & BUFF MODAL METHODS
    // ========================================

    showAdModalCanvas() {
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Modal dimensions
        const modalWidth = 380;
        const modalHeight = 260;
        const modalX = (this.canvas.width - modalWidth) / 2;
        const modalY = (this.canvas.height - modalHeight) / 2;
        const padding = 15;
        const borderWidth = 3;
        
        // Draw wood-style border (light)
        const borderGradient = this.ctx.createLinearGradient(modalX, modalY, modalX, modalY + modalHeight);
        borderGradient.addColorStop(0, '#c9a961');
        borderGradient.addColorStop(0.5, '#b8956f');
        borderGradient.addColorStop(1, '#a0754d');
        this.ctx.fillStyle = borderGradient;
        this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
        
        // Draw darker wood inside
        const innerGradient = this.ctx.createLinearGradient(modalX + borderWidth, modalY + borderWidth, modalX + borderWidth, modalY + modalHeight - borderWidth);
        innerGradient.addColorStop(0, '#4a3728');
        innerGradient.addColorStop(0.5, '#3d2f23');
        innerGradient.addColorStop(1, '#2d1f18');
        this.ctx.fillStyle = innerGradient;
        this.ctx.fillRect(modalX + borderWidth, modalY + borderWidth, modalWidth - borderWidth * 2, modalHeight - borderWidth * 2);
        
        // Draw title
        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('WATCH AD FOR BUFF', this.canvas.width / 2, modalY + padding + 5);
        
        // Draw divider line
        this.ctx.strokeStyle = '#c9a961';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(modalX + padding, modalY + padding + 30);
        this.ctx.lineTo(modalX + modalWidth - padding, modalY + padding + 30);
        this.ctx.stroke();
        
        // Draw content area text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Loading Advertisement...', this.canvas.width / 2, modalY + modalHeight / 2 - 30);
        
        // Draw loading spinner (simple circle animation)
        const spinnerSize = 30;
        const spinnerX = this.canvas.width / 2;
        const spinnerY = modalY + modalHeight / 2 + 20;
        const rotation = (Date.now() / 20) % 360;
        
        this.ctx.save();
        this.ctx.translate(spinnerX, spinnerY);
        this.ctx.rotate(rotation * Math.PI / 180);
        this.ctx.strokeStyle = '#ffc107';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, spinnerSize, 0, Math.PI * 1.5);
        this.ctx.stroke();
        this.ctx.restore();
        
        // Store modal position for click detection (close button)
        this.adModalClosePos = {
            left: modalX + modalWidth - 40,
            top: modalY + 15,
            right: modalX + modalWidth - 15,
            bottom: modalY + 40
        };
    }

    showBuffSelectionModalCanvas() {
        // Reset buff selection flag for this modal
        this.buffSelected = false;
        
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Modal dimensions - fit exactly to buff cards (even smaller)
        const cardWidth = 130;
        const cardHeight = 150;
        const cardSpacing = 12;
        const totalCardWidth = (cardWidth * 3) + (cardSpacing * 2);
        const modalWidth = totalCardWidth + 30;
        const modalHeight = 230;
        const modalX = (this.canvas.width - modalWidth) / 2;
        const modalY = (this.canvas.height - modalHeight) / 2;
        const padding = 10;
        const borderWidth = 3;
        
        // Draw wood-style border (light)
        const borderGradient = this.ctx.createLinearGradient(modalX, modalY, modalX, modalY + modalHeight);
        borderGradient.addColorStop(0, '#c9a961');
        borderGradient.addColorStop(0.5, '#b8956f');
        borderGradient.addColorStop(1, '#a0754d');
        this.ctx.fillStyle = borderGradient;
        this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
        
        // Draw darker wood inside
        const innerGradient = this.ctx.createLinearGradient(modalX + borderWidth, modalY + borderWidth, modalX + borderWidth, modalY + modalHeight - borderWidth);
        innerGradient.addColorStop(0, '#4a3728');
        innerGradient.addColorStop(0.5, '#3d2f23');
        innerGradient.addColorStop(1, '#2d1f18');
        this.ctx.fillStyle = innerGradient;
        this.ctx.fillRect(modalX + borderWidth, modalY + borderWidth, modalWidth - borderWidth * 2, modalHeight - borderWidth * 2);
        
        // Draw title
        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('CHOOSE YOUR BUFF', this.canvas.width / 2, modalY + padding + 3);
        
        // Draw divider line
        this.ctx.strokeStyle = '#c9a961';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(modalX + padding, modalY + padding + 36);
        this.ctx.lineTo(modalX + modalWidth - padding, modalY + padding + 36);
        this.ctx.stroke();
        
        // Buff cards setup
        const cardStartY = modalY + padding + 48;
        const cardsStartX = modalX + (modalWidth - totalCardWidth) / 2;
        
        const buffs = [
            { type: '2x_damage', icon: '⚔️', title: '2x DAMAGE', desc: 'Double tower damage' },
            { type: '2x_attack_speed', icon: '⚡', title: '2x ATTACK SPEED', desc: 'Double attack speed' },
            { type: '2x_gameplay', icon: '⏱️', title: '2x GAMEPLAY', desc: 'Double game speed' }
        ];
        
        this.buffCardPositions = [];
        
        buffs.forEach((buff, index) => {
            const cardX = cardsStartX + (index * (cardWidth + cardSpacing));
            const cardY = cardStartY;
            
            // Draw card border (light wood)
            const cardBorderGradient = this.ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardHeight);
            cardBorderGradient.addColorStop(0, '#9a7d5f');
            cardBorderGradient.addColorStop(1, '#7a5d3f');
            this.ctx.fillStyle = cardBorderGradient;
            this.ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
            
            // Draw card inside (darker)
            const cardInnerGradient = this.ctx.createLinearGradient(cardX + 2, cardY + 2, cardX + 2, cardY + cardHeight - 2);
            cardInnerGradient.addColorStop(0, '#3d2f23');
            cardInnerGradient.addColorStop(1, '#2d1f18');
            this.ctx.fillStyle = cardInnerGradient;
            this.ctx.fillRect(cardX + 2, cardY + 2, cardWidth - 4, cardHeight - 4);
            
            // Draw icon
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#ffc107';
            this.ctx.fillText(buff.icon, cardX + cardWidth / 2, cardY + 8);
            
            // Draw title
            this.ctx.font = 'bold 11px Arial';
            this.ctx.fillStyle = '#ffc107';
            this.ctx.fillText(buff.title, cardX + cardWidth / 2, cardY + 40);
            
            // Draw description
            this.ctx.font = '9px Arial';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(buff.desc, cardX + cardWidth / 2, cardY + 62);
            
            // Draw duration
            this.ctx.font = '8px Arial';
            this.ctx.fillStyle = '#ff69b4';
            this.ctx.fillText('60s', cardX + cardWidth / 2, cardY + 78);
            
            // Draw button
            const buttonY = cardY + 92;
            const buttonWidth = 100;
            const buttonHeight = 22;
            const buttonX = cardX + (cardWidth - buttonWidth) / 2;
            
            // Button background (light wood)
            const buttonGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
            buttonGradient.addColorStop(0, '#c9a961');
            buttonGradient.addColorStop(1, '#9a7d5f');
            this.ctx.fillStyle = buttonGradient;
            this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            // Button text
            this.ctx.font = 'bold 10px Arial';
            this.ctx.fillStyle = '#000000';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('SELECT', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
            
            // Store button position
            this.buffCardPositions.push({
                buffType: buff.type,
                left: buttonX,
                top: buttonY,
                right: buttonX + buttonWidth,
                bottom: buttonY + buttonHeight
            });
        });
        
      
    }

    /**
     * Open the ad modal canvas
     */
    openAdModalCanvas() {
        this.showAdModalState = true;
        this.adModalStartTime = Date.now();
    }

    /**
     * Show confirmation dialog before watching ad
     */
    showAdConfirmModalCanvas() {
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Modal dimensions
        const modalWidth = 320;
        const modalHeight = 180;
        const modalX = (this.canvas.width - modalWidth) / 2;
        const modalY = (this.canvas.height - modalHeight) / 2;
        const padding = 15;
        const borderWidth = 3;
        
        // Draw wood-style border (light)
        const borderGradient = this.ctx.createLinearGradient(modalX, modalY, modalX, modalY + modalHeight);
        borderGradient.addColorStop(0, '#c9a961');
        borderGradient.addColorStop(0.5, '#b8956f');
        borderGradient.addColorStop(1, '#a0754d');
        this.ctx.fillStyle = borderGradient;
        this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
        
        // Draw darker wood inside
        const innerGradient = this.ctx.createLinearGradient(modalX + borderWidth, modalY + borderWidth, modalX + borderWidth, modalY + modalHeight - borderWidth);
        innerGradient.addColorStop(0, '#4a3728');
        innerGradient.addColorStop(0.5, '#3d2f23');
        innerGradient.addColorStop(1, '#2d1f18');
        this.ctx.fillStyle = innerGradient;
        this.ctx.fillRect(modalX + borderWidth, modalY + borderWidth, modalWidth - borderWidth * 2, modalHeight - borderWidth * 2);
        
        // Draw title
        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('WATCH AD FOR BUFF?', this.canvas.width / 2, modalY + padding + 5);
        
        // Draw divider line
        this.ctx.strokeStyle = '#c9a961';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(modalX + padding, modalY + padding + 35);
        this.ctx.lineTo(modalX + modalWidth - padding, modalY + padding + 35);
        this.ctx.stroke();
        
        // Draw message
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Watch an advertisement', this.canvas.width / 2, modalY + 65);
        this.ctx.fillText('to get a buff reward', this.canvas.width / 2, modalY + 82);
        
        // Button dimensions
        const buttonWidth = 100;
        const buttonHeight = 30;
        const buttonSpacing = 20;
        const yesButtonX = modalX + (modalWidth / 2) - buttonWidth - (buttonSpacing / 2);
        const noButtonX = modalX + (modalWidth / 2) + (buttonSpacing / 2);
        const buttonY = modalY + modalHeight - 55;
        
        // Draw YES button
        const yesGradient = this.ctx.createLinearGradient(yesButtonX, buttonY, yesButtonX, buttonY + buttonHeight);
        yesGradient.addColorStop(0, '#4CAF50');
        yesGradient.addColorStop(1, '#388E3C');
        this.ctx.fillStyle = yesGradient;
        this.ctx.fillRect(yesButtonX, buttonY, buttonWidth, buttonHeight);
        this.ctx.strokeStyle = '#2E7D32';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(yesButtonX, buttonY, buttonWidth, buttonHeight);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('YES', yesButtonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // Draw NO button
        const noGradient = this.ctx.createLinearGradient(noButtonX, buttonY, noButtonX, noButtonX + buttonHeight);
        noGradient.addColorStop(0, '#f44336');
        noGradient.addColorStop(1, '#d32f2f');
        this.ctx.fillStyle = noGradient;
        this.ctx.fillRect(noButtonX, buttonY, buttonWidth, buttonHeight);
        this.ctx.strokeStyle = '#c62828';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(noButtonX, buttonY, buttonWidth, buttonHeight);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('NO', noButtonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // Store button positions
        this.adConfirmYesPos = {
            left: yesButtonX,
            top: buttonY,
            right: yesButtonX + buttonWidth,
            bottom: buttonY + buttonHeight
        };
        
        this.adConfirmNoPos = {
            left: noButtonX,
            top: buttonY,
            right: noButtonX + buttonWidth,
            bottom: buttonY + buttonHeight
        };
    }

    /**
     * Show video ad modal with countdown (20 seconds)
     */
    showAdVideoModalCanvas() {
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Modal dimensions
        const modalWidth = 500;
        const modalHeight = 350;
        const modalX = (this.canvas.width - modalWidth) / 2;
        const modalY = (this.canvas.height - modalHeight) / 2;
        const padding = 15;
        const borderWidth = 3;
        
        // Draw wood-style border (light)
        const borderGradient = this.ctx.createLinearGradient(modalX, modalY, modalX, modalY + modalHeight);
        borderGradient.addColorStop(0, '#c9a961');
        borderGradient.addColorStop(0.5, '#b8956f');
        borderGradient.addColorStop(1, '#a0754d');
        this.ctx.fillStyle = borderGradient;
        this.ctx.fillRect(modalX, modalY, modalWidth, modalHeight);
        
        // Draw darker wood inside
        const innerGradient = this.ctx.createLinearGradient(modalX + borderWidth, modalY + borderWidth, modalX + borderWidth, modalY + modalHeight - borderWidth);
        innerGradient.addColorStop(0, '#4a3728');
        innerGradient.addColorStop(0.5, '#3d2f23');
        innerGradient.addColorStop(1, '#2d1f18');
        this.ctx.fillStyle = innerGradient;
        this.ctx.fillRect(modalX + borderWidth, modalY + borderWidth, modalWidth - borderWidth * 2, modalHeight - borderWidth * 2);
        
        // Calculate remaining time
        const elapsedTime = Date.now() - this.adModalStartTime;
        const remainingTime = Math.max(0, Math.ceil((this.adVideoDuration - elapsedTime) / 1000));
        const canSkip = elapsedTime >= 10000; // Can skip after 10 seconds
        
        // Draw title
        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('ADVERTISEMENT', this.canvas.width / 2, modalY + padding + 5);
        
        // Draw divider line
        this.ctx.strokeStyle = '#c9a961';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(modalX + padding, modalY + padding + 30);
        this.ctx.lineTo(modalX + modalWidth - padding, modalY + padding + 30);
        this.ctx.stroke();
        
        // Draw video placeholder (since we can't embed actual video in canvas)
        const videoX = modalX + padding + 10;
        const videoY = modalY + padding + 45;
        const videoWidth = modalWidth - (padding + 10) * 2;
        const videoHeight = 150;
        
        // Video background
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(videoX, videoY, videoWidth, videoHeight);
        this.ctx.strokeStyle = '#8b7355';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(videoX, videoY, videoWidth, videoHeight);
        
        // Play icon in center
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.moveTo(videoX + videoWidth / 2 - 15, videoY + videoHeight / 2 - 20);
        this.ctx.lineTo(videoX + videoWidth / 2 - 15, videoY + videoHeight / 2 + 20);
        this.ctx.lineTo(videoX + videoWidth / 2 + 15, videoY + videoHeight / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw countdown timer
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(remainingTime + 's', modalX + modalWidth - 40, modalY + 25);
        
        // Draw skip button area and message
        const buttonY = modalY + modalHeight - 50;
        
        if (canSkip) {
            // Draw SKIP button
            const buttonWidth = 100;
            const buttonHeight = 30;
            const buttonX = modalX + (modalWidth - buttonWidth) / 2;
            
            const skipGradient = this.ctx.createLinearGradient(buttonX, buttonY, buttonX, buttonY + buttonHeight);
            skipGradient.addColorStop(0, '#4CAF50');
            skipGradient.addColorStop(1, '#388E3C');
            this.ctx.fillStyle = skipGradient;
            this.ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            this.ctx.strokeStyle = '#2E7D32';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('SKIP', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
            
            // Store skip button position
            this.adVideoSkipPos = {
                left: buttonX,
                top: buttonY,
                right: buttonX + buttonWidth,
                bottom: buttonY + buttonHeight
            };
        } else {
            // Show wait message
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Please wait... Skip button appears soon', modalX + modalWidth / 2, buttonY + 15);
        }
        
        // Auto-close when timer reaches 0
        if (remainingTime <= 0) {
            this.closeAdVideoModal();
        }
    }

    /**
     * Close the ad video modal and proceed to buff selection
     */
    closeAdVideoModal() {
        this.showAdVideoModalState = false;
        this.showBuffModalState = true;
        // Start cooldown timer (5 minutes)
        this.adCooldownTime = Date.now();
        // Record ad watch via AdBuffManager
        if (window.adBuffManager) {
            window.adBuffManager.completeAdWatch();
        }
    }

    /**
     * Close the ad modal canvas and show buff selection
     */
    closeAdModalCanvas() {
        this.showAdModalState = false;
        this.showBuffModalState = true;
    }

    /**
     * Close the buff modal canvas
     */
    closeBuffModalCanvas() {
        this.showBuffModalState = false;
    }

    drawHUD() {
        const padding = 5;
        const iconSize = 20;
        const spacing = 26;
        const panelPadding = 6;
        const panelWidth = 80;
        const panelHeight = 56;
        
        const panelX = padding;
        const panelY = padding; // Top left position
        
        // Draw dark interior background
        this.ctx.fillStyle = 'rgba(30, 25, 20, 0.85)';
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Draw light wooden border (outer)
        this.ctx.strokeStyle = '#D4A574';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Draw inner border highlight
        this.ctx.strokeStyle = '#E8C89E';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(panelX + 1, panelY + 1, panelWidth - 2, panelHeight - 2);
        
        // Draw gold display (top)
        const goldX = panelX + panelPadding;
        const goldY = panelY + panelPadding;
        
        // Draw gold icon
        if (this.goldIconImage.complete && this.goldIconImage.naturalWidth > 0) {
            this.ctx.drawImage(this.goldIconImage, goldX, goldY, iconSize, iconSize);
        } else {
            // Fallback - draw gold symbol
            this.ctx.fillStyle = '#ffc107';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('$', goldX + 2, goldY + iconSize / 2);
        }
        
        // Draw gold value
        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${this.playerGold}`, goldX + iconSize + 3, goldY + iconSize / 2);
        
        // Draw separator line
        const separatorY = panelY + panelHeight / 2;
        this.ctx.strokeStyle = '#D4A574';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(panelX + 4, separatorY);
        this.ctx.lineTo(panelX + panelWidth - 4, separatorY);
        this.ctx.stroke();
        
        // Draw lives display (bottom)
        const livesX = panelX + panelPadding;
        const livesY = panelY + panelHeight / 2 + panelPadding;
        
        // Draw HP icon
        if (this.hpIconImage.complete && this.hpIconImage.naturalWidth > 0) {
            this.ctx.drawImage(this.hpIconImage, livesX, livesY, iconSize, iconSize);
        } else {
            // Fallback - draw heart symbol
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('❤', livesX + 1, livesY + iconSize / 2);
        }
        
        // Draw lives value
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${this.playerLives}`, livesX + iconSize + 3, livesY + iconSize / 2);
    }

    drawBuildingButton() {
        const buttonSize = 50;
        const padding = 10;
        const buttonX = this.canvas.width - buttonSize - padding;
        const buttonY = this.canvas.height - buttonSize - padding;
        
        // Calculate animation offset
        let offsetX = buttonX;
        let offsetY = buttonY;
        let scale = 1;
        
        // Draw button background
        this.ctx.fillStyle = 'rgba(210, 180, 140, 0.8)';
        this.ctx.fillRect(offsetX, offsetY, buttonSize, buttonSize);
        this.ctx.strokeStyle = '#8b7355';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(offsetX, offsetY, buttonSize, buttonSize);
        
        // Draw hammer image if loaded
        if (this.hammerButtonImage.complete && this.hammerButtonImage.naturalWidth > 0) {
            this.ctx.drawImage(this.hammerButtonImage, offsetX, offsetY, buttonSize, buttonSize);
        } else {
            // Fallback - draw hammer symbol
            this.ctx.fillStyle = '#8b4513';
            this.ctx.font = 'bold 28px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('🔨', offsetX + buttonSize / 2, offsetY + buttonSize / 2);
        }
        
        // Store button position
        this.buildingButtonPos = {
            left: buttonX,
            top: buttonY,
            right: buttonX + buttonSize,
            bottom: buttonY + buttonSize
        };
    }

    drawWatchAdButton() {
        const buttonSize = 50;
        const padding = 10;
        // Position to the left of the building button
        const buildingButtonX = this.canvas.width - 50 - padding;
        const buttonX = buildingButtonX - buttonSize - padding; // Left of building button
        const buttonY = this.canvas.height - buttonSize - padding;
        
        // Check if button is on cooldown
        const isOnCooldown = this.adCooldownTime > 0 && (Date.now() - this.adCooldownTime) < this.adCooldownDuration;
        const remainingCooldown = isOnCooldown ? Math.ceil((this.adCooldownDuration - (Date.now() - this.adCooldownTime)) / 1000) : 0;
        
        // Calculate pulsing effect (dimming in and out) - only when not on cooldown
        const pulseOpacity = !isOnCooldown ? (Math.sin(Date.now() * 0.003) + 1) / 2 : 0; // 0 to 1
        
        // Calculate animation offset
        let offsetX = buttonX;
        let offsetY = buttonY;
        let scale = 1;
        
        if (this.watchAdButtonPressed && !isOnCooldown) {
            const pressElapsed = Date.now() - this.watchAdButtonPressTime;
            if (pressElapsed < 150) {
                scale = 0.85;
                offsetX = buttonX + (buttonSize * 0.075);
                offsetY = buttonY + (buttonSize * 0.075);
            }
        }
        
        // Apply opacity based on cooldown state
        if (isOnCooldown) {
            this.ctx.globalAlpha = 0.4; // Disabled state
        } else {
            this.ctx.globalAlpha = 0.7 + (pulseOpacity * 0.3); // Oscillates between 0.7 and 1.0
        }
        
        // Draw watch ad image if loaded
        if (this.watchAdButtonImage.complete && this.watchAdButtonImage.naturalWidth > 0) {
            this.ctx.drawImage(this.watchAdButtonImage, offsetX, offsetY, buttonSize * scale, buttonSize * scale);
        } else {
            // Fallback - draw text
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('WATCH', offsetX + buttonSize / 2, offsetY + buttonSize / 2 - 6);
            this.ctx.fillText('AD', offsetX + buttonSize / 2, offsetY + buttonSize / 2 + 6);
        }
        
        // Reset alpha
        this.ctx.globalAlpha = 1;
        
        // Draw cooldown timer if on cooldown
        if (isOnCooldown) {
            // Display remaining cooldown time
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Format time display (mm:ss)
            const minutes = Math.floor(remainingCooldown / 60);
            const seconds = remainingCooldown % 60;
            const timeStr = minutes > 0 ? `${minutes}:${String(seconds).padStart(2, '0')}` : `${seconds}s`;
            this.ctx.fillText(timeStr, buttonX + buttonSize / 2, buttonY + buttonSize / 2);
        }
        
        // Store button position for click detection
        this.watchAdButtonPos = {
            left: buttonX,
            top: buttonY,
            right: buttonX + buttonSize,
            bottom: buttonY + buttonSize,
            isOnCooldown: isOnCooldown
        };
    }

    showBuildingMenu() {
        // Draw semi-transparent overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Menu dimensions - smaller
        const menuWidth = 280;
        const menuHeight = 320;
        const menuX = (this.canvas.width - menuWidth) / 2;
        const menuY = (this.canvas.height - menuHeight) / 2;
        const padding = 10;
        const buttonSize = 30;
        const closeButtonPadding = 6;
        
        // Draw dark interior background
        this.ctx.fillStyle = 'rgba(35, 30, 25, 0.95)';
        this.ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
        
        // Draw light wooden border (outer)
        this.ctx.strokeStyle = '#D4A574';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
        
        // Draw inner border highlight
        this.ctx.strokeStyle = '#E8C89E';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(menuX + 3, menuY + 3, menuWidth - 6, menuHeight - 6);
        
        // Draw title
        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('BUILD TOWER', this.canvas.width / 2, menuY + padding);
        
        // Draw divider line
        this.ctx.strokeStyle = '#D4A574';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(menuX + padding, menuY + 45);
        this.ctx.lineTo(menuX + menuWidth - padding, menuY + 45);
        this.ctx.stroke();
        
        // Draw close button (top right of menu)
        const closeButtonX = menuX + menuWidth - buttonSize - closeButtonPadding;
        const closeButtonY = menuY + closeButtonPadding;
        this.drawBuildingMenuCloseButton(closeButtonX, closeButtonY, buttonSize);
        
        this.buildingMenuClosePos = {
            left: closeButtonX,
            top: closeButtonY,
            right: closeButtonX + buttonSize,
            bottom: closeButtonY + buttonSize
        };
        
        // Draw tower list
        const contentStartY = menuY + 55;
        const contentHeight = menuHeight - 80;
        const towerListStartY = contentStartY + 8;
        
        let yOffset = towerListStartY;
        const towerItemHeight = 45;
        
        // Get available towers from allTowersData
        if (this.allTowersData && this.allTowersData.length > 0) {
            // Log tower data to see available fields
            if (this.allTowersData.length > 0) {
                console.log('Tower data sample:', this.allTowersData[0]);
            }
            
            this.allTowersData.forEach((tower, index) => {
                const towerItemX = menuX + padding;
                const towerItemWidth = menuWidth - (padding * 2);
                
                // Draw tower item background
                this.ctx.fillStyle = 'rgba(100, 80, 60, 0.6)';
                this.ctx.fillRect(towerItemX, yOffset, towerItemWidth, towerItemHeight);
                
                // Draw border
                this.ctx.strokeStyle = '#8b7355';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(towerItemX, yOffset, towerItemWidth, towerItemHeight);
                
                // Draw tower image if available
                const towerImg = this.towerImages[tower.tower_id];
                if (towerImg && towerImg.complete && towerImg.naturalWidth > 0) {
                    this.ctx.drawImage(towerImg, towerItemX + 6, yOffset + 6, 30, 30);
                } else {
                    // Fallback - colored square
                    this.ctx.fillStyle = '#8b7355';
                    this.ctx.fillRect(towerItemX + 6, yOffset + 6, 30, 30);
                }
                
                // Draw tower name
                this.ctx.fillStyle = '#ffc107';
                this.ctx.font = 'bold 11px Arial';
                this.ctx.textAlign = 'left';
                this.ctx.textBaseline = 'top';
                this.ctx.fillText(tower.tower_name, towerItemX + 42, yOffset + 4);
                
                // Draw tower stats - use base_damage from API
                const damageValue = tower.base_damage || tower.damage || 'N/A';
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '9px Arial';
                this.ctx.fillText(`DMG: ${damageValue} | RNG: ${tower.range} | SPD: ${tower.attack_speed}`, towerItemX + 42, yOffset + 17);
                this.ctx.fillText(`Cost: ${tower.cost} Gold`, towerItemX + 42, yOffset + 28);
                
                // Store tower position for clicking
                if (!this.towerMenuPositions) this.towerMenuPositions = [];
                this.towerMenuPositions[index] = {
                    left: towerItemX,
                    top: yOffset,
                    right: towerItemX + towerItemWidth,
                    bottom: yOffset + towerItemHeight,
                    towerId: tower.tower_id
                };
                
                yOffset += towerItemHeight + 6;
            });
        }
    }

    drawBuildingMenuCloseButton(x, y, size) {
        // Button background
        this.ctx.fillStyle = 'rgba(200, 80, 80, 0.8)';
        this.ctx.fillRect(x, y, size, size);
        this.ctx.strokeStyle = '#8b4513';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, size, size);
        
        // Draw close image if loaded
        if (this.closeButtonImage.complete && this.closeButtonImage.naturalWidth > 0) {
            this.ctx.drawImage(this.closeButtonImage, x, y, size, size);
        } else {
            // Fallback - draw X symbol
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(x + 8, y + 8);
            this.ctx.lineTo(x + size - 8, y + size - 8);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(x + size - 8, y + 8);
            this.ctx.lineTo(x + 8, y + size - 8);
            this.ctx.stroke();
        }
    }

    drawGrassBackground() {
        // Draw grass background using the grass tile image
        const tileSize = 32;
        
        if (this.grassTile.complete && this.grassTile.naturalWidth > 0) {
            // Tile the grass image across the entire canvas
            for (let x = 0; x < this.canvas.width; x += tileSize) {
                for (let y = 0; y < this.canvas.height; y += tileSize) {
                    this.ctx.drawImage(this.grassTile, x, y, tileSize, tileSize);
                }
            }
        } else {
            // Fallback to gradient if image not loaded
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#3d6b2a');
            gradient.addColorStop(1, '#4d8b2f');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        //     // Draw grid overlay to help visualize tile placement (debug)
        //     this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        //     this.ctx.lineWidth = 1;
        //     for (let x = 0; x <= this.canvas.width; x += tileSize) {
        //         this.ctx.beginPath();
        //         this.ctx.moveTo(x, 0);
        //         this.ctx.lineTo(x, this.canvas.height);
        //         this.ctx.stroke();
        //     }
        //     for (let y = 0; y <= this.canvas.height; y += tileSize) {
        //         this.ctx.beginPath();
        //         this.ctx.moveTo(0, y);
        //         this.ctx.lineTo(this.canvas.width, y);
        //         this.ctx.stroke();
        //     }
        // }
    }
    // Placeholder for future tilemap/decoration functions
    // These will be implemented when map images are imported

    drawPath() {
        // Draw all 3 enemy paths (roads) using dirt tile
        const pathWidth = 32;
        const tileSize = 32;
        
        // Draw each path using dirt tiles
        this.paths.forEach((path, pathIndex) => {
            // For each segment of the path, draw dirt tiles along it
            for (let i = 0; i < path.length - 1; i++) {
                const start = path[i];
                const end = path[i + 1];
                
                // Calculate direction
                const dx = end.x - start.x;
                const dy = end.y - start.y;
                const length = Math.sqrt(dx * dx + dy * dy);
                const steps = Math.ceil(length / tileSize);
                
                // Draw tiles along the path segment
                for (let step = 0; step <= steps; step++) {
                    const t = step / steps;
                    const x = start.x + dx * t;
                    const y = start.y + dy * t;
                    
                    // Draw dirt tile centered on path
                    if (this.dirtPath.complete && this.dirtPath.naturalWidth > 0) {
                        this.ctx.drawImage(
                            this.dirtPath, 
                            x - tileSize / 2, 
                            y - tileSize / 2, 
                            tileSize, 
                            tileSize
                        );
                    } else {
                        // Fallback to colored rectangle
                        this.ctx.fillStyle = '#C4A574';
                        this.ctx.fillRect(x - tileSize / 2, y - tileSize / 2, tileSize, tileSize);
                    }
                }
            }
        });
        
        // Spawn point indicators are now hidden (removed)
    }

    drawSpawnPoint() {
        // Spawn points are now drawn in drawPath()
        // This function is kept for compatibility but does nothing extra
        // The 3 spawn points are at the start of each path in this.paths
    }

    drawCastle() {
        // Draw player's castle at top center (end point of all paths)
        const castleX = 320;  // Center of canvas
        const castleY = 80;   // Near top
        const width = 64;
        const height = 64;
        
        // Draw castle image if loaded
        if (this.castle.complete && this.castle.naturalWidth > 0) {
            this.ctx.drawImage(
                this.castle,
                castleX - width / 2,
                castleY - height / 2,
                width,
                height
            );
        } else {
            // Fallback: Draw castle shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(castleX - width/2 + 5, castleY - height/2 + 5, width, height);
            
            // Main castle body (stone gray)
            this.ctx.fillStyle = '#6D6D6D';
            this.ctx.strokeStyle = '#4A4A4A';
            this.ctx.lineWidth = 3;
            this.ctx.fillRect(castleX - width/2, castleY - height/2, width, height);
            this.ctx.strokeRect(castleX - width/2, castleY - height/2, width, height);
            
            // Castle roof (triangle)
            this.ctx.fillStyle = '#8B4513';
            this.ctx.beginPath();
            this.ctx.moveTo(castleX - width/2 - 10, castleY - height/2);
            this.ctx.lineTo(castleX, castleY - height/2 - 20);
            this.ctx.lineTo(castleX + width/2 + 10, castleY - height/2);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.strokeStyle = '#5D3A1A';
            this.ctx.stroke();
            
            // Castle door
            this.ctx.fillStyle = '#4A3728';
            this.ctx.fillRect(castleX - 10, castleY, 20, 32);
            
            // Castle windows
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(castleX - 25, castleY - 10, 12, 15);
            this.ctx.fillRect(castleX + 13, castleY - 10, 12, 15);
        }
        
        // Draw castle label - white bold pixelated style
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 14px "Press Start 2P", "Courier New", monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Add text shadow for better visibility
        this.ctx.shadowColor = '#000000';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        this.ctx.fillText('DEFEND', castleX, castleY + height/2 + 15);
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
    }

    drawInitialMap() {
        // Draw the game map (backbone structure)
        // 1. Background layer
        this.drawGrassBackground();
        
        // 2. Apply zoom transformation for game elements
        this.ctx.save();
        this.ctx.scale(this.zoomLevel, this.zoomLevel);
        
        // 3. Path layer (where enemies walk)
        this.drawPath();
        
        // 4. Key landmarks
        this.drawSpawnPoint();  // Enemy spawn location
        this.drawCastle();      // Player base to defend
        
        // 5. Restore context
        this.ctx.restore();
    }

    drawDecorations() {
        // Draw tree trunk decorations
        if (this.treeTrunkDecorations && this.treeTrunkTile.complete && this.treeTrunkTile.naturalWidth > 0) {
            for (const trunk of this.treeTrunkDecorations) {
                this.ctx.save();
                this.ctx.globalAlpha = trunk.alpha || 0.9;
                this.ctx.drawImage(this.treeTrunkTile, trunk.x, trunk.y, trunk.size, trunk.size);
                this.ctx.restore();
            }
        }
           
        // Draw grass decorations
        if (this.grassDecorations && this.grass1Tile.complete && this.grass1Tile.naturalWidth > 0) {
            for (const grass of this.grassDecorations) {
                this.ctx.save();
                this.ctx.globalAlpha = grass.alpha || 0.8;
                this.ctx.drawImage(this.grass1Tile, grass.x, grass.y, grass.size, grass.size);
                this.ctx.restore();
            }
        }
        // Draw stone1.png and stone2.png decorations
        for (const deco of this.decorations) {
            let img = null;
            if (deco.type === 'stone1' && this.stone1Tile.complete && this.stone1Tile.naturalWidth > 0) {
                img = this.stone1Tile;
            } else if (deco.type === 'stone2' && this.stone2Tile.complete && this.stone2Tile.naturalWidth > 0) {
                img = this.stone2Tile;
            }
            if (img) {
                this.ctx.save();
                this.ctx.globalAlpha = deco.alpha;
                this.ctx.drawImage(img, deco.x, deco.y, deco.size, deco.size);
                this.ctx.restore();
            }
        }
        // Draw trees
        if (this.treeDecorations) {
            for (const tree of this.treeDecorations) {
                if (this.tree1Tile.complete && this.tree1Tile.naturalWidth > 0) {
                    this.ctx.drawImage(this.tree1Tile, tree.x - 16, tree.y - 16, 32, 32);
                }
            }
        }

        // Draw flowers
        if (this.flowerDecorations && this.flower1Tile.complete && this.flower1Tile.naturalWidth > 0) {
            for (const flower of this.flowerDecorations) {
                this.ctx.save();
                this.ctx.globalAlpha = flower.alpha || 1.0;
                this.ctx.drawImage(this.flower1Tile, flower.x, flower.y, flower.size, flower.size);
                this.ctx.restore();
            }
        }

        
    }

     /**
             * Generate random tree trunk decorations for the map
             */
            generateTreeTrunkDecorations() {
                const trunkCount = 5; // Number of trunks to scatter
                const trunkPositions = [];
                const mapWidth = 640;
                const mapHeight = 480;
                const tileSize = 32;
                const buffer = 22; // Minimum distance from roads, slots, castle, stones, trees, flowers, grass
                let placed = 0;
                let attempts = 0;
                const maxAttempts = 400;

                // Helper: check if position is valid
                const isValid = (x, y) => {
                    // Avoid tower slots
                    for (const slot of this.towerSlots) {
                        if (Math.abs(x - slot.x) < buffer && Math.abs(y - slot.y) < buffer) return false;
                    }
                    // Avoid castle (center top)
                    if (Math.abs(x - 320) < 60 && y < 120) return false;
                    // Avoid roads (check all paths)
                    for (const path of this.paths) {
                        for (const pt of path) {
                            if (Math.abs(x - pt.x) < buffer && Math.abs(y - pt.y) < buffer) return false;
                        }
                    }
                    // Avoid stones
                    if (this.decorations) {
                        for (const deco of this.decorations) {
                            if (Math.abs(x - deco.x) < buffer && Math.abs(y - deco.y) < buffer) return false;
                        }
                    }
                    // Avoid trees
                    if (this.treeDecorations) {
                        for (const tree of this.treeDecorations) {
                            if (Math.abs(x - tree.x) < buffer && Math.abs(y - tree.y) < buffer) return false;
                        }
                    }
                    // Avoid flowers
                    if (this.flowerDecorations) {
                        for (const flower of this.flowerDecorations) {
                            if (Math.abs(x - flower.x) < buffer && Math.abs(y - flower.y) < buffer) return false;
                        }
                    }
                    // Avoid grass
                    if (this.grassDecorations) {
                        for (const grass of this.grassDecorations) {
                            if (Math.abs(x - grass.x) < buffer && Math.abs(y - grass.y) < buffer) return false;
                        }
                    }
                    return true;
                };

                // Deterministic scatter using seeded PRNG
                function mulberry32(a) {
                    return function() {
                        var t = a += 0x6D2B79F5;
                        t = Math.imul(t ^ t >>> 15, t | 1);
                        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                        return ((t ^ t >>> 14) >>> 0) / 4294967296;
                    }
                }
                const rand = mulberry32(135791113); // Unique seed for trunks

                while (placed < trunkCount && attempts < maxAttempts) {
                    attempts++;
                    const x = Math.floor(rand() * (mapWidth - tileSize - 12)) + tileSize / 2 + 6;
                    const y = Math.floor(rand() * (mapHeight - tileSize - 12)) + tileSize / 2 + 6;
                    if (isValid(x, y)) {
                        trunkPositions.push({ x, y, size: 20, alpha: 0.9 });
                        placed++;
                    }
                }
                this.treeTrunkDecorations = trunkPositions;
            }
    
    /**
         * Generate random flower decorations for the map
         */
        generateFlowerDecorations() {
            const flowerCount = 20; // Number of flowers to scatter
            const flowerPositions = [];
            const mapWidth = 640;
            const mapHeight = 480;
            const tileSize = 32;
            const buffer = 20; // Minimum distance from roads, slots, castle, stones, trees
            let placed = 0;
            let attempts = 0;
            const maxAttempts = 500;

            // Helper: check if position is valid
            const isValid = (x, y) => {
                // Avoid tower slots
                for (const slot of this.towerSlots) {
                    if (Math.abs(x - slot.x) < buffer && Math.abs(y - slot.y) < buffer) return false;
                }
                // Avoid castle (center top)
                if (Math.abs(x - 320) < 60 && y < 120) return false;
                // Avoid roads (check all paths)
                for (const path of this.paths) {
                    for (const pt of path) {
                        if (Math.abs(x - pt.x) < buffer && Math.abs(y - pt.y) < buffer) return false;
                    }
                }
                // Avoid stones
                if (this.decorations) {
                    for (const deco of this.decorations) {
                        if (Math.abs(x - deco.x) < buffer && Math.abs(y - deco.y) < buffer) return false;
                    }
                }
                // Avoid trees
                if (this.treeDecorations) {
                    for (const tree of this.treeDecorations) {
                        if (Math.abs(x - tree.x) < buffer && Math.abs(y - tree.y) < buffer) return false;
                    }
                }
                return true;
            };

            // Deterministic scatter using seeded PRNG
            function mulberry32(a) {
                return function() {
                    var t = a += 0x6D2B79F5;
                    t = Math.imul(t ^ t >>> 15, t | 1);
                    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                    return ((t ^ t >>> 14) >>> 0) / 4294967296;
                }
            }
            const rand = mulberry32(987654321);

            while (placed < flowerCount && attempts < maxAttempts) {
                attempts++;
                const x = Math.floor(rand() * (mapWidth - tileSize - 16)) + tileSize / 2 + 8;
                const y = Math.floor(rand() * (mapHeight - tileSize - 16)) + tileSize / 2 + 8;
                if (isValid(x, y)) {
                    // Avoid placing flowers too close to the castle (center top)
                    if (Math.abs(x - 320) < 60 && y < 120) continue;
                    // Avoid trees
                    let nearTree = false;
                    if (this.treeDecorations) {
                        for (const tree of this.treeDecorations) {
                            if (Math.abs(x - tree.x) < 28 && Math.abs(y - tree.y) < 28) {
                                nearTree = true;
                                break;
                            }
                        }
                    }
                    if (nearTree) continue;
                    // Avoid stones
                    let nearStone = false;
                    if (this.decorations) {
                        for (const deco of this.decorations) {
                            if (Math.abs(x - deco.x) < 28 && Math.abs(y - deco.y) < 28) {
                                nearStone = true;
                                break;
                            }
                        }
                    }
                    if (nearStone) continue;
                    // Avoid tower slots
                    let nearSlot = false;
                    for (const slot of this.towerSlots) {
                        if (Math.abs(x - slot.x) < 28 && Math.abs(y - slot.y) < 28) {
                            nearSlot = true;
                            break;
                        }
                    }
                    if (nearSlot) continue;
                    // If all checks pass, place the flower
                    flowerPositions.push({ x, y, size: 5, alpha: 0.95 });
                    placed++;
                }
            }
            this.flowerDecorations = flowerPositions;
        }

    /**
     * Generate random stone1 and stone2 decorations for the map
     */
    generateStoneDecorations() {
        // Deterministic, fixed stone decorations, scattered only in empty spaces
        // Use a seeded PRNG for repeatability
        function mulberry32(a) {
            return function() {
                var t = a += 0x6D2B79F5;
                t = Math.imul(t ^ t >>> 15, t | 1);
                t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        }
        // Use a fixed seed for the session (could use map size, slot count, etc)
        const seed = 123456;
        const rand = mulberry32(seed);
        const count = 15;
        const minSize = 18, maxSize = 32;
        const margin = 24;
        const slotRadius = 28; // Larger buffer for slots
        const pathWidth = 32;
        const castleBuffer = 60;
        // Precompute all road segments as rectangles for collision
        const roadRects = [];
        this.paths.forEach(path => {
            for (let i = 0; i < path.length - 1; i++) {
                const start = path[i];
                const end = path[i + 1];
                const minX = Math.min(start.x, end.x) - pathWidth / 2 - margin;
                const maxX = Math.max(start.x, end.x) + pathWidth / 2 + margin;
                const minY = Math.min(start.y, end.y) - pathWidth / 2 - margin;
                const maxY = Math.max(start.y, end.y) + pathWidth / 2 + margin;
                roadRects.push({ minX, maxX, minY, maxY });
            }
        });
        // Castle position (center top)
        const castle = { x: this.canvas.width / 2, y: 80 };
        const castleW = 64, castleH = 48;
        this.decorations = [];
        let placed = 0, attempts = 0, maxAttempts = 400;
        while (placed < count && attempts < maxAttempts) {
            attempts++;
            const size = Math.floor(rand() * (maxSize - minSize + 1)) + minSize;
            const x = Math.floor(rand() * (this.canvas.width - size - margin * 2) + margin);
            const y = Math.floor(rand() * (this.canvas.height - size - margin * 2) + margin);
            let valid = true;
            // Avoid road
            for (const rect of roadRects) {
                if (x + size > rect.minX && x < rect.maxX && y + size > rect.minY && y < rect.maxY) {
                    valid = false;
                    break;
                }
            }
            // Avoid tower slots
            if (valid && this.towerSlots) {
                for (const slot of this.towerSlots) {
                    const dx = (x + size / 2) - slot.x;
                    const dy = (y + size / 2) - slot.y;
                    if (Math.sqrt(dx * dx + dy * dy) < slotRadius + size / 2) {
                        valid = false;
                        break;
                    }
                }
            }
            // Avoid castle (buffered)
            if (valid) {
                if (x + size > castle.x - castleW / 2 - castleBuffer && x < castle.x + castleW / 2 + castleBuffer &&
                    y + size > castle.y - castleH / 2 - castleBuffer && y < castle.y + castleH / 2 + castleBuffer) {
                    valid = false;
                }
            }
            if (valid) {
                // Randomly choose stone1 or stone2 (deterministic)
                const type = rand() < 0.5 ? 'stone1' : 'stone2';
                this.decorations.push({ x, y, size, alpha: 0.8, type });
                placed++;
            }
        }
    }

    /**
     * Generate random tree decorations for the map
     */
    generateTreeDecorations() {
        // Place trees only on the top, left, and right edges of the map
        const treePositions = [];
        const mapWidth = 640;
        const mapHeight = 480;
        const tileSize = 32;
        const edgeBuffer = 8; // Distance from the edge
        const spacing = 28; // Space between trees

        // Top edge
        for (let x = edgeBuffer; x < mapWidth - edgeBuffer; x += spacing) {
            treePositions.push({ x, y: edgeBuffer });
        }
        // Left edge
        for (let y = edgeBuffer + spacing; y < mapHeight - edgeBuffer - spacing; y += spacing) {
            treePositions.push({ x: edgeBuffer, y });
        }
        // Right edge
        for (let y = edgeBuffer + spacing; y < mapHeight - edgeBuffer - spacing; y += spacing) {
            treePositions.push({ x: mapWidth - edgeBuffer, y });
        }

        // Optionally, add a second row for extra density
        const secondRowOffset = edgeBuffer + tileSize;
        // Top second row
        for (let x = secondRowOffset; x < mapWidth - secondRowOffset; x += spacing) {
            treePositions.push({ x, y: secondRowOffset });
        }
        // Left second row
        for (let y = secondRowOffset + spacing; y < mapHeight - secondRowOffset - spacing; y += spacing) {
            treePositions.push({ x: secondRowOffset, y });
        }
        // Right second row
        for (let y = secondRowOffset + spacing; y < mapHeight - secondRowOffset - spacing; y += spacing) {
            treePositions.push({ x: mapWidth - secondRowOffset, y });
        }

        this.treeDecorations = treePositions;
    }

     /**
     * Generate random grass decorations for the map
     */
    generateGrassDecorations() {
        const grassCount = 1000; // Number of grass tufts to scatter
        const grassPositions = [];
        const mapWidth = 640;
        const mapHeight = 480;
        const tileSize = 32;
        const buffer = 18; // Minimum distance from roads, slots, castle, stones, trees, flowers
        let placed = 0;
        let attempts = 0;
        const maxAttempts = 600;

        // Helper: check if position is valid
        const isValid = (x, y) => {
            // Avoid tower slots
            for (const slot of this.towerSlots) {
                if (Math.abs(x - slot.x) < buffer && Math.abs(y - slot.y) < buffer) return false;
            }
            // Avoid castle (center top)
            if (Math.abs(x - 320) < 60 && y < 120) return false;
            // Avoid roads (check all paths)
            for (const path of this.paths) {
                for (const pt of path) {
                    if (Math.abs(x - pt.x) < buffer && Math.abs(y - pt.y) < buffer) return false;
                }
            }
            // Avoid stones
            if (this.decorations) {
                for (const deco of this.decorations) {
                    if (Math.abs(x - deco.x) < buffer && Math.abs(y - deco.y) < buffer) return false;
                }
            }
            // Avoid trees
            if (this.treeDecorations) {
                for (const tree of this.treeDecorations) {
                    if (Math.abs(x - tree.x) < buffer && Math.abs(y - tree.y) < buffer) return false;
                }
            }
            // Avoid flowers
            if (this.flowerDecorations) {
                for (const flower of this.flowerDecorations) {
                    if (Math.abs(x - flower.x) < buffer && Math.abs(y - flower.y) < buffer) return false;
                }
            }
            return true;
        };

        // Deterministic scatter using seeded PRNG
        function mulberry32(a) {
            return function() {
                var t = a += 0x6D2B79F5;
                t = Math.imul(t ^ t >>> 15, t | 1);
                t ^= t + Math.imul(t ^ t >>> 7, t | 61);
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            }
        }
        const rand = mulberry32(246801357); // Unique seed for grass

        while (placed < grassCount && attempts < maxAttempts) {
            attempts++;
            const x = Math.floor(rand() * (mapWidth - tileSize - 12)) + tileSize / 2 + 6;
            const y = Math.floor(rand() * (mapHeight - tileSize - 12)) + tileSize / 2 + 6;
            if (isValid(x, y)) {
                grassPositions.push({ x, y, size: 5, alpha: 0.8 });
                placed++;
            }
        }
        this.grassDecorations = grassPositions;
    }


    /**
     * Apply damage buff multiplier (called by AdBuffManager)
     */
    applyDamageBuffMultiplier(multiplier) {
        this.damageMultiplier = multiplier;
        const expirationTime = Date.now() + 60000; // 60 seconds
        this.activeBuffs['2x_damage'] = expirationTime;
        console.log('✓ Damage multiplier set to:', multiplier, '- expires in 60 seconds');
    }

    /**
     * Apply attack speed buff multiplier (called by AdBuffManager)
     */
    applyAttackSpeedBuffMultiplier(multiplier) {
        this.attackSpeedMultiplier = multiplier;
        const expirationTime = Date.now() + 60000; // 60 seconds
        this.activeBuffs['2x_attack_speed'] = expirationTime;
        console.log('✓ Attack speed multiplier set to:', multiplier, '- expires in 60 seconds');
    }

    /**
     * Apply gameplay speed buff multiplier (called by AdBuffManager)
     */
    applyGameplaySpeedBuffMultiplier(multiplier) {
        this.gameplaySpeedMultiplier = multiplier;
        const expirationTime = Date.now() + 60000; // 60 seconds
        this.activeBuffs['2x_gameplay'] = expirationTime;
        console.log('✓ Gameplay speed multiplier set to:', multiplier, '- expires in 60 seconds');
    }

    /**
     * Check if buffs have expired and reset them
     */
    checkBuffExpiration() {
        const now = Date.now();
        
        // Check damage buff
        if (this.activeBuffs['2x_damage'] && now >= this.activeBuffs['2x_damage']) {
            console.log('⏰ Damage buff expired - resetting to 1.0');
            this.damageMultiplier = 1.0;
            delete this.activeBuffs['2x_damage'];
        }
        
        // Check attack speed buff
        if (this.activeBuffs['2x_attack_speed'] && now >= this.activeBuffs['2x_attack_speed']) {
            console.log('⏰ Attack speed buff expired - resetting to 1.0');
            this.attackSpeedMultiplier = 1.0;
            delete this.activeBuffs['2x_attack_speed'];
        }
        
        // Check gameplay speed buff
        if (this.activeBuffs['2x_gameplay'] && now >= this.activeBuffs['2x_gameplay']) {
            console.log('⏰ Gameplay speed buff expired - resetting to 1.0');
            this.gameplaySpeedMultiplier = 1.0;
            delete this.activeBuffs['2x_gameplay'];
        }
    }

    /**
     * Get effective tower damage with buff applied
     */
    getEffectiveTowerDamage(baseDamage) {
        return baseDamage * (this.damageMultiplier || 1.0);
    }

    /**
     * Get effective attack speed with buff applied
     */
    getEffectiveTowerAttackSpeed(baseSpeed) {
        return baseSpeed * (this.attackSpeedMultiplier || 1.0);
    }

    draw() {
        // Disable image smoothing for pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
        
        // === MAP RENDERING (Backbone) ===
        // Layer 1: Background
        this.drawGrassBackground();
        // Layer 1.5: Decorative grass1.png
        this.drawDecorations();
        
        // Layer 2: Apply zoom transformation
        this.ctx.save();
        this.ctx.scale(this.zoomLevel, this.zoomLevel);
        
        // Layer 3: Path
        this.drawPath();
        
        // Layer 4: Landmarks
        this.drawSpawnPoint();
        this.drawCastle();
        
        // Layer 5: Interactive elements
        this.drawTowerSlots();

        // Draw towers
        this.towers.forEach(tower => {
            // Try to draw tower image first
            const towerImg = this.towerImages[tower.tower_id];
            const towerSize = 51; // Slightly larger than slot for better visibility
            if (towerImg && towerImg.complete) {
                this.ctx.drawImage(towerImg, tower.x - towerSize / 2, tower.y - towerSize / 2 - 8, towerSize, towerSize);
            } else {
                // Fallback to circle if image not loaded
                this.ctx.fillStyle = '#667eea';
                this.ctx.beginPath();
                this.ctx.arc(tower.x, tower.y, tower.radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw range indicator
            this.ctx.strokeStyle = 'rgba(102, 126, 234, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
            this.ctx.stroke();
        });

        // Draw projectiles (arrow images)
        this.projectiles.forEach(proj => {
            const progress = proj.age / proj.maxAge;
            
            // Get current target position
            const targetX = proj.targetEnemy ? proj.targetEnemy.x : proj.x;
            const targetY = proj.targetEnemy ? proj.targetEnemy.y : proj.y;
            
            // Calculate angle from projectile to target
            const angle = Math.atan2(targetY - proj.y, targetX - proj.x);
            
            // Draw projectile image with rotation
            if (this.projectileImage.complete && this.projectileImage.naturalWidth > 0) {
                this.ctx.save();
                this.ctx.globalAlpha = 1 - progress;
                this.ctx.translate(proj.x, proj.y);
                this.ctx.rotate(angle);
                this.ctx.drawImage(this.projectileImage, -20, -15, 60, 30);
                this.ctx.restore();
            } else {
                // Fallback - draw simple arrow shape
                this.ctx.save();
                this.ctx.globalAlpha = 1 - progress;
                this.ctx.translate(proj.x, proj.y);
                this.ctx.rotate(angle);
                
                // Draw arrow
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.moveTo(20, 0);
                this.ctx.lineTo(-12, -10);
                this.ctx.lineTo(-12, 10);
                this.ctx.closePath();
                this.ctx.fill();
                
                this.ctx.restore();
            }
        });

        // Draw enemies
        this.enemies.forEach(enemy => {
            const enemyImg = this.enemyImages[enemy.enemy_id];
            
            // Try to draw enemy image first
            if (enemyImg && enemyImg.complete && enemyImg.naturalWidth > 0) {
                this.ctx.drawImage(enemyImg, enemy.x - 20, enemy.y - 20, 40, 40);
            } else {
                // Fallback to circle if image not loaded
                this.ctx.fillStyle = '#ff6b6b';
                this.ctx.beginPath();
                this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw health bar
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(enemy.x - 15, enemy.y - 25, 30, 3);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(enemy.x - 15, enemy.y - 25, (enemy.hp / enemy.maxHp) * 30, 3);
        });
        
        // Draw floating damage texts
        this.floatingTexts.forEach(text => {
            const alpha = 1 - (text.age / text.maxAge); // Fade out over time
            this.ctx.globalAlpha = alpha;
            
            this.ctx.fillStyle = '#FFD700'; // Gold color for damage numbers
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Add shadow for better readability
            this.ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            this.ctx.shadowBlur = 3;
            this.ctx.shadowOffsetX = 1;
            this.ctx.shadowOffsetY = 1;
            
            this.ctx.fillText(text.text, text.x, text.y);
            
            // Clear shadow
            this.ctx.shadowColor = 'transparent';
        });
        
        this.ctx.globalAlpha = 1; // Reset alpha
        
        // Control wave countdown overlay visibility
        const countdownOverlay = document.getElementById('waveCountdownOverlay');
        if (countdownOverlay) {
            if (this.countdownActive && !this.isPaused) {
                countdownOverlay.classList.remove('hidden');
            } else {
                countdownOverlay.classList.add('hidden');
            }
        }

        // Restore context state
        this.ctx.restore();
        
        // Draw pause button during gameplay
        if (this.isRunning) {
            this.drawPauseButton();
            this.drawWaveInfoDisplay();
            this.drawBuildingButton();
            this.drawWatchAdButton();
            this.drawHUD();
        }
        
        // Draw building menu if open
        if (this.buildingMenuOpen && this.isRunning) {
            this.showBuildingMenu();
        }
        
        // Draw pause menu if paused
        if (this.isPaused) {
            this.showPauseMenu();
        }
        
        // Draw canvas-based ad confirmation modal if active
        if (this.showAdConfirmModalState) {
            this.showAdConfirmModalCanvas();
        }
        
        // Draw canvas-based video ad modal if active
        if (this.showAdVideoModalState) {
            this.showAdVideoModalCanvas();
        }
        
        // Draw canvas-based ad modal if active
        if (this.showAdModalState) {
            this.showAdModalCanvas();
        }
        
        // Draw canvas-based buff selection modal if active
        if (this.showBuffModalState) {
            this.showBuffSelectionModalCanvas();
        }
        
        // Draw in-game message (always on top)
        this.drawGameMessage();
    }

    updateUI() {
        const goldEl = document.getElementById('playerGold');
        const livesEl = document.getElementById('playerLives');
        const waveEl = document.getElementById('currentWave');
        const scoreEl = document.getElementById('scoreDisplay');
        
        if (goldEl) goldEl.textContent = this.playerGold;
        if (livesEl) livesEl.textContent = this.playerLives;
        if (waveEl) waveEl.textContent = this.currentWave;
        if (scoreEl) scoreEl.textContent = `Score: ${this.score}`;
    }

    endGame() {
        this.isRunning = false;
        this.isPaused = false; // Reset pause state
        
        // Stop battle music
        this.battleMusic.pause();
        this.battleMusic.currentTime = 0;
        
        // Reset pause menu mute state
        this.pauseMenuBattleMusicMuted = false;
        
        // Resume lobby music if it's not muted
        if (!this.musicMuted && this.musicStarted) {
            this.lobbyMusic.currentTime = 0;
            this.lobbyMusic.play().catch(err => {
                console.warn('Could not play lobby music:', err);
            });
        }
        
        const startBtn = document.getElementById('startGameBtn');
        const pauseBtn = document.getElementById('pauseGameBtn');
        const endBtn = document.getElementById('endGameBtn');
        
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
        if (endBtn) endBtn.disabled = true;

        // First, update session stats
        const statsFormData = new FormData();
        statsFormData.append('session_id', this.sessionId);
        statsFormData.append('towers_built', this.towersBuild || 0);
        statsFormData.append('towers_upgraded', this.towersUpgrade || 0);
        statsFormData.append('enemies_killed', this.enemiesKilled || 0);
        statsFormData.append('gold_earned', this.playerGold || 0);

        fetch('/game/api/update-stats/', { method: 'POST', body: statsFormData })
            .then(res => res.json())
            .then(statsData => {
                // Then end the game and update leaderboard
                const formData = new FormData();
                formData.append('session_id', this.sessionId);
                formData.append('final_score', this.score);
                formData.append('level_reached', this.currentWave);

                return fetch('/game/api/end/', { method: 'POST', body: formData });
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Show game end overlay with stats
                    this.showGameEndOverlay();
                } else {
                    alert('Error ending game');
                }
            })
            .catch(err => console.error('Error:', err));
    }

    showGameEndOverlay() {

        const endOverlay = document.getElementById('gameEndOverlay');
        const finalScoreEl = document.getElementById('finalScore');
        const waveReachedEl = document.getElementById('waveReached');
        const goldEarnedEl = document.getElementById('goldEarned');
        const ads5LivesBtn = document.getElementById('ads5LivesBtn');

        if (endOverlay && finalScoreEl && waveReachedEl && goldEarnedEl) {
            finalScoreEl.textContent = this.score;
            waveReachedEl.textContent = this.currentWave;
            goldEarnedEl.textContent = this.playerGold;
            endOverlay.classList.remove('hidden');
        }

        // Show the Click Ads +5 Lives button only if player lost all lives
        if (ads5LivesBtn) {
            if (this.playerLives <= 0) {
                ads5LivesBtn.style.display = '';
            } else {
                ads5LivesBtn.style.display = 'none';
            }
        }
        
        // Set up restart button listener
        const restartBtn = document.getElementById('restartGameBtn');
        if (restartBtn) {
            restartBtn.onclick = () => this.restartGame();
        }
        // Set up replay button listener
        const replayBtn = document.getElementById('replayGameBtn');
        if (replayBtn) {
            replayBtn.onclick = () => {
                // Hide game end overlay
                const endOverlay = document.getElementById('gameEndOverlay');
                if (endOverlay) {
                    endOverlay.classList.add('hidden');
                }
                // Reset game state (like restartGame, but skip lobby)
                this.sessionId = null;
                this.isRunning = false;
                this.isPaused = false;
                this.playerGold = 500;
                this.playerLives = 20;
                this.currentWave = 1;
                this.score = 0;
                this.gameStartTime = null;
                // Only reset towers, enemies, projectiles, selectedTower, cooldowns, wave queue, timers
                this.towers = [];
                this.enemies = [];
                this.projectiles = [];
                this.selectedTower = null;
                this.towerCooldowns = {};
                this.waveEnemySpawnQueue = [];
                this.waveStartTime = null;
                this.countdownActive = false;
                this.countdownStartTime = null;
                this.gameTitleDropTime = null;
                this.pauseMenuBattleMusicMuted = false;
                // DO NOT reset or re-initialize towerSlots array!
                // Reset UI
                this.updateUI();
                this.displayWaveInfo();
                // Start the game directly (like Start Battle)
                this.startGame();
            };
        }

        // Set up Click Ads +5 Lives button listener
        if (ads5LivesBtn) {
            ads5LivesBtn.onclick = () => {
                // Open ad website in a new tab
                window.open('https://www.wikipedia.org/', '_blank');
                // Show countdown on button
                let countdown = 5;
                ads5LivesBtn.disabled = true;
                const originalText = ads5LivesBtn.innerHTML;
                ads5LivesBtn.innerHTML = `<span>Wait ${countdown}s...</span>`;
                const interval = setInterval(() => {
                    countdown--;
                    if (countdown > 0) {
                        ads5LivesBtn.innerHTML = `<span>Wait ${countdown}s...</span>`;
                    } else {
                        clearInterval(interval);
                        ads5LivesBtn.innerHTML = originalText;
                        ads5LivesBtn.disabled = false;
                        // Add 5 lives and resume game
                        this.playerLives += 5;
                        // Hide game end overlay
                        if (endOverlay) {
                            endOverlay.classList.add('hidden');
                        }
                        // Resume game on same wave/scenario
                        this.isRunning = true;
                        this.isPaused = false;
                        this.updateUI();
                        this.displayWaveInfo();
                        // Resume battle music if not muted
                        if (!this.musicMuted && this.musicStarted) {
                            this.battleMusic.currentTime = 0;
                            this.battleMusic.play().catch(() => {});
                        }
                        // Start game loop if not already running
                        if (typeof this.gameLoop === 'function') {
                            requestAnimationFrame(() => this.gameLoop());
                        }
                        // Show message
                        this.showGameMessage('+5 Lives!');
                    }
                }, 1000);
            };
        }

    }

    restartGame() {
        // Hide game end overlay
        const endOverlay = document.getElementById('gameEndOverlay');
        if (endOverlay) {
            endOverlay.classList.add('hidden');
        }

        // Reset game state
        this.sessionId = null;
        this.isRunning = false;
        this.isPaused = false;
        this.playerGold = 500;
        this.playerLives = 20;
        this.currentWave = 1;
        this.score = 0;
        this.gameStartTime = null;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.selectedTower = null;
        this.towerCooldowns = {};
        this.waveEnemySpawnQueue = [];
        this.waveStartTime = null;
        this.countdownActive = false;
        this.countdownStartTime = null;
        this.gameTitleDropTime = null;
        
        // Reset pause menu mute state
        this.pauseMenuBattleMusicMuted = false;

        // Reset UI
        this.updateUI();
        this.displayWaveInfo();
        
        // Draw lobby screen instead of initial map
        this.drawLobbyScreen();
        
        // Show idle overlay
        const overlay = document.getElementById('gameIdleOverlay');
        if (overlay) {
            overlay.classList.remove('hidden');
        }

        // Re-enable start button
        const startBtn = document.getElementById('startGameBtn');
        if (startBtn) {
            startBtn.disabled = false;
        }

        console.log('Game restarted - ready for new session');
        this.lobbyLoop(); // Restart lobby animation and music
    }

    loadWavesAndEnemies() {
        fetch('/game/api/waves/')
            .then(res => res.json())
            .then(data => {
                this.waves = data.waves;
                console.log('Waves loaded:', this.waves);
                
                data.waves.forEach(wave => {
                    wave.enemies.forEach(enemy => {
                        if (enemy.image_path) {
                            const img = new Image();
                            img.src = enemy.image_path.startsWith('/') 
                                ? enemy.image_path 
                                : `/static/${enemy.image_path}`;
                            img.onerror = () => console.warn(`Failed to load enemy image: ${img.src}`);
                            this.enemyImages[enemy.enemy_id] = img;
                            console.log(`Loading enemy image: ${enemy.enemy_name} -> ${img.src}`);
                        }
                    });
                });
                
                this.displayWaveInfo();
            })
            .catch(err => console.error('Error loading waves:', err));
    }

    loadTowerImages() {
        fetch('/game/api/towers/')
            .then(res => res.json())
            .then(data => {
                this.allTowersData = data.towers;
                data.towers.forEach(tower => {
                    if (tower.image_path) {
                        const img = new Image();
                        img.src = tower.image_path.startsWith('/') 
                            ? tower.image_path 
                            : `/static/${tower.image_path}`;
                        this.towerImages[tower.tower_id] = img;
                    }
                });
                console.log('Tower images loaded');
            })
            .catch(err => console.error('Error loading tower images:', err));
    }

    displayWaveInfo() {
        const waveDisplay = document.getElementById('waveDisplay');
        if (!waveDisplay || this.waves.length === 0) return;
        
        const currentWave = this.waves[this.currentWave - 1];
        if (currentWave) {
            let waveHtml = `<h4>Enemies in Wave:</h4>`;
            currentWave.enemies.forEach(we => {
                waveHtml += `<div class="wave-enemy-info">
                    <p>${we.enemy_name} ×${we.enemy_count}</p>
                    <p style="font-size: 9px; color: #aaa;">HP: ${we.base_hp}</p>
                </div>`;
            });
            waveDisplay.innerHTML = waveHtml;
        }
    }

    startGame() {
        if (this.isRunning) return;

        // Stop lobby music and start battle music
        this.lobbyMusic.pause();
        this.lobbyMusic.currentTime = 0;
        this.battleMusic.currentTime = 0;
        this.battleMusic.play().catch(err => {
            console.warn('Could not play battle music:', err);
        });

        fetch('/game/api/start/', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then (data => {
                if (data.success) {
                    this.sessionId = data.session_id;
                    
                    // Initialize Ad/Buff Manager
                    if (!window.adBuffManager && this.sessionId) {
                        window.adBuffManager = new AdBuffManager(this.sessionId);
                        window.adBuffManager.gameInstance = this;
                        console.log('✓ Ad/Buff system initialized');
                    }
                    
                    this.isRunning = true;
                    this.isPaused = false;
                    this.gameStartTime = Date.now();
                    this.waveStartTime = Date.now();

                    const overlay = document.getElementById('gameIdleOverlay');
                    if (overlay) overlay.classList.add('hidden');

                    if (this.waves.length > 0) {
                        this.setupWaveSpawning();
                    }

                    const startBtn = document.getElementById('startGameBtn');
                    const pauseBtn = document.getElementById('pauseGameBtn');
                    const endBtn = document.getElementById('endGameBtn');
                    
                    if (startBtn) startBtn.disabled = true;
                    if (pauseBtn) pauseBtn.disabled = false;
                    if (endBtn) endBtn.disabled = false;

                    console.log('Game started, session:', this.sessionId);
                    this.gameLoop();
                } else {
                    alert('Error starting game: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(err => {
                console.error('Error:', err);
                alert('Failed to start game');
            });
    }

    setupWaveSpawning() {
        const wave = this.waves[this.currentWave - 1];
        if (!wave) {
            console.error('Wave not found:', this.currentWave);
            return;
        }

        this.waveEnemySpawnQueue = [];
        wave.enemies.forEach(we => {
            for (let i = 0; i < we.enemy_count; i++) {
                this.waveEnemySpawnQueue.push({
                    enemy_id: we.enemy_id,
                    enemy_name: we.enemy_name,
                    base_hp: we.base_hp,
                    speed: we.speed,
                    reward_gold: we.reward_gold,
                    score_reward: we.score_reward,
                    spawnTime: i * we.spawn_interval
                });
            }
        });
        this.waveEnemySpawnQueue.sort((a, b) => a.spawnTime - b.spawnTime);
    }

    togglePause() {
        // Pause toggle - countdown should pause
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseGameBtn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
        }
        // Handle countdown pause/resume
        if (this.countdownActive) {
            if (this.isPaused) {
                // Pausing: record when pause started
                this.countdownPauseStart = Date.now();
            } else {
                // Resuming: accumulate paused time
                if (this.countdownPauseStart) {
                    this.countdownPausedElapsed += Date.now() - this.countdownPauseStart;
                    this.countdownPauseStart = null;
                }
            }
        }
    }

    selectTower(towerId) {
        this.selectedTower = towerId;
        document.querySelectorAll('.tower-card').forEach(card => {
            card.style.borderColor = card.dataset.towerId === towerId ? '#667eea' : '#444';
        });
        console.log('Selected tower:', towerId);
    }

    placeOnCanvas(e) {
        const rect = this.canvas.getBoundingClientRect();
        let clickX = e.clientX - rect.left;
        let clickY = e.clientY - rect.top;
        
        // Scale click coordinates from display size to canvas size
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        clickX = clickX * scaleX;
        clickY = clickY * scaleY;
        
        if (!this.isRunning) {
            // Initialize audio on first user interaction
            this.initAudio();
            
            // Check music button first
            if (this.musicButtonPos) {
                if (clickX >= this.musicButtonPos.left && 
                    clickX <= this.musicButtonPos.right &&
                    clickY >= this.musicButtonPos.top && 
                    clickY <= this.musicButtonPos.bottom) {
                    this.musicButtonPressed = true;
                    this.musicButtonPressTime = Date.now();
                    this.toggleMute();
                    return;
                }
            }
            
            // Check profile button
            if (this.profileButtonPos) {
                if (clickX >= this.profileButtonPos.left && 
                    clickX <= this.profileButtonPos.right &&
                    clickY >= this.profileButtonPos.top && 
                    clickY <= this.profileButtonPos.bottom) {
                    this.profileButtonPressed = true;
                    this.profileButtonPressTime = Date.now();
                    this.playButtonClickSound();
                    this.showProfileModal();
                    return;
                }
            }
            
            // Check leaderboard button
            if (this.leaderboardButtonPos) {
                if (clickX >= this.leaderboardButtonPos.left && 
                    clickX <= this.leaderboardButtonPos.right &&
                    clickY >= this.leaderboardButtonPos.top && 
                    clickY <= this.leaderboardButtonPos.bottom) {
                    this.leaderboardButtonPressed = true;
                    this.leaderboardButtonPressTime = Date.now();
                    this.playButtonClickSound();
                    this.showLeaderboardModal();
                    return;
                }
            }
            
            // Check logout button
            if (this.logoutButtonPos) {
                if (clickX >= this.logoutButtonPos.left && 
                    clickX <= this.logoutButtonPos.right &&
                    clickY >= this.logoutButtonPos.top && 
                    clickY <= this.logoutButtonPos.bottom) {
                    this.logoutButtonPressed = true;
                    this.logoutButtonPressTime = Date.now();
                    this.playButtonClickSound();
                    this.logout();
                    return;
                }
            }
            
            // Check start button
            if (this.startButtonPos) {
                if (clickX >= this.startButtonPos.left && 
                    clickX <= this.startButtonPos.right &&
                    clickY >= this.startButtonPos.top && 
                    clickY <= this.startButtonPos.bottom) {
                    this.startButtonPressed = true;
                    this.startButtonPressTime = Date.now();
                    this.playButtonClickSound();
                    this.startGame();
                    return;
                }
            }
            return;
        }
        
        // Check pause button during gameplay
        if (this.isRunning && this.pauseButtonPos) {
            if (clickX >= this.pauseButtonPos.left && 
                clickX <= this.pauseButtonPos.right &&
                clickY >= this.pauseButtonPos.top && 
                clickY <= this.pauseButtonPos.bottom) {
                this.pauseButtonPressed = true;
                this.pauseButtonPressTime = Date.now();
                this.playButtonClickSound();
                this.togglePause();
                return;
            }
        }
        
        // Check pause menu buttons during paused state
        if (this.isPaused) {
            // Check resume button
            if (this.pauseMenuResumePos) {
                if (clickX >= this.pauseMenuResumePos.left && 
                    clickX <= this.pauseMenuResumePos.right &&
                    clickY >= this.pauseMenuResumePos.top && 
                    clickY <= this.pauseMenuResumePos.bottom) {
                    this.pauseMenuResumePressed = true;
                    this.pauseMenuResumePressTime = Date.now();
                    this.playButtonClickSound();
                    this.togglePause();
                    return;
                }
            }
            
            // Check exit button
            if (this.pauseMenuExitPos) {
                if (clickX >= this.pauseMenuExitPos.left && 
                    clickX <= this.pauseMenuExitPos.right &&
                    clickY >= this.pauseMenuExitPos.top && 
                    clickY <= this.pauseMenuExitPos.bottom) {
                    this.pauseMenuExitPressed = true;
                    this.pauseMenuExitPressTime = Date.now();
                    this.playButtonClickSound();
                    this.endGame();
                    return;
                }
            }
            
            // Check mute button
            if (this.pauseMenuMutePos) {
                if (clickX >= this.pauseMenuMutePos.left && 
                    clickX <= this.pauseMenuMutePos.right &&
                    clickY >= this.pauseMenuMutePos.top && 
                    clickY <= this.pauseMenuMutePos.bottom) {
                    this.pauseMenuMutePressed = true;
                    this.pauseMenuMutePressTime = Date.now();
                    this.playButtonClickSound();
                    this.toggleBattleMusic();
                    return;
                }
            }
            
            // Don't allow tower placement when paused
            return;
        }
        
        // Check ad confirmation modal (canvas-based)
        if (this.showAdConfirmModalState) {
            // Check YES button
            if (this.adConfirmYesPos) {
                if (clickX >= this.adConfirmYesPos.left && 
                    clickX <= this.adConfirmYesPos.right &&
                    clickY >= this.adConfirmYesPos.top && 
                    clickY <= this.adConfirmYesPos.bottom) {
                    this.playButtonClickSound();
                    this.showAdConfirmModalState = false; // Close confirmation
                    // Open video ad modal instead of text ad
                    this.showAdVideoModalState = true;
                    this.adModalStartTime = Date.now();
                    return;
                }
            }
            
            // Check NO button
            if (this.adConfirmNoPos) {
                if (clickX >= this.adConfirmNoPos.left && 
                    clickX <= this.adConfirmNoPos.right &&
                    clickY >= this.adConfirmNoPos.top && 
                    clickY <= this.adConfirmNoPos.bottom) {
                    this.playButtonClickSound();
                    this.showAdConfirmModalState = false; // Close confirmation
                    return;
                }
            }
            
            // Don't allow other interactions when confirmation modal is showing
            return;
        }
        
        // Check ad video modal (canvas-based)
        if (this.showAdVideoModalState) {
            // Check SKIP button (only clickable after 5 seconds)
            if (this.adVideoSkipPos) {
                if (clickX >= this.adVideoSkipPos.left && 
                    clickX <= this.adVideoSkipPos.right &&
                    clickY >= this.adVideoSkipPos.top && 
                    clickY <= this.adVideoSkipPos.bottom) {
                    this.playButtonClickSound();
                    this.closeAdVideoModal();
                    return;
                }
            }
            
            // Don't allow other interactions when video ad is showing
            return;
        }
        
        // Check buff selection modal (canvas-based)
        if (this.showBuffModalState && this.buffCardPositions && this.buffCardPositions.length > 0) {
            // Only allow buff selection if a buff hasn't been selected yet
            if (!this.buffSelected) {
                for (let buffCard of this.buffCardPositions) {
                    if (clickX >= buffCard.left && 
                        clickX <= buffCard.right &&
                        clickY >= buffCard.top && 
                        clickY <= buffCard.bottom) {
                        this.playButtonClickSound();
                        this.buffSelected = true; // Prevent further clicks
                        // Call AdBuffManager's selectBuff method
                        if (window.adBuffManager) {
                            window.adBuffManager.selectBuff(buffCard.buffType);
                        }
                        return;
                    }
                }
            }
            // Don't allow other interactions when buff modal is showing
            return;
        }
        
        // Check building menu interactions during gameplay
        if (this.buildingMenuOpen) {
            // Check close button
            if (this.buildingMenuClosePos) {
                if (clickX >= this.buildingMenuClosePos.left && 
                    clickX <= this.buildingMenuClosePos.right &&
                    clickY >= this.buildingMenuClosePos.top && 
                    clickY <= this.buildingMenuClosePos.bottom) {
                    this.playButtonClickSound();
                    this.buildingMenuOpen = false;
                    return;
                }
            }
            
            // Check tower selection
            if (this.towerMenuPositions) {
                for (let pos of this.towerMenuPositions) {
                    if (pos && clickX >= pos.left && 
                        clickX <= pos.right &&
                        clickY >= pos.top && 
                        clickY <= pos.bottom) {
                        this.playButtonClickSound();
                        this.selectTower(pos.towerId);
                        this.buildingMenuOpen = false;
                        return;
                    }
                }
            }
            
            // Don't allow tower placement when menu is open
            return;
        }
        
        // Check building button
        if (this.isRunning && this.buildingButtonPos) {
            if (clickX >= this.buildingButtonPos.left && 
                clickX <= this.buildingButtonPos.right &&
                clickY >= this.buildingButtonPos.top && 
                clickY <= this.buildingButtonPos.bottom) {
                this.playButtonClickSound();
                this.buildingMenuOpen = !this.buildingMenuOpen;
                this.towerMenuPositions = [];
                return;
            }
        }
        
        // Check watch ad button
        if (this.isRunning && this.watchAdButtonPos) {
            if (clickX >= this.watchAdButtonPos.left && 
                clickX <= this.watchAdButtonPos.right &&
                clickY >= this.watchAdButtonPos.top && 
                clickY <= this.watchAdButtonPos.bottom) {
                // Only allow click if not on cooldown
                if (!this.watchAdButtonPos.isOnCooldown) {
                    this.watchAdButtonPressed = true;
                    this.watchAdButtonPressTime = Date.now();
                    this.playButtonClickSound();
                    // Show confirmation dialog instead of directly opening ad modal
                    this.showAdConfirmModalState = true;
                }
                return;
            }
        }
        
        // Only place towers during active gameplay
        if (!this.selectedTower) return;

        let x = clickX / this.zoomLevel;
        let y = clickY / this.zoomLevel;
        
        // Check if click is on a valid tower slot
        const slotSize = 32;
        let validSlot = null;
        
        for (let i = 0; i < this.towerSlots.length; i++) {
            const slot = this.towerSlots[i];
            const slotX = slot.x;
            const slotY = slot.y;
            const distance = Math.sqrt((x - slotX) ** 2 + (y - slotY) ** 2);
            
            // Check if click is within slot radius (accounting for zoom)
            if (distance <= (slotSize / 2) / this.zoomLevel && !slot.occupied) {
                validSlot = i;
                break;
            }
        }
        
        // Only allow tower placement on valid, unoccupied slots
        if (validSlot === null) {
            console.log('Tower can only be placed on designated slots');
            return;
        }

        const tower = this.allTowersData.find(t => t.tower_id == this.selectedTower);
        if (!tower) return;

        if (this.playerGold >= tower.cost) {
            // Get the slot position
            const slot = this.towerSlots[validSlot];
            
            this.towers.push({ 
                x: slot.x, 
                y: slot.y, 
                radius: 15,
                tower_id: this.selectedTower,
                range: tower.range,
                base_damage: tower.base_damage,
                slotIndex: validSlot
            });
            
            // Mark slot as occupied
            slot.occupied = true;
            slot.towerIndex = this.towers.length - 1;
            
            this.playerGold -= tower.cost;
            this.updateUI();
            console.log('Tower placed on slot:', validSlot, 'Tower data:', { range: tower.range, damage: tower.base_damage, attack_speed: tower.attack_speed });
        } else {
            this.showGameMessage('Not enough gold! Need ' + tower.cost + ', have ' + this.playerGold);
        }
    }

    gameLoop() {
        if (!this.isRunning) return;

        // Only update countdown if active and not paused
        if (this.countdownActive && !this.isPaused) {
            this.updateCountdown();
        }

        if (!this.isPaused) {
            this.update();
        }
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        // Check for expired buffs at the start of each update
        this.checkBuffExpiration();
        
        // Reset watch ad button pressed state
        if (this.watchAdButtonPressed && Date.now() - this.watchAdButtonPressTime > 200) {
            this.watchAdButtonPressed = false;
        }
        
        const elapsedTime = (Date.now() - this.waveStartTime) / 1000;
        
        // Skip regular update if countdown is active (handled in gameLoop)
        if (this.countdownActive) {
            this.updateUI();
            return;
        }
        
        if (!this.countdownActive && this.waveEnemySpawnQueue.length === 0 && this.enemies.length === 0 && this.currentWave < this.waves.length) {
            this.startWaveCountdown();
        }
        
        while (this.waveEnemySpawnQueue.length > 0 && 
               this.waveEnemySpawnQueue[0].spawnTime <= elapsedTime) {
            const we = this.waveEnemySpawnQueue.shift();
            
            // Randomly choose one of the 3 paths for this enemy
            const pathIndex = Math.floor(Math.random() * this.paths.length);
            const chosenPath = this.paths[pathIndex];
            
            // Add slight random offset to prevent stacking
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            
            this.enemies.push({
                x: chosenPath[0].x + offsetX,
                y: chosenPath[0].y + offsetY,
                radius: 8,
                pathProgress: 0,
                pathIndex: pathIndex,  // Track which path this enemy follows
                hp: we.base_hp,
                maxHp: we.base_hp,
                speed: we.speed,
                enemy_id: we.enemy_id,
                enemy_name: we.enemy_name,
                reward_gold: we.reward_gold,
                score_reward: we.score_reward,
                alive: true
            });
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            const speedMultiplier = this.gameplaySpeedMultiplier || 1.0;
            enemy.pathProgress += 0.3 * (enemy.speed || 1) * speedMultiplier;
            
            // Get the path this enemy is following
            const enemyPath = this.paths[enemy.pathIndex] || this.paths[1];
            
            if (enemy.pathProgress >= this.getPathLengthForPath(enemyPath)) {
                enemy.alive = false;
                this.enemies.splice(i, 1);
                this.playerLives--;
                if (this.playerLives <= 0) this.endGame();
            } else {
                const pos = this.getPositionOnPathForPath(enemy.pathProgress, enemyPath);
                enemy.x = pos.x;
                enemy.y = pos.y;
            }
        }

        const currentTime = Date.now();
        this.towers.forEach((tower, tIdx) => {
            if (!this.towerCooldowns[tIdx]) {
                this.towerCooldowns[tIdx] = 0;
            }

            const towerData = this.allTowersData.find(t => t.tower_id == tower.tower_id);
            if (!towerData) return;
            
            const effectiveAttackSpeed = this.getEffectiveTowerAttackSpeed(towerData.attack_speed);
            const attackCooldown = 1000 / effectiveAttackSpeed;
            const timeSinceLastAttack = currentTime - this.towerCooldowns[tIdx];
            
            if (timeSinceLastAttack >= attackCooldown) {
                let enemyInRange = null;
                let closestDistance = Infinity;
                
                for (let i = 0; i < this.enemies.length; i++) {
                    const enemy = this.enemies[i];
                    if (!enemy.alive) continue;
                    const dist = Math.hypot(tower.x - enemy.x, tower.y - enemy.y);
                    if (dist < tower.range && dist < closestDistance) {
                        enemyInRange = { enemy, index: i, distance: dist };
                        closestDistance = dist;
                    }
                }
                
                if (enemyInRange) {
                    const effectiveDamage = this.getEffectiveTowerDamage(towerData.base_damage || 10);
                    this.projectiles.push({
                        x: tower.x,
                        y: tower.y,
                        targetEnemy: enemyInRange.enemy,
                        damage: effectiveDamage,
                        age: 0,
                        maxAge: 150
                    });
                    this.towerCooldowns[tIdx] = currentTime;
                    this.playArrowShotSound();
                }
            }
        });

        // Update floating damage texts
        for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
            const text = this.floatingTexts[i];
            text.age += 16;
            text.x += text.velocity.x;
            text.y += text.velocity.y;
            
            if (text.age >= text.maxAge) {
                this.floatingTexts.splice(i, 1);
            }
        }
        
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.age += 16;
            
            if (proj.age >= proj.maxAge) {
                if (proj.targetEnemy && proj.targetEnemy.alive) {
                    proj.targetEnemy.hp -= proj.damage;
                    
                    // Create floating damage text
                    this.floatingTexts.push({
                        x: proj.targetEnemy.x,
                        y: proj.targetEnemy.y - 20,
                        text: Math.floor(proj.damage),
                        age: 0,
                        maxAge: 1000, // Display for 1 second
                        velocity: { x: (Math.random() - 0.5) * 2, y: -2 } // Float upward with slight horizontal drift
                    });
                    
                    if (proj.targetEnemy.hp <= 0) {
                        proj.targetEnemy.alive = false;
                        this.playHitGoblinSound();
                        this.score += proj.targetEnemy.score_reward;
                        this.playerGold += proj.targetEnemy.reward_gold;
                        
                        const deadIdx = this.enemies.indexOf(proj.targetEnemy);
                        if (deadIdx > -1) {
                            this.enemies.splice(deadIdx, 1);
                        }
                    }
                }
                
                this.projectiles.splice(i, 1);
            }
        }

        this.updateUI();
    }

    startWaveCountdown() {
        if (this.currentWave < this.waves.length) {
            this.countdownActive = true;
            this.countdownStartTime = Date.now();
            this.countdownPausedElapsed = 0; // Reset paused elapsed time
            this.countdownPauseStart = null;
            const countdownOverlay = document.getElementById('waveCountdownOverlay');
            if (countdownOverlay) {
                countdownOverlay.classList.remove('hidden');
                const waveTitle = document.getElementById('waveTitle');
                if (waveTitle) {
                    waveTitle.textContent = `WAVE ${this.currentWave + 1}`;
                }
            }
        }
    }

    updateCountdown() {
        // Countdown using real time minus paused duration
        let pausedElapsed = this.countdownPausedElapsed || 0;
        if (this.isPaused && this.countdownPauseStart) {
            pausedElapsed += Date.now() - this.countdownPauseStart;
        }
        const elapsed = (Date.now() - this.countdownStartTime - pausedElapsed) / 1000;
        const remaining = Math.max(0, 3 - Math.floor(elapsed));

        const countdownNumber = document.getElementById('countdownNumber');
        if (countdownNumber) {
            countdownNumber.textContent = remaining;
        }

        if (elapsed >= 3) {
            this.countdownActive = false;
            const countdownOverlay = document.getElementById('waveCountdownOverlay');
            if (countdownOverlay) {
                countdownOverlay.classList.add('hidden');
            }

            this.currentWave++;
            if (this.currentWave <= this.waves.length) {
                this.waveStartTime = Date.now();
                this.waveEnemySpawnQueue = [];
                this.setupWaveSpawning();
                this.displayWaveInfo();
            } else {
                this.endGame();
            }
        }
    }

    getPathLength() {
        // Legacy function - returns length of center path
        return this.getPathLengthForPath(this.path);
    }
    
    getPathLengthForPath(path) {
        let length = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const dx = path[i + 1].x - path[i].x;
            const dy = path[i + 1].y - path[i].y;
            length += Math.hypot(dx, dy);
        }
        return length;
    }

    getPositionOnPath(distance) {
        // Legacy function - returns position on center path
        return this.getPositionOnPathForPath(distance, this.path);
    }
    
    getPositionOnPathForPath(distance, path) {
        let currentDist = 0;
        for (let i = 0; i < path.length - 1; i++) {
            const start = path[i];
            const end = path[i + 1];
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const segmentLength = Math.hypot(dx, dy);
            
            if (currentDist + segmentLength >= distance) {
                const ratio = (distance - currentDist) / segmentLength;
                return {
                    x: path[i].x + dx * ratio,
                    y: path[i].y + dy * ratio
                };
            }
            currentDist += segmentLength;
        }
        return path[path.length - 1];
    }

    showLeaderboardModal() {
        // Fetch leaderboard data
        fetch('/game/api/leaderboard/')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.leaderboard) {
                    // Remove existing modal if it exists
                    let existingModal = document.getElementById('leaderboardModal');
                    if (existingModal) {
                        existingModal.remove();
                    }

                    // Create modal container
                    const modal = document.createElement('div');
                    modal.id = 'leaderboardModal';
                    modal.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10000;
                        padding: 20px;
                        box-sizing: border-box;
                    `;

                    // Build leaderboard content
                    let tableRows = '';
                    data.leaderboard.forEach((player, idx) => {
                        tableRows += `
                            <tr style="border-bottom: 1px solid rgba(62, 39, 35, 0.6); height: 30px;">
                                <td style="padding: 8px 12px; color: #fff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8); text-align: left; width: 15%;">#${idx + 1}</td>
                                <td style="padding: 8px 12px; color: #fff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8); text-align: left; width: 35%;">${player.username}</td>
                                <td style="padding: 8px 12px; color: #fff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8); text-align: center; width: 25%;">${player.score}</td>
                                <td style="padding: 8px 12px; color: #fff; font-weight: bold; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8); text-align: center; width: 25%;">${player.level}</td>
                            </tr>
                        `;
                    });

                    const html = `
                        <div style="
                            background: linear-gradient(135deg, #5c4033 0%, #6d4c41 25%, #5c4033 50%, #6d4c41 75%, #5c4033 100%);
                            background-size: 200% 200%;
                            color: #fff;
                            padding: 30px;
                            border-radius: 15px;
                            width: 100%;
                            max-width: 700px;
                            border: 4px solid #3e2723;
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 5px rgba(0, 0, 0, 0.5);
                            font-family: 'Press Start 2P', 'Courier New', monospace;
                            position: relative;
                            overflow: hidden;
                            max-height: 80vh;
                            display: flex;
                            flex-direction: column;
                        ">
                            <div style="
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                background: 
                                    repeating-linear-gradient(
                                        90deg,
                                        transparent,
                                        transparent 2px,
                                        rgba(0, 0, 0, 0.03) 2px,
                                        rgba(0, 0, 0, 0.03) 4px
                                    ),
                                    repeating-linear-gradient(
                                        0deg,
                                        transparent,
                                        transparent 2px,
                                        rgba(0, 0, 0, 0.03) 2px,
                                        rgba(0, 0, 0, 0.03) 4px
                                    );
                                border-radius: 15px;
                                pointer-events: none;
                            "></div>

                            <h2 style="
                                text-align: center;
                                margin: 0 0 20px 0;
                                color: #fff;
                                font-weight: bold;
                                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                                position: relative;
                                z-index: 1;
                                font-size: 14px;
                                letter-spacing: 2px;
                            ">LEADERBOARD</h2>

                            <div style="
                                overflow-y: auto;
                                position: relative;
                                z-index: 1;
                                flex: 1;
                                margin-bottom: 20px;
                            ">
                                <table style="
                                    width: 100%;
                                    border-collapse: collapse;
                                    font-size: 11px;
                                ">
                                    <thead>
                                        <tr style="
                                            border-bottom: 3px solid #3e2723;
                                            background: rgba(62, 39, 35, 0.3);
                                            height: 30px;
                                        ">
                                            <th style="
                                                padding: 8px 12px;
                                                text-align: left;
                                                color: #fff;
                                                font-weight: bold;
                                                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                                                width: 15%;
                                            ">Rank</th>
                                            <th style="
                                                padding: 8px 12px;
                                                text-align: left;
                                                color: #fff;
                                                font-weight: bold;
                                                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                                                width: 35%;
                                            ">Player</th>
                                            <th style="
                                                padding: 8px 12px;
                                                text-align: center;
                                                color: #fff;
                                                font-weight: bold;
                                                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                                                width: 25%;
                                            ">Score</th>
                                            <th style="
                                                padding: 8px 12px;
                                                text-align: center;
                                                color: #fff;
                                                font-weight: bold;
                                                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                                                width: 25%;
                                            ">Level</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${tableRows}
                                    </tbody>
                                </table>
                            </div>

                            <button id="closeLeaderboardBtn" style="
                                width: 100%;
                                padding: 12px;
                                background: linear-gradient(135deg, #4e342e 0%, #5d4037 100%);
                                color: white;
                                border: 2px solid #3e2723;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 11px;
                                font-family: 'Press Start 2P', 'Courier New', monospace;
                                font-weight: bold;
                                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                                position: relative;
                                z-index: 1;
                                transition: all 0.1s;
                            ">CLOSE</button>
                        </div>
                    `;

                    modal.innerHTML = html;
                    document.body.appendChild(modal);

                    // Close button handler
                    document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
                        modal.remove();
                    });

                    // Close on outside click
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            modal.remove();
                        }
                    });
                } else {
                    alert('Failed to load leaderboard');
                }
            })
            .catch(err => {
                console.error('Error loading leaderboard:', err);
                alert('Error loading leaderboard');
            });
    }

    showProfileModal() {
        // Fetch player profile data
        fetch('/auth/api/profile/')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    // Remove existing modal if it exists
                    let existingModal = document.getElementById('profileModal');
                    if (existingModal) {
                        existingModal.remove();
                    }

                    // Create modal container
                    const modal = document.createElement('div');
                    modal.id = 'profileModal';
                    modal.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10000;
                        padding: 20px;
                        box-sizing: border-box;
                    `;

                    const html = `
                        <div style="
                            background: linear-gradient(135deg, #5c4033 0%, #6d4c41 25%, #5c4033 50%, #6d4c41 75%, #5c4033 100%);
                            background-size: 200% 200%;
                            color: #fff;
                            padding: 30px;
                            border-radius: 15px;
                            width: 100%;
                            max-width: 500px;
                            border: 4px solid #3e2723;
                            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.9), inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -2px 5px rgba(0, 0, 0, 0.5);
                            font-family: 'Press Start 2P', 'Courier New', monospace;
                            position: relative;
                            overflow: hidden;
                        ">
                            <div style="
                                position: absolute;
                                top: 0;
                                left: 0;
                                right: 0;
                                bottom: 0;
                                background: 
                                    repeating-linear-gradient(
                                        90deg,
                                        transparent,
                                        transparent 2px,
                                        rgba(0, 0, 0, 0.03) 2px,
                                        rgba(0, 0, 0, 0.03) 4px
                                    ),
                                    repeating-linear-gradient(
                                        0deg,
                                        transparent,
                                        transparent 2px,
                                        rgba(0, 0, 0, 0.03) 2px,
                                        rgba(0, 0, 0, 0.03) 4px
                                    );
                                border-radius: 15px;
                                pointer-events: none;
                            "></div>

                            <h2 style="
                                text-align: center;
                                margin: 0 0 30px 0;
                                color: #fff;
                                font-weight: bold;
                                text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
                                position: relative;
                                z-index: 1;
                                font-size: 14px;
                                letter-spacing: 2px;
                            ">PLAYER PROFILE</h2>

                            <div style="
                                position: relative;
                                z-index: 1;
                                font-size: 11px;
                                line-height: 2.2;
                            ">
                                <div style="margin-bottom: 15px; border-bottom: 1px solid #3e2723; padding-bottom: 12px;">
                                    <span style="color: #ffc107;">Username:</span>
                                    <span style="color: #ecf0f1; float: right;">${data.user}</span>
                                </div>
                                <div style="margin-bottom: 15px; border-bottom: 1px solid #3e2723; padding-bottom: 12px;">
                                    <span style="color: #ffc107;">Email:</span>
                                    <span style="color: #ecf0f1; float: right;">${data.email}</span>
                                </div>
                                <div style="margin-bottom: 15px; border-bottom: 1px solid #3e2723; padding-bottom: 12px;">
                                    <span style="color: #ffc107;">Highest Score:</span>
                                    <span style="color: #fff; float: right; font-weight: bold;">${data.highest_score}</span>
                                </div>
                                <div style="margin-bottom: 15px; border-bottom: 1px solid #3e2723; padding-bottom: 12px;">
                                    <span style="color: #ffc107;">Highest Level:</span>
                                    <span style="color: #fff; float: right; font-weight: bold;">${data.highest_level}</span>
                                </div>
                                <div style="margin-bottom: 15px;">
                                    <span style="color: #ffc107;">Total Games:</span>
                                    <span style="color: #ecf0f1; float: right;">${data.total_games || 0}</span>
                                </div>
                            </div>

                            <button id="closeProfileBtn" style="
                                width: 100%;
                                padding: 12px;
                                margin-top: 20px;
                                background: linear-gradient(135deg, #4e342e 0%, #5d4037 100%);
                                color: white;
                                border: 2px solid #3e2723;
                                border-radius: 8px;
                                cursor: pointer;
                                font-size: 11px;
                                font-family: 'Press Start 2P', 'Courier New', monospace;
                                font-weight: bold;
                                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                                position: relative;
                                z-index: 1;
                                transition: all 0.1s;
                            ">CLOSE</button>
                        </div>
                    `;

                    modal.innerHTML = html;
                    document.body.appendChild(modal);

                    // Close button handler
                    document.getElementById('closeProfileBtn').addEventListener('click', () => {
                        modal.remove();
                    });

                    // Close on outside click
                    modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                            modal.remove();
                        }
                    });
                } else {
                    alert('Failed to load profile: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(err => {
                console.error('Error loading profile:', err);
                alert('Error loading profile');
            });
    }

    logout() {
        // Create a hidden form and submit it to logout
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/auth/logout/';
        
        // Add CSRF token
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = 'csrfmiddlewaretoken';
        csrfInput.value = this.getCookie('csrftoken');
        
        form.appendChild(csrfInput);
        document.body.appendChild(form);
        form.submit();
    }

    getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    playButtonClickSound() {
        this.buttonClickSound.currentTime = 0;
        this.buttonClickSound.play().catch(err => {
            console.warn('Could not play button click sound:', err);
        });
    }
    
    playArrowShotSound() {
        try {
            const sound = this.arrowShotSound.cloneNode();
            sound.volume = 0.6;
            sound.play().catch(err => {
                console.warn('Could not play arrow shot sound:', err);
            });
        } catch (err) {
            console.warn('Could not clone arrow shot sound:', err);
        }
    }
    
    playHitGoblinSound() {
        this.hitGoblinSound.currentTime = 0;
        this.hitGoblinSound.play().catch(err => {
            console.warn('Could not play hit goblin sound:', err);
        });
    }
    
    showGameMessage(message) {
        this.gameMessage = message;
        this.gameMessageTime = Date.now();
    }
    
    drawGameMessage() {
        if (!this.gameMessage) return;
        
        const elapsed = Date.now() - this.gameMessageTime;
        if (elapsed > this.gameMessageDuration) {
            this.gameMessage = null;
            return;
        }
        
        // Calculate fade out effect
        const fadeStart = this.gameMessageDuration - 300; // Fade out last 300ms
        let opacity = 1;
        if (elapsed > fadeStart) {
            opacity = 1 - ((elapsed - fadeStart) / 300);
        }
        
        // Draw message background
        this.ctx.save();
        this.ctx.globalAlpha = opacity * 0.8;
        
        const messageWidth = 300;
        const messageHeight = 60;
        const messageX = (this.canvas.width - messageWidth) / 2;
        const messageY = this.canvas.height / 2 - 100;
        
        // Draw background
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillRect(messageX, messageY, messageWidth, messageHeight);
        
        // Draw border
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(messageX, messageY, messageWidth, messageHeight);
        
        // Draw text
        this.ctx.globalAlpha = opacity;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.gameMessage, this.canvas.width / 2, messageY + messageHeight / 2);
        
        this.ctx.restore();
    }

    initAudio() {
        // Start lobby music on first user interaction
        if (!this.musicStarted && !this.isRunning) {
            this.musicStarted = true;
            this.lobbyMusic.currentTime = 0;
            this.lobbyMusic.play().catch(err => {
                console.warn('Could not play lobby music:', err);
            });
        }
    }

    toggleMute() {
        this.musicMuted = !this.musicMuted;
        
        if (this.musicMuted) {
            this.lobbyMusic.pause();
        } else {
            // Only play if music has been started
            if (this.musicStarted) {
                this.lobbyMusic.play().catch(err => {
                    console.warn('Could not resume lobby music:', err);
                });
            }
        }
        
        // Play button click sound when toggling mute
        this.playButtonClickSound();
    }

    toggleBattleMusic() {
        this.pauseMenuBattleMusicMuted = !this.pauseMenuBattleMusicMuted;
        
        if (this.pauseMenuBattleMusicMuted) {
            this.battleMusic.pause();
        } else {
            // Resume battle music if it was playing
            if (this.isRunning && this.battleMusic.paused) {
                this.battleMusic.play().catch(err => {
                    console.warn('Could not resume battle music:', err);
                });
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TowerDefenseGame();
});
   