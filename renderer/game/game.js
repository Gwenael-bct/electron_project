const { loadGameData, savePlayer } = require("../api");
const { Player } = require("./player");
const { Bullet } = require("./bullet");
const { Asteroid } = require("./asteroid");
const { Boss } = require("./boss");
const { loadSprites } = require("./sprites");

class Game {
  constructor(ctx, canvas, playerData, levelData, sprites, onEnd) {
    this.ctx = ctx;
    this.canvas = canvas;

    // sprites joueur + astéroïdes
    this.sprites = sprites;

    // le Player accepte le sprite du vaisseau courant
    this.player = new Player(
      playerData,
      canvas.width,
      canvas.height,
      this.sprites.playerSprite
    );

    this.level = levelData;
    this.onEnd = onEnd;

    this.bullets = [];
    this.asteroids = [];
    this.hasBoss = Boolean(levelData.boss);
    this.boss = this.hasBoss
      ? new Boss(levelData, canvas.width, canvas.height, this.sprites.asteroidSprite)
      : null;

    // Nouveau système : temps
    this.timeElapsed = 0;
    this.duration = levelData.duration;

    this.lastTime = 0;
    this.isRunning = true;
    this.isGameOver = false;

    this.keys = { left: false, right: false };
    this.shootCooldown = 0;

    this.minSpawnInterval = levelData.spawnMinInterval;
    this.maxSpawnInterval = levelData.spawnMaxInterval;
    this.minAsteroids = levelData.minAsteroids;
    this.maxAsteroids = levelData.maxAsteroids;

    this.spawnTimer = 0;
    this.nextSpawnIn = this.randomSpawnInterval();

    // cache des éléments du HUD + flag
    this.hudPlayerEl = document.getElementById("hud-player");
    this.hudLevelEl = document.getElementById("hud-level");
    this.hudLifeEl = document.getElementById("hud-life");
    this.hudAsteroidsEl = document.getElementById("hud-asteroids");
    this.hudDirty = true;
    this.lastHudTime = -1;

    this.updateHud();
    this.initControls();
  }

  randomSpawnInterval() {
    return (
      this.minSpawnInterval +
      Math.random() * (this.maxSpawnInterval - this.minSpawnInterval)
    );
  }

  initControls() {
    window.addEventListener("keydown", (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        this.keys.left = true;
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        this.keys.right = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        this.keys.left = false;
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        this.keys.right = false;
      }
    });
  }

  updateHud() {
    if (!this.hudPlayerEl) return;

    this.hudPlayerEl.textContent = `${this.player.userName}`;
    this.hudLevelEl.textContent = `Niveau ${this.level.id}`;
    this.hudLifeEl.textContent = `PV: ${this.player.life}`;

    if (this.boss && this.boss.isAlive) {
      const hpPercent = Math.max(
        0,
        Math.round((this.boss.hp / this.boss.maxHp) * 100)
      );
      this.hudAsteroidsEl.textContent = `Boss: ${hpPercent}%`;
    } else {
      const remainingTime = Math.max(
        0,
        Math.ceil(this.duration - this.timeElapsed)
      );
      this.hudAsteroidsEl.textContent = `Temps restant: ${remainingTime}s`;
    }
  }

  spawnAsteroidBatch() {
    if (this.boss && this.boss.isAlive) return;
    // Nombre aléatoire d'astéroïdes à spawn
    const count = Math.floor(
      this.minAsteroids + Math.random() * (this.maxAsteroids - this.minAsteroids + 1)
    );

    for (let i = 0; i < count; i++) {
      this.spawnSingleAsteroid();
    }
  }

  spawnSingleAsteroid() {
    const margin = 20;
    const x =
      margin + Math.random() * (this.canvas.width - margin * 2);
    const y = -20 - Math.random() * 50; // léger décalage vertical

    const asteroid = new Asteroid(
      x,
      y,
      this.level.id,
      this.sprites.asteroidSprite
    );
    this.asteroids.push(asteroid);
    this.hudDirty = true;
  }

  getMissilePattern(patternId) {
    // Configuration des patterns
    // velocityY = -400 (base speed)
    const baseSpeed = -400;

    switch (patternId) {
      case 2: // Double Shot
        return [
          { offsetX: -15, velocityX: 0, velocityY: baseSpeed },
          { offsetX: 15, velocityX: 0, velocityY: baseSpeed }
        ];
      case 3: // Triple Shot
        return [
          { offsetX: -20, velocityX: 0, velocityY: baseSpeed },
          { offsetX: 0, velocityX: 0, velocityY: baseSpeed },
          { offsetX: 20, velocityX: 0, velocityY: baseSpeed }
        ];
      case 4: // Side Shot
        return [
          { offsetX: 0, velocityX: 0, velocityY: baseSpeed },
          { offsetX: -20, velocityX: -150, velocityY: baseSpeed * 0.9 },
          { offsetX: 20, velocityX: 150, velocityY: baseSpeed * 0.9 }
        ];
      case 5: // Spread Shot
        return [
          { offsetX: 0, velocityX: 0, velocityY: baseSpeed },
          { offsetX: -10, velocityX: -100, velocityY: baseSpeed * 0.95 },
          { offsetX: 10, velocityX: 100, velocityY: baseSpeed * 0.95 },
          { offsetX: -20, velocityX: -200, velocityY: baseSpeed * 0.9 },
          { offsetX: 20, velocityX: 200, velocityY: baseSpeed * 0.9 }
        ];
      case 1: // Default Single
      default:
        return [
          { offsetX: 0, velocityX: 0, velocityY: baseSpeed }
        ];
    }
  }

  shoot(dt) {
    const rate = Math.max(this.player.attackSpeed, 0.1);
    const delay = 1 / rate;

    this.shootCooldown -= dt;
    if (this.shootCooldown <= 0) {
      const centerX = this.player.x + this.player.width / 2;
      const centerY = this.player.y;

      // Récupérer le pattern actuel (1 par défaut)
      const patternId = this.player.currentMissilePattern || 1;
      const pattern = this.getMissilePattern(patternId);

      pattern.forEach(config => {
        this.bullets.push(new Bullet(
          centerX + config.offsetX,
          centerY,
          config.velocityX,
          config.velocityY
        ));
      });

      this.shootCooldown = delay;
    }
  }

  handleCollisions() {
    // bullets vs asteroids
    for (const bullet of this.bullets) {
      if (!bullet.isAlive) continue;

      let bulletConsumed = false;

      if (this.boss && this.boss.isAlive) {
        const dx = bullet.x - this.boss.x;
        const dy = bullet.y - this.boss.y;
        const distSq = dx * dx + dy * dy;
        const radii = this.boss.radius + bullet.radius;

        if (distSq < radii * radii) {
          bullet.isAlive = false;
          const retaliation = this.boss.takeDamage(
            this.player.attack,
            this.sprites.asteroidSprite
          );
          retaliation.forEach((minion) => this.asteroids.push(minion));
          this.hudDirty = true;

          if (!this.boss.isAlive) {
            this.player.gold += this.level.goldReward || this.level.id * 150;
            this.endGame(true);
            return;
          }

          bulletConsumed = true;
        }
      }

      if (bulletConsumed) continue;

      for (const asteroid of this.asteroids) {
        if (!asteroid.isAlive) continue;

        const dx = bullet.x - asteroid.x;
        const dy = bullet.y - asteroid.y;
        const distSq = dx * dx + dy * dy;
        const radii = asteroid.radius + bullet.radius;

        if (distSq < radii * radii) {
          bullet.isAlive = false;
          asteroid.hp -= this.player.attack;

          if (asteroid.hp <= 0) {
            asteroid.isAlive = false;
            this.player.gold += this.level.id * 5;
            this.hudDirty = true;
          }

          break;
        }
      }
    }

    // asteroids vs player : dégâts = 1 * id_niveau
    for (const asteroid of this.asteroids) {
      if (!asteroid.isAlive) continue;

      const closestX = Math.max(
        this.player.x,
        Math.min(asteroid.x, this.player.x + this.player.width)
      );
      const closestY = Math.max(
        this.player.y,
        Math.min(asteroid.y, this.player.y + this.player.height)
      );

      const dx = asteroid.x - closestX;
      const dy = asteroid.y - closestY;
      const distSq = dx * dx + dy * dy;

      if (distSq < asteroid.radius * asteroid.radius) {
        const damage = this.level.id * 1;
        this.player.life -= damage;
        asteroid.isAlive = false;
        this.hudDirty = true;

        if (this.player.life <= 0) {
          this.player.life = 0;
          this.endGame(false);
          return;
        }
      }
    }
  }

  endGame(victory) {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.isRunning = false;
    this.hudDirty = true;
    this.updateHud();
    this.onEnd(victory, this.player, this.level);
  }

  update(dt) {
    if (!this.isRunning) return;

    // déplacement joueur
    if (this.keys.left) {
      this.player.x -= this.player.speed * dt;
    }
    if (this.keys.right) {
      this.player.x += this.player.speed * dt;
    }

    this.player.x = Math.max(
      0,
      Math.min(this.canvas.width - this.player.width, this.player.x)
    );

    if (this.boss && this.boss.isAlive) {
      this.boss.update(dt);
      if (this.boss.y - this.boss.radius > this.canvas.height) {
        this.endGame(false);
        return;
      }
    } else {
      // spawn d'astéroïdes
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.nextSpawnIn) {
        this.spawnAsteroidBatch();
        this.spawnTimer = 0;
        this.nextSpawnIn = this.randomSpawnInterval();
      }
    }

    // mise à jour astéroïdes (trajectoires diagonales / linéaires)
    this.asteroids.forEach((a) =>
      a.update(dt, this.canvas.width, this.canvas.height)
    );
    this.asteroids = this.asteroids.filter((a) => a.isAlive);

    // tirs
    this.shoot(dt);

    // mise à jour bullets
    this.bullets.forEach((b) => b.update(dt));
    this.bullets = this.bullets.filter((b) => b.isAlive);

    // collisions
    this.handleCollisions();
    if (this.isGameOver) return;

    if (!this.boss) {
      // condition de victoire : temps écoulé
      this.timeElapsed += dt;
      if (this.timeElapsed >= this.level.duration) {
        this.endGame(true);
      }
    }

    // HUD lazy
    if (this.hudDirty || Math.floor(this.timeElapsed) !== this.lastHudTime) {
      this.lastHudTime = Math.floor(this.timeElapsed);
      this.updateHud();
      this.hudDirty = false;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.player.draw(ctx);
    if (this.boss && this.boss.isAlive) {
      this.boss.draw(ctx);
    }
    this.bullets.forEach((b) => b.draw(ctx));
    this.asteroids.forEach((a) => a.draw(ctx));
  }

  start() {
    const loop = (timestamp) => {
      if (!this.lastTime) this.lastTime = timestamp;
      const dt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;

      this.update(dt);
      this.draw();

      if (this.isRunning) {
        requestAnimationFrame(loop);
      }
    };

    requestAnimationFrame(loop);
  }
}

