const { loadGameData, savePlayer } = require("../api");
const { Player } = require("./player");
const { Bullet } = require("./bullet");
const { Asteroid } = require("./asteroid");
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
    this.totalAsteroidsToSpawn = levelData.asteroidCount;
    this.spawnedAsteroids = 0;

    this.lastTime = 0;
    this.isRunning = true;
    this.isGameOver = false;

    this.keys = { left: false, right: false };
    this.shootCooldown = 0;

    this.minSpawnInterval = 0.4;
    this.maxSpawnInterval = 1.4;
    this.spawnTimer = 0;
    this.nextSpawnIn = this.randomSpawnInterval();

    // cache des éléments du HUD + flag
    this.hudPlayerEl = document.getElementById("hud-player");
    this.hudLevelEl = document.getElementById("hud-level");
    this.hudLifeEl = document.getElementById("hud-life");
    this.hudAsteroidsEl = document.getElementById("hud-asteroids");
    this.hudDirty = true;

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
    this.hudAsteroidsEl.textContent = `Astéroïdes restants: ${
      this.totalAsteroidsToSpawn - this.destroyedAsteroidsCount()
    }`;
  }

  destroyedAsteroidsCount() {
    // total - (ceux en jeu + ceux qui restent à spawn)
    return (
      this.totalAsteroidsToSpawn -
      (this.asteroids.length +
        (this.totalAsteroidsToSpawn - this.spawnedAsteroids))
    );
  }

  spawnAsteroid() {
    if (this.spawnedAsteroids >= this.totalAsteroidsToSpawn) return;

    const margin = 20;
    const x =
      margin + Math.random() * (this.canvas.width - margin * 2);
    const y = -20;

    const asteroid = new Asteroid(
      x,
      y,
      this.level.id,
      this.sprites.asteroidSprite
    );
    this.asteroids.push(asteroid);
    this.spawnedAsteroids += 1;
    this.hudDirty = true;
  }

  shoot(dt) {
    const rate = Math.max(this.player.attackSpeed, 0.1);
    const delay = 1 / rate;

    this.shootCooldown -= dt;
    if (this.shootCooldown <= 0) {
      const bulletX = this.player.x + this.player.width / 2;
      const bulletY = this.player.y;
      this.bullets.push(new Bullet(bulletX, bulletY));
      this.shootCooldown = delay;
    }
  }

  handleCollisions() {
    // bullets vs asteroids
    for (const bullet of this.bullets) {
      if (!bullet.isAlive) continue;

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

    // spawn d'astéroïdes
    this.spawnTimer += dt;
    if (
      this.spawnTimer >= this.nextSpawnIn &&
      this.spawnedAsteroids < this.totalAsteroidsToSpawn
    ) {
      this.spawnAsteroid();
      this.spawnTimer = 0;
      this.nextSpawnIn = this.randomSpawnInterval();
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

    // condition de victoire : tout a été spawn + plus aucun en jeu
    if (
      this.spawnedAsteroids >= this.totalAsteroidsToSpawn &&
      this.asteroids.length === 0
    ) {
      this.endGame(true);
    }

    // HUD lazy
    if (this.hudDirty) {
      this.updateHud();
      this.hudDirty = false;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.player.draw(ctx);
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

  const rect = canvas.getBoundingClientRect();
  const scale = 0.8; // résolution interne un peu réduite pour éviter le lag
  canvas.width = rect.width * scale;
  canvas.height = rect.height * scale;

  const ctx = canvas.getContext("2d");

  const levelId = parseLevelIdFromUrl();
  if (!levelId) {
    window.location.href = "../level/levels.html";
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
    window.location.href = "../level/levels.html";
    return;
  }

  const sprites = await loadSprites(gameData);

  const onEnd = async (victory, player, currentLevel) => {
    if (victory) {
      const newLevelValue = Math.max(player.level, currentLevel.id + 1);
      const rewardGold = currentLevel.id * 10;

      const updatedPlayer = {
        userName: player.userName,
        level: newLevelValue,
        attack: player.attack,
        attackSpeed: player.attackSpeed,
        life: baseLifeFromJson, // PV max conservés
        gold: player.gold + rewardGold,
        currentShipId: player.currentShipId,
        unlockedShips: player.unlockedShips,
      };

      await savePlayer(updatedPlayer);

      endTitle.textContent = "Victoire !";
      endDetails.textContent = `Tu as terminé le niveau ${currentLevel.id} et gagné ${rewardGold} gold.`;
    } else {
      endTitle.textContent = "Défaite...";
      endDetails.textContent = `Tu as été détruit au niveau ${currentLevel.id}.`;

      const updatedPlayer = {
        ...gameData.player,
        life: baseLifeFromJson,
      };
      await savePlayer(updatedPlayer);
    }

    endScreen.classList.remove("hidden");
  };

  const game = new Game(
    ctx,
    canvas,
    gameData.player,
    level,
    sprites,
    onEnd
  );
  game.start();

  endBackLevels.addEventListener("click", () => {
    window.location.href = "../level/levels.html";
  });

  endRetry.addEventListener("click", () => {
    window.location.reload();
  });
});
