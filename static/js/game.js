class TowerDefenseGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
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
        
        // Define the enemy path
        this.path = [
            { x: 50, y: 75 },
            { x: 150, y: 75 },
            { x: 150, y: 150 },
            { x: 300, y: 150 },
            { x: 300, y: 300 },
            { x: 550, y: 300 }
        ];
        
        this.init();
    }

    init() {
        const startBtn = document.getElementById('startGameBtn');
        const pauseBtn = document.getElementById('pauseGameBtn');
        const endBtn = document.getElementById('endGameBtn');
        
        if (startBtn) startBtn.addEventListener('click', () => this.startGame());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
        if (endBtn) endBtn.addEventListener('click', () => this.endGame());
        
        document.querySelectorAll('.btn-select-tower').forEach(btn => {
            btn.addEventListener('click', (e) => {
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
        this.drawInitialMap();
    }

    drawInitialMap() {
        // Draw the initial map with the path
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 40;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
        
        // Draw path outline
        this.ctx.strokeStyle = '#888';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw start and end markers
        this.ctx.fillStyle = '#4caf50';
        this.ctx.beginPath();
        this.ctx.arc(this.path[0].x, this.path[0].y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#f44336';
        this.ctx.beginPath();
        this.ctx.arc(this.path[this.path.length - 1].x, this.path[this.path.length - 1].y, 8, 0, Math.PI * 2);
        this.ctx.fill();
    }

    loadWavesAndEnemies() {
        fetch('/game/api/waves/')
            .then(res => res.json())
            .then(data => {
                this.waves = data.waves;
                console.log('Waves loaded:', this.waves);
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
                        // Ensure path starts with /static/ or /media/
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

        fetch('/game/api/start/', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    this.sessionId = data.session_id;
                    this.isRunning = true;
                    this.isPaused = false;
                    this.gameStartTime = Date.now();
                    this.waveStartTime = Date.now();

                    // Hide idle overlay
                    const overlay = document.getElementById('gameIdleOverlay');
                    if (overlay) {
                        overlay.classList.add('hidden');
                    }

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
                    base_def: we.base_def,
                    speed: we.speed,
                    reward_gold: we.reward_gold,
                    score_reward: we.score_reward,
                    image_path: we.image_path,
                    spawnTime: i * we.spawn_interval
                });
            }
        });
        this.waveEnemySpawnQueue.sort((a, b) => a.spawnTime - b.spawnTime);
        console.log('Wave spawning setup - Queue length:', this.waveEnemySpawnQueue.length);
        console.log('First enemy spawn time:', this.waveEnemySpawnQueue[0]?.spawnTime);
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

    getTowerCost(towerId) {
        const tower = this.allTowersData.find(t => t.tower_id == towerId);
        return tower ? tower.cost : 0;
    }

    placeOnCanvas(e) {
        if (!this.isRunning || !this.selectedTower || this.isPaused) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Get tower data
        const tower = this.allTowersData.find(t => t.tower_id == this.selectedTower);
        if (!tower) {
            console.error('Tower not found:', this.selectedTower);
            return;
        }

        if (this.playerGold >= tower.cost) {
            this.towers.push({ 
                x, y, 
                radius: 15,
                tower_id: this.selectedTower,
                range: tower.range,
                base_damage: tower.base_damage
            });
            this.playerGold -= tower.cost;
            this.updateUI();
            console.log('Tower placed at:', x, y);
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
        // Spawn enemies based on wave schedule
        const elapsedTime = (Date.now() - this.waveStartTime) / 1000;
        
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
                image_path: we.image_path,
                alive: true
            });
            console.log('Enemy spawned:', we.enemy_name, 'HP:', we.base_hp);
        }

        // Move enemies along path
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.pathProgress += 0.3 * (enemy.speed || 1);
            
            if (enemy.pathProgress >= this.getPathLength()) {
                enemy.alive = false;
                this.enemies.splice(i, 1);
                this.playerLives--;
                console.log('Enemy escaped! Lives remaining:', this.playerLives);
                if (this.playerLives <= 0) this.endGame();
            } else {
                const pos = this.getPositionOnPath(enemy.pathProgress);
                enemy.x = pos.x;
                enemy.y = pos.y;
            }
        }

        // Tower shooting with cooldown
        const currentTime = Date.now();
        this.towers.forEach((tower, tIdx) => {
            // Initialize cooldown if not exists
            if (!this.towerCooldowns[tIdx]) {
                this.towerCooldowns[tIdx] = 0;
            }

            // Get tower data for attack speed
            const towerData = this.allTowersData.find(t => t.tower_id == tower.tower_id);
            if (!towerData) {
                console.warn('Tower data not found for tower_id:', tower.tower_id);
                return;
            }
            
            const attackCooldown = 1000 / towerData.attack_speed;
            const timeSinceLastAttack = currentTime - this.towerCooldowns[tIdx];
            
            // Check if tower can attack
            if (timeSinceLastAttack >= attackCooldown) {
                let enemyInRange = null;
                let closestDistance = Infinity;
                
                // Find closest enemy in range
                for (let i = 0; i < this.enemies.length; i++) {
                    const enemy = this.enemies[i];
                    if (!enemy.alive) continue;
                    const dist = Math.hypot(tower.x - enemy.x, tower.y - enemy.y);
                    if (dist < tower.range && dist < closestDistance) {
                        enemyInRange = { enemy, index: i, distance: dist };
                        closestDistance = dist;
                    }
                }
                
                // Attack the enemy if found
                if (enemyInRange) {
                    const damageDealt = towerData.base_damage || 10;
                    
                    // Create laser projectile - store reference to enemy object directly
                    this.projectiles.push({
                        x: tower.x,
                        y: tower.y,
                        targetEnemy: enemyInRange.enemy,
                        damage: damageDealt,
                        age: 0,
                        maxAge: 150 // milliseconds
                    });
                    
                    console.log(`🎯 Tower at (${tower.x}, ${tower.y}) shooting at ${enemyInRange.enemy.enemy_name}`);
                    this.towerCooldowns[tIdx] = currentTime;
                }
            }
        });

        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            proj.age += 16; // Approximate frame time
            
            if (proj.age >= proj.maxAge) {
                // Projectile hit - deal damage to target enemy
                if (proj.targetEnemy && proj.targetEnemy.alive) {
                    proj.targetEnemy.hp -= proj.damage;
                    console.log(`💥 Hit! ${proj.targetEnemy.enemy_name} takes ${proj.damage} damage. Remaining HP: ${proj.targetEnemy.hp}`);
                    
                    if (proj.targetEnemy.hp <= 0) {
                        proj.targetEnemy.alive = false;
                        this.score += proj.targetEnemy.score_reward;
                        this.playerGold += proj.targetEnemy.reward_gold;
                        
                        // Remove dead enemy from array
                        const deadIdx = this.enemies.indexOf(proj.targetEnemy);
                        if (deadIdx > -1) {
                            this.enemies.splice(deadIdx, 1);
                        }
                        console.log(`💀 Enemy killed! Gold: +${proj.targetEnemy.reward_gold}, Score: +${proj.targetEnemy.score_reward}`);
                    }
                }
                
                this.projectiles.splice(i, 1);
            }
        }

        this.updateUI();
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

    draw() {
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw path
        this.ctx.strokeStyle = '#667eea';
        this.ctx.lineWidth = 40;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        for (let i = 1; i < this.path.length; i++) {
            this.ctx.lineTo(this.path[i].x, this.path[i].y);
        }
        this.ctx.stroke();

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
            this.ctx.fillStyle = '#ff6b6b';
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw health bar
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(enemy.x - 10, enemy.y - 15, 20, 3);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fillRect(enemy.x - 10, enemy.y - 15, (enemy.hp / enemy.maxHp) * 20, 3);
        });
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
        
        const startBtn = document.getElementById('startGameBtn');
        const pauseBtn = document.getElementById('pauseGameBtn');
        const endBtn = document.getElementById('endGameBtn');
        
        if (startBtn) startBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
        if (endBtn) endBtn.disabled = true;

        const formData = new FormData();
        formData.append('session_id', this.sessionId);
        formData.append('final_score', this.score);
        formData.append('level_reached', this.currentWave);

        fetch('/game/api/end/', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert(`Game Over! Final Score: ${this.score}`);
                } else {
                    alert('Error ending game');
                }
            })
            .catch(err => console.error('Error:', err));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TowerDefenseGame();
});