/* --------- bootstrap de la page game.html --------- */

function parseLevelIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const levelString = params.get("level");
  const levelId = parseInt(levelString, 10);
  return Number.isNaN(levelId) ? null : levelId;
}

document.addEventListener("DOMContentLoaded", async () => {
  const canvas = document.getElementById("game-canvas");
  const endScreen = document.getElementById("end-screen");
  const endTitle = document.getElementById("end-title");
  const endDetails = document.getElementById("end-details");
  const endBackLevels = document.getElementById("end-back-levels");
  const endRetry = document.getElementById("end-retry");
  const hudExitButton = document.getElementById("hud-exit");

  const rect = canvas.getBoundingClientRect();
  const scale = 0.8;
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;

  const ctx = canvas.getContext("2d");

  const levelId = parseLevelIdFromUrl();
  if (!levelId) {
    window.location.href = "../levels/levels.html";
    return;
  }

  const gameData = await loadGameData();
  if (!gameData || !gameData.player) {
    window.location.href = "index.html";
    return;
  }

  const baseLifeFromJson = gameData.player.life;

  const level = gameData.levels.find((l) => l.id === levelId);
  if (!level) {
    window.location.href = "../levels/levels.html";
    return;
  }

  const sprites = await loadSprites(gameData);

  const currentShip = gameData.ships.find(
    (s) => s.id === gameData.player.currentShipId
  );

  // Calcul des stats effectives (Base + Vaisseau)
  const effectivePlayerStats = {
    ...gameData.player,
    attack: gameData.player.attack + (currentShip ? currentShip.attack : 0),
    attackSpeed:
      gameData.player.attackSpeed + (currentShip ? currentShip.fireRate : 0),
    life: baseLifeFromJson,
    moveSpeed: gameData.player.moveSpeed || 350,
  };

  const onEnd = async (victory, player, currentLevel) => {
    if (victory) {
      const newLevelValue = Math.max(player.level, currentLevel.id + 1);
      const rewardGold = currentLevel.goldReward || (currentLevel.id * 100);

      const updatedPlayer = {
        userName: player.userName,
        level: newLevelValue,
        // On garde les stats de base pour la sauvegarde, pas les stats boostées
        attack: gameData.player.attack,
        attackSpeed: gameData.player.attackSpeed,
        life: baseLifeFromJson, // PV max conservés
        moveSpeed: gameData.player.moveSpeed || 350,
        gold: player.gold + rewardGold,
        currentShipId: player.currentShipId,
        unlockedShips: player.unlockedShips,
        // Préserver les compteurs d'améliorations
        healthUpgrades: gameData.player.healthUpgrades || 0,
        attackUpgrades: gameData.player.attackUpgrades || 0,
        attackSpeedUpgrades: gameData.player.attackSpeedUpgrades || 0,
        moveSpeedUpgrades: gameData.player.moveSpeedUpgrades || 0,
        // Préserver les patterns de missiles
        missilePatterns: gameData.player.missilePatterns || [1],
        currentMissilePattern: gameData.player.currentMissilePattern || 1,
      };

      await savePlayer(updatedPlayer);

      endTitle.textContent = "Victoire !";
      endDetails.textContent = `Tu as survécu au niveau ${currentLevel.id} et gagné ${rewardGold} gold.`;
    } else {
      endTitle.textContent = "Défaite...";
      endDetails.textContent = `Tu as été détruit au niveau ${currentLevel.id}.`;

      const updatedPlayer = {
        ...gameData.player,
        life: baseLifeFromJson,
        // S'assurer que moveSpeed est préservé
        moveSpeed: gameData.player.moveSpeed || 350,
      };
      await savePlayer(updatedPlayer);
    }

    endScreen.classList.remove("hidden");
  };

  const game = new Game(
    ctx,
    canvas,
    effectivePlayerStats,
    level,
    sprites,
    onEnd
  );
  game.start();

  if (hudExitButton) {
    hudExitButton.addEventListener("click", () => {
      game.isRunning = false;
      game.isGameOver = true;
      window.location.href = "../levels/levels.html";
    });
  }

  endBackLevels.addEventListener("click", () => {
    window.location.href = "../levels/levels.html";
  });

  endRetry.addEventListener("click", () => {
    window.location.reload();
  });
});
