class Asteroid {
  constructor(x, y, levelId, sprite, options = {}) {
    this.x = x;
    this.y = y;

    // taille configurable (boss minions plus gros ou plus petits)
    this.radius = options.radius ?? 16 + Math.random() * 24;

    // vitesse globale
    const baseSpeed = options.baseSpeed ?? 100 + Math.random() * 100;

    // angle autour de "vers le bas" (PI/2), ±45°
    const angleSpread = Math.PI / 10;
    const angle =
      options.angle ??
      (Math.PI / 2 + (Math.random() - 0.5) * 2 * angleSpread);

    if (options.velocity) {
      this.vx = options.velocity.x;
      this.vy = options.velocity.y;
    } else {
      this.vx = Math.cos(angle) * baseSpeed;
      this.vy = Math.sin(angle) * baseSpeed;
    }

    this.maxHp = options.hp ?? levelId * 1;
    this.hp = this.maxHp;
    this.isAlive = true;
    this.isBouncy = Boolean(options.bouncy);

    this.sprite = sprite || null;
  }

  update(dt, canvasWidth, canvasHeight) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.isBouncy) {
      if (this.x - this.radius < 0 && this.vx < 0) {
        this.x = this.radius;
        this.vx = -this.vx;
      } else if (this.x + this.radius > canvasWidth && this.vx > 0) {
        this.x = canvasWidth - this.radius;
        this.vx = -this.vx;
      }
    }

    // sorti de l'écran => on supprime
    if (
      this.y - this.radius > canvasHeight + 40 ||
      this.x + this.radius < -40 ||
      this.x - this.radius > canvasWidth + 40
    ) {
      this.isAlive = false;
    }
  }

  draw(ctx) {
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
      ctx.fillStyle = "#9e9e9e";
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // barre de vie
    const barWidth = this.radius * 2;
    const barHeight = 4;
    const hpRatio = this.hp / this.maxHp;
    ctx.fillStyle = "#000";
    ctx.fillRect(
      this.x - this.radius,
      this.y - this.radius - 8,
      barWidth,
      barHeight
    );
    ctx.fillStyle = "#4caf50";
    ctx.fillRect(
      this.x - this.radius,
      this.y - this.radius - 8,
      barWidth * hpRatio,
      barHeight
    );
  }
}

module.exports = { Asteroid };
