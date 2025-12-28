class TowerDefenseGame {
    constructor() {
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
        
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.selectedTower = null;
        
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
        
        // Tileset images
        this.grassTile = new Image();
        this.dirtPath = new Image();
        this.treeRock = new Image();
        this.bush = new Image();
        this.spawnPoint = new Image();
        this.castle = new Image();
        
        // Define the enemy path
        this.path = [
            { x: 50, y: 75 },
            { x: 150, y: 75 },
            { x: 150, y: 150 },
            { x: 300, y: 150 },
            { x: 300, y: 300 },
            { x: 550, y: 300 }
        ];
        
        // Decorative tiles - REMOVED (using procedural generation)
        this.decorations = [];
        
        // Add zoom/scale factor
        this.zoomLevel = 0.8; // Reduced from 1.5 to fit on screen
        
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
        
        // Audio elements
        this.lobbyMusic = new Audio();
        this.battleMusic = new Audio();
        this.buttonClickSound = new Audio();
        this.musicStarted = false; // Track if music has started
        
        this.init();
    }

    init() {
        // Load tileset images
        this.grassTile.src = '/static/img/grass-tile.png';
        this.dirtPath.src = '/static/img/dirt-path.png';
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
        
        // Load waves and tower images on init
        this.loadWavesAndEnemies();
        this.loadTowerImages();
        this.initializeTowerSlots();
        this.drawLobbyScreen();
        this.lobbyLoop();
    }
    
    initializeTowerSlots() {
        this.towerSlots = [];
        const slotSize = 40;
        
        // Manually defined tower slot positions based on marked locations
        // These coordinates correspond to the game world (before zoom is applied)
        const slotPositions = [
            // Top area - around first horizontal segment 1-3
            { x: 90, y: 32 },
            { x: 130, y: 32 },
            { x: 188, y: 50 },
            
            // Upper middle area - around turn 4-6
            { x: 110, y: 116 },
            { x: 190, y: 110 },
            { x: 240, y: 110 },
            
            // Middle area - around second turn 7-9
            { x: 300, y: 110 },
            { x: 340, y: 150 },
            { x: 340, y: 260 },
            
            // Lower middle area - around third turn 10-12
            { x: 260, y: 190 },
            { x: 290, y: 340 },
            { x: 440, y: 260 },
            
            // Right side area - before castle 13-15
            { x: 360, y: 340 },
            { x: 420, y: 340 },
            { x: 470, y: 340 }
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
        
        // Limit to 15 slots
        this.towerSlots = this.towerSlots.slice(0, 15);
        
        console.log(`Initialized ${this.towerSlots.length} tower slots at marked positions`);
    }
    
    drawTowerSlots() {
        const slotSize = 40;
        
        this.towerSlots.forEach((slot, index) => {
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
            if (!slot.occupied) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText((index + 1).toString(), slot.x, slot.y);
            }
        });
    }
    
    lobbyLoop() {
        if (this.isRunning) return; // Stop lobby loop when game starts
        
        this.drawLobbyScreen();
        requestAnimationFrame(() => this.lobbyLoop());
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
        
        // Draw leather background with gradient - darker with reduced opacity
        const gradient = this.ctx.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
        gradient.addColorStop(0, 'rgba(40, 25, 15, 0.65)');
        gradient.addColorStop(0.5, 'rgba(50, 30, 20, 0.65)');
        gradient.addColorStop(1, 'rgba(40, 25, 15, 0.65)');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
        
        // Add scanline overlay effect
        for (let i = 0; i < panelHeight; i += 4) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
            this.ctx.fillRect(panelX, panelY + i, panelWidth, 2);
        }
        
        // Add border
        this.ctx.strokeStyle = '#4a342c';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        
        // Draw title - Wave number
        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText(titleText, panelX + panelWidth / 2, panelY + padding + 2);
        
        // Draw divider line
        this.ctx.strokeStyle = '#8b7355';
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
        
        // Draw leather background with gradient
        const gradient = this.ctx.createLinearGradient(menuX, menuY, menuX, menuY + menuHeight);
        gradient.addColorStop(0, '#5c4033');
        gradient.addColorStop(0.5, '#6d4c41');
        gradient.addColorStop(1, '#5c4033');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(menuX, menuY, menuWidth, menuHeight);
        
        // Add scanline overlay effect
        for (let i = 0; i < menuHeight; i += 4) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            this.ctx.fillRect(menuX, menuY + i, menuWidth, 2);
        }
        
        // Add border and inset shadow
        this.ctx.strokeStyle = '#4a342c';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(menuX, menuY, menuWidth, menuHeight);
        
        // Draw title
        this.ctx.fillStyle = '#ffc107';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('PAUSED', this.canvas.width / 2, menuY + padding);
        
        // Draw divider line
        this.ctx.strokeStyle = '#8b7355';
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

    drawGrassBackground() {
        const tileSize = 32;
        const cols = Math.ceil(this.canvas.width / tileSize);
        const rows = Math.ceil(this.canvas.height / tileSize);
        
        // Draw forest procedurally
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = col * tileSize;
                const y = row * tileSize;
                
                // Use perlin-like noise for forest generation
                const noise = this.getForestNoise(col, row);
                let color = '#2d5016'; // Dark green base
                
                if (noise > 0.7) {
                    color = '#1a3d0a'; // Very dark forest
                } else if (noise > 0.5) {
                    color = '#2d5016'; // Dark green
                } else if (noise > 0.3) {
                    color = '#3d6b1f'; // Medium green
                } else {
                    color = '#4d8b2f'; // Light green grass
                }
                
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x, y, tileSize, tileSize);
                
                // Add pixelated tree details - but not on tower slots
                if (noise > 0.6) {
                    // Check if this tile overlaps with a tower slot
                    const tileCenter = { x: x + tileSize / 2, y: y + tileSize / 2 };
                    let isOnTowerSlot = false;
                    
                    for (let slot of this.towerSlots) {
                        const distance = Math.sqrt((tileCenter.x - slot.x) ** 2 + (tileCenter.y - slot.y) ** 2);
                        if (distance < 40) { // Tower slot radius
                            isOnTowerSlot = true;
                            break;
                        }
                    }
                    
                    // Only draw tree if not on a tower slot
                    if (!isOnTowerSlot) {
                        this.drawPixelatedTree(x, y, tileSize);
                    }
                }
            }
        }
    }

    getForestNoise(x, y) {
        // Simple seeded random for consistent forest generation
        const seed = (x * 73856093) ^ (y * 19349663);
        let n = Math.sin(seed) * 43758.5453;
        return n - Math.floor(n);
    }

    drawPixelatedTree(x, y, tileSize) {
        const pixelSize = 4;
        const offset = tileSize / 2;
        
        // Tree trunk (brown)
        this.ctx.fillStyle = '#5c3317';
        this.ctx.fillRect(x + offset - pixelSize, y + offset, pixelSize * 2, pixelSize * 3);
        
        // Tree canopy (dark green)
        this.ctx.fillStyle = '#0d4d0d';
        this.ctx.fillRect(x + offset - pixelSize * 2, y + offset - pixelSize * 2, pixelSize * 4, pixelSize * 2);
        this.ctx.fillRect(x + offset - pixelSize * 1.5, y + offset - pixelSize * 4, pixelSize * 3, pixelSize * 2);
    }

    drawInitialMap() {
        // Draw background without zoom to prevent gaps
        this.drawGrassBackground();
        
        // Save context state and apply zoom for game elements
        this.ctx.save();
        this.ctx.scale(this.zoomLevel, this.zoomLevel);
        
        // Draw path with dirt tiles
        this.drawDirtPath();
        
        // Draw spawn point at path start
        this.drawSpawnPoint();
        
        // Draw castle at path end
        this.drawCastle();
        
        // Restore context state
        this.ctx.restore();
    }

    drawDecorations() {
        // No longer needed - trees are generated procedurally
        return;
    }

    draw() {
        // Disable image smoothing
        this.ctx.imageSmoothingEnabled = false;
        
        // Draw background without zoom
        this.drawGrassBackground();
        
        // Save context state and apply zoom for game elements
        this.ctx.save();
        this.ctx.scale(this.zoomLevel, this.zoomLevel);
        
        // Draw path with dirt tiles
        this.drawDirtPath();
        this.drawSpawnPoint();
        this.drawCastle();
        
        // Draw tower slots
        this.drawTowerSlots();

        // Draw towers
        this.towers.forEach(tower => {
            // Try to draw tower image first
            const towerImg = this.towerImages[tower.tower_id];
            if (towerImg && towerImg.complete) {
                this.ctx.drawImage(towerImg, tower.x - 20, tower.y - 20, 40, 40);
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

        // Draw projectiles (laser beams)
        this.projectiles.forEach(proj => {
            const progress = proj.age / proj.maxAge;
            
            // Get current target position
            const targetX = proj.targetEnemy ? proj.targetEnemy.x : proj.x;
            const targetY = proj.targetEnemy ? proj.targetEnemy.y : proj.y;
            
            // Draw laser line from tower to target
            this.ctx.strokeStyle = `rgba(255, 200, 0, ${1 - progress})`;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(proj.x, proj.y);
            this.ctx.lineTo(targetX, targetY);
            this.ctx.stroke();
            
            // Draw impact glow at target
            this.ctx.fillStyle = `rgba(255, 150, 0, ${0.6 * (1 - progress)})`;
            this.ctx.beginPath();
            this.ctx.arc(targetX, targetY, 5 + progress * 10, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw enemies
        this.enemies.forEach(enemy => {
            const enemyImg = this.enemyImages[enemy.enemy_id];
            
            // Try to draw enemy image first
            if (enemyImg && enemyImg.complete && enemyImg.naturalWidth > 0) {
                this.ctx.drawImage(enemyImg, enemy.x - 12, enemy.y - 12, 24, 24);
            } else {
                // Fallback to circle if image not loaded
                this.ctx.fillStyle = '#ff6b6b';
                this.ctx.beginPath();
                this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw health bar
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(enemy.x - 10, enemy.y - 15, 20, 3);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(enemy.x - 10, enemy.y - 15, (enemy.hp / enemy.maxHp) * 20, 3);
        });
        
        // Restore context state
        this.ctx.restore();
        
        // Draw pause button during gameplay
        if (this.isRunning) {
            this.drawPauseButton();
            this.drawWaveInfoDisplay();
        }
        
        // Draw pause menu if paused
        if (this.isPaused) {
            this.showPauseMenu();
        }
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
        
        if (endOverlay && finalScoreEl && waveReachedEl && goldEarnedEl) {
            finalScoreEl.textContent = this.score;
            waveReachedEl.textContent = this.currentWave;
            goldEarnedEl.textContent = this.playerGold;
            endOverlay.classList.remove('hidden');
        }
        
        // Set up restart button listener
        const restartBtn = document.getElementById('restartGameBtn');
        if (restartBtn) {
            restartBtn.onclick = () => this.restartGame();
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

    drawTowerSlots() {
        const slotSize = 40;
        
        this.towerSlots.forEach((slot, index) => {
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
            
            // Display slot number only if unoccupied
            if (!slot.occupied) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 14px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText((index + 1).toString(), slot.x, slot.y);
            }
        });
    }

    drawDirtPath() {
        this.ctx.strokeStyle = '#8b7355';
        this.ctx.lineWidth = 50;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
    }

    drawSpawnPoint() {
        const spawnX = this.path[0].x;
        const spawnY = this.path[0].y;
        
        if (this.spawnPoint.complete && this.spawnPoint.naturalWidth > 0) {
            this.ctx.drawImage(this.spawnPoint, spawnX - 25, spawnY - 25, 50, 50);
        } else {
            this.ctx.fillStyle = '#4caf50';
            this.ctx.beginPath();
            this.ctx.arc(spawnX, spawnY, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    drawCastle() {
        const castleX = this.path[this.path.length - 1].x;
        const castleY = this.path[this.path.length - 1].y;
        
        if (this.castle.complete && this.castle.naturalWidth > 0) {
            this.ctx.drawImage(this.castle, castleX - 35, castleY - 35, 70, 70);
        } else {
            this.ctx.fillStyle = '#f44336';
            this.ctx.fillRect(castleX - 20, castleY - 20, 40, 40);
            this.ctx.fillRect(castleX - 25, castleY - 25, 10, 10);
            this.ctx.fillRect(castleX + 15, castleY - 25, 10, 10);
        }
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
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseGameBtn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? 'Resume' : 'Pause';
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
        
        // Only place towers during active gameplay
        if (!this.selectedTower) return;

        let x = clickX / this.zoomLevel;
        let y = clickY / this.zoomLevel;
        
        // Check if click is on a valid tower slot
        const slotSize = 40;
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
            console.log('Tower placed on slot:', validSlot);
        } else {
            alert('Not enough gold! Need ' + tower.cost + ', have ' + this.playerGold);
        }
    }

    gameLoop() {
        if (!this.isRunning) return;

        if (!this.isPaused) {
            this.update();
        }
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        const elapsedTime = (Date.now() - this.waveStartTime) / 1000;
        
        if (this.countdownActive) {
            this.updateCountdown();
            this.updateUI();
            return;
        }
        
        if (!this.countdownActive && this.waveEnemySpawnQueue.length === 0 && this.enemies.length === 0 && this.currentWave < this.waves.length) {
            this.startWaveCountdown();
        }
        
        while (this.waveEnemySpawnQueue.length > 0 && 
               this.waveEnemySpawnQueue[0].spawnTime <= elapsedTime) {
            const we = this.waveEnemySpawnQueue.shift();
            this.enemies.push({
                x: this.path[0].x,
                y: this.path[0].y,
                radius: 8,
                pathProgress: 0,
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
            enemy.pathProgress += 0.3 * (enemy.speed || 1);
            
            if (enemy.pathProgress >= this.getPathLength()) {
                enemy.alive = false;
                this.enemies.splice(i, 1);
                this.playerLives--;
                if (this.playerLives <= 0) this.endGame();
            } else {
                const pos = this.getPositionOnPath(enemy.pathProgress);
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
            
            const attackCooldown = 1000 / towerData.attack_speed;
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
                    this.projectiles.push({
                        x: tower.x,
                        y: tower.y,
                        targetEnemy: enemyInRange.enemy,
                        damage: towerData.base_damage || 10,
                        age: 0,
                        maxAge: 150
                    });
                    this.towerCooldowns[tIdx] = currentTime;
                }
            }
        });

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.age += 16;
            
            if (proj.age >= proj.maxAge) {
                if (proj.targetEnemy && proj.targetEnemy.alive) {
                    proj.targetEnemy.hp -= proj.damage;
                    
                    if (proj.targetEnemy.hp <= 0) {
                        proj.targetEnemy.alive = false;
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
        const elapsed = (Date.now() - this.countdownStartTime) / 1000;
        const remaining = Math.ceil(3 - elapsed);
        
        const countdownNumber = document.getElementById('countdownNumber');
        if (countdownNumber) {
            countdownNumber.textContent = Math.max(0, remaining);
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
        let length = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
            const dx = this.path[i + 1].x - this.path[i].x;
            const dy = this.path[i + 1].y - this.path[i].y;
            length += Math.hypot(dx, dy);
        }
        return length;
    }

    getPositionOnPath(distance) {
        let currentDist = 0;
        for (let i = 0; i < this.path.length - 1; i++) {
            const dx = this.path[i + 1].x - this.path[i].x;
            const dy = this.path[i + 1].y - this.path[i].y;
            const segmentLength = Math.hypot(dx, dy);
            
            if (currentDist + segmentLength >= distance) {
                const ratio = (distance - currentDist) / segmentLength;
                return {
                    x: this.path[i].x + dx * ratio,
                    y: this.path[i].y + dy * ratio
                };
            }
            currentDist += segmentLength;
        }
        return this.path[this.path.length - 1];
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
