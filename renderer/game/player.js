class Player {
  constructor(stats, canvasWidth, canvasHeight, sprite) {
    this.width = 60;
    this.height = 60;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - this.height - 10;
    this.speed = stats.moveSpeed || 350;

    this.maxLife = stats.life;
    this.life = stats.life;

    this.attack = stats.attack;
    this.attackSpeed = stats.attackSpeed;
    this.gold = stats.gold;
    this.level = stats.level;
    this.userName = stats.userName;
    this.currentShipId = stats.currentShipId;
    this.unlockedShips = stats.unlockedShips;
    this.currentMissilePattern = stats.currentMissilePattern;
    this.missilePatterns = stats.missilePatterns;

    this.sprite = sprite || null;
  }

  draw(ctx) {
    if (this.sprite) {
      ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = "#03a9f4";
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
}

module.exports = { Player };
