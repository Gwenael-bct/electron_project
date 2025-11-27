class Bullet {
  constructor(x, y, velocityX = 0, velocityY = -400) {
    this.x = x;
    this.y = y;
    this.radius = 3;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.damage = 1;
    this.isAlive = true;
  }

  update(dt) {
    this.x += this.velocityX * dt;
    this.y += this.velocityY * dt;

    // Despawn si hors écran (marge de 50px)
    if (this.y < -50 || this.y > 2000 || this.x < -50 || this.x > 2000) {
      this.isAlive = false;
    }
  }

  draw(ctx) {
    ctx.fillStyle = "#ff0000ff";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

module.exports = { Bullet };
