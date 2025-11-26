class Asteroid {
  constructor(x, y, levelId, sprite) {
    this.x = x;
    this.y = y;

    // taille random
    this.radius = 16 + Math.random() * 24;

    // vitesse globale
    const baseSpeed = 100 + Math.random() * 100;

    // angle autour de "vers le bas" (PI/2), ±45°
    const angleSpread = Math.PI / 10;
    const angle = Math.PI / 2 + (Math.random() - 0.5) * 2 * angleSpread;

    this.vx = Math.cos(angle) * baseSpeed;
    this.vy = Math.sin(angle) * baseSpeed;

    this.maxHp = levelId * 1;
    this.hp = this.maxHp;
    this.isAlive = true;

    this.sprite = sprite || null;
  }

  update(dt, canvasWidth, canvasHeight) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;

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
