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
        
        this.init();
    }

    init() {
        document.getElementById('startGameBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseGameBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('endGameBtn').addEventListener('click', () => this.endGame());
        
        document.querySelectorAll('.btn-select-tower').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const towerId = e.target.closest('.tower-card').dataset.towerId;
                this.selectTower(towerId);
            });
        });

        this.canvas.addEventListener('click', (e) => this.placeOnCanvas(e));
    }

    startGame() {
        if (this.isRunning) return;

        fetch('{% url "start_game" %}', { method: 'POST' })
            .then(res => res.json())
            .then(data => {
                this.sessionId = data.session_id;
                this.isRunning = true;
                this.isPaused = false;
                this.gameStartTime = Date.now();

                document.getElementById('startGameBtn').disabled = true;
                document.getElementById('pauseGameBtn').disabled = false;
                document.getElementById('endGameBtn').disabled = false;

                this.gameLoop();
            });
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseGameBtn').textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    selectTower(towerId) {
        this.selectedTower = towerId;
        document.querySelectorAll('.tower-card').forEach(card => {
            card.style.borderColor = card.dataset.towerId === towerId ? '#667eea' : '#444';
        });
    }

    placeOnCanvas(e) {
        if (!this.isRunning || !this.selectedTower || this.isPaused) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const towerCost = 100; // Simplified
        if (this.playerGold >= towerCost) {
            this.towers.push({ x, y, radius: 20 });
            this.playerGold -= towerCost;
            this.updateUI();
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
        // Spawn enemies
        if (Math.random() < 0.02) {
            this.enemies.push({ x: -20, y: 50 + Math.random() * 500, radius: 10 });
        }

        // Move enemies
        this.enemies.forEach((enemy, idx) => {
            enemy.x += 2;
            if (enemy.x > this.canvas.width) {
                this.enemies.splice(idx, 1);
                this.playerLives--;
                if (this.playerLives <= 0) this.endGame();
            }
        });

        // Tower shooting
        this.towers.forEach(tower => {
            this.enemies.forEach((enemy, idx) => {
                const dist = Math.hypot(tower.x - enemy.x, tower.y - enemy.y);
                if (dist < 100) {
                    this.projectiles.push({ x: tower.x, y: tower.y, tx: enemy.x, ty: enemy.y });
                    this.enemies.splice(idx, 1);
                    this.score += 10;
                    this.playerGold += 50;
                }
            });
        });

        this.updateUI();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw towers
        this.ctx.fillStyle = '#667eea';
        this.towers.forEach(tower => {
            this.ctx.beginPath();
            this.ctx.arc(tower.x, tower.y, tower.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw enemies
        this.ctx.fillStyle = '#ff6b6b';
        this.enemies.forEach(enemy => {
            this.ctx.beginPath();
            this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw projectiles
        this.ctx.fillStyle = '#ffd700';
        this.projectiles.forEach((proj, idx) => {
            this.ctx.beginPath();
            this.ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    updateUI() {
        document.getElementById('playerGold').textContent = this.playerGold;
        document.getElementById('playerLives').textContent = this.playerLives;
        document.getElementById('currentWave').textContent = this.currentWave;
        document.getElementById('scoreDisplay').textContent = `Score: ${this.score}`;
    }

    endGame() {
        this.isRunning = false;
        document.getElementById('startGameBtn').disabled = false;
        document.getElementById('pauseGameBtn').disabled = true;
        document.getElementById('endGameBtn').disabled = true;

        const formData = new FormData();
        formData.append('session_id', this.sessionId);
        formData.append('final_score', this.score);
        formData.append('level_reached', this.currentWave);

        fetch('{% url "end_game" %}', { method: 'POST', body: formData })
            .then(res => res.json())
            .then(data => alert(`Game Over! Final Score: ${this.score}`));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TowerDefenseGame();
});
