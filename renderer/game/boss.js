const { Asteroid } = require("./asteroid");

class Boss {
  constructor(levelData, canvasWidth, canvasHeight, sprite) {
    this.level = levelData;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.sprite = sprite;

    this.radius = Math.min(canvasWidth, canvasHeight) * 0.15;
    this.x = canvasWidth / 2;
    this.y = -this.radius * 1.5;

    this.speed = Math.max(20, canvasHeight * 0.4);
    this.horizontalPhase = 0;

    this.maxHp = Math.max(400, (levelData.id || 1) * 300);
    this.hp = this.maxHp;
    this.isAlive = true;
  }

  update(dt) {
    if (!this.isAlive) return;

    this.horizontalPhase += dt * 0.5;
    const sway = Math.sin(this.horizontalPhase) * 40;
    this.x = (this.canvasWidth / 2) + sway;

    if (this.y < this.canvasHeight * 0.25) {
      this.y += this.speed * dt * 0.2;
    }
  }

  takeDamage(amount, asteroidSprite) {
    if (!this.isAlive) return [];

    this.hp -= amount;
    const retaliation = this.releaseAsteroids(asteroidSprite);

    if (this.hp <= 0) {
      this.hp = 0;
      this.isAlive = false;
    }

    return retaliation;
  }

  releaseAsteroids(sprite) {
    const spawned = [];
    const count = 1 + Math.floor(Math.random() * 2);

    for (let i = 0; i < count; i++) {
      const vx = (Math.random() - 0.5) * 260;
      const vy = 120 + Math.random() * 60;
      const offsetX = (Math.random() - 0.5) * this.radius * 0.6;

      spawned.push(
        new Asteroid(
          this.x + offsetX,
          this.y + this.radius,
          this.level.id,
          sprite,
          {
            radius: 18 + Math.random() * 10,
            velocity: { x: vx, y: vy },
            bouncy: true,
            hp: Math.ceil(this.level.id * 0.75),
          }
        )
      );
    }

    return spawned;
  }

  draw(ctx) {
    if (!this.isAlive) return;

    const size = this.radius * 2;
    if (this.sprite) {
      ctx.drawImage(
        this.sprite,
        this.x - this.radius,
        this.y - this.radius,
        size,
        size
      );
    } else {
      ctx.fillStyle = "#5d4037";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ff5252";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    // health bar
    const hpRatio = this.hp / this.maxHp;
    const barWidth = size;
    const barHeight = 12;

    ctx.fillStyle = "#000";
    ctx.fillRect(
      this.x - this.radius,
      this.y - this.radius - 24,
      barWidth,
      barHeight
    );

    ctx.fillStyle = "#ef4444";
    ctx.fillRect(
      this.x - this.radius,
      this.y - this.radius - 24,
      barWidth * hpRatio,
      barHeight
    );

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.x - this.radius,
      this.y - this.radius - 24,
      barWidth,
      barHeight
    );
  }
}

module.exports = { Boss };