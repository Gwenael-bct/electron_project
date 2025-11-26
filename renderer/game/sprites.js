function resolveAssetPath(spritePath) {
  if (!spritePath) return null;

  if (spritePath.startsWith("assets/")) {
    return `../../${spritePath}`;
  }

  return spritePath;
}

function loadImage(path) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = path;
  });
}

async function loadSprites(gameData) {
  const { player, ships } = gameData;

  let playerSprite = null;
  if (player && Array.isArray(ships)) {
    const currentShip = ships.find((s) => s.id === player.currentShipId);
    if (currentShip && currentShip.spritePath) {
      const path = resolveAssetPath(currentShip.spritePath);
      try {
        playerSprite = await loadImage(path);
      } catch (err) {
        console.error("Erreur chargement sprite joueur :", err);
      }
    }
  }

  let asteroidSprite = null;
  try {
    asteroidSprite = await loadImage("../../assets/asteroid.png");
  } catch (err) {
    console.error("Erreur chargement sprite astéroïde :", err);
  }

  return { playerSprite, asteroidSprite };
}

module.exports = { loadSprites };
