const { Bullet } = require("../renderer/game/bullet");

test("Bullet moves correctly on update", () => {
    const bullet = new Bullet(100, 100, 0, -400);
    const dt = 0.1;
    bullet.update(dt);
    // y should decrease by 400 * 0.1 = 40
    expect(bullet.y).toBeCloseTo(60);
    expect(bullet.x).toBe(100);
});

test("Bullet dies when out of bounds", () => {
    const bullet = new Bullet(100, -60, 0, -400); // Already out of bounds (y < -50)
    bullet.update(0.1);
    expect(bullet.isAlive).toBe(false);
});
