class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 3;
    this.speed = 400;
    this.damage = 1;
    this.isAlive = true;
  }

  update(dt) {
    this.y -= this.speed * dt;
    if (this.y < -10) {
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
