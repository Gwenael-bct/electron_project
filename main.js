const { app, BrowserWindow, ipcMain } = require('electron');
const path = require("path");
const fs = require("fs");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("renderer/index.html");
}

/**
 * Chemin du fichier de sauvegarde JSON.
 */
function getSaveFilePath() {
  const filePath = path.join(app.getPath("userData"), "playerData.json");
  console.log("Chemin du fichier de sauvegarde :", filePath);
  return filePath;
}

/**
 * Charge les données complètes depuis le JSON.
 */
function loadGameData() {
  const filePath = getSaveFilePath();

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Erreur de lecture playerData.json :", err);
    return null;
  }
}

/**
 * Sauvegarde les données de jeu complètes dans le JSON.
 */
function saveGameData(data) {
  const filePath = getSaveFilePath();

  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Erreur d'écriture playerData.json :", err);
  }
}

/**
 * Supprime le fichier de sauvegarde (reset complet).
 */
function resetGameData() {
  const filePath = getSaveFilePath();

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Erreur lors de la suppression playerData.json :", err);
  }
}

ipcMain.handle("player:load", () => {
  const data = loadGameData();
  if (!data) return null;
  return data.player ?? null;
});

ipcMain.handle("player:save", (event, player) => {
  const existing = loadGameData() || {};

  const dataToSave = {
    // on garde levels / ships si déjà présents
    levels: existing.levels || [],
    ships: existing.ships || [],
    player,
  };

  saveGameData(dataToSave);

  return true;
});

ipcMain.handle("player:reset", () => {
  resetGameData();
  return true;
});

// initialisation d'un JSON par défaut (levels / ships)
function createDefaultGameDataIfMissing() {
  const defaultLevels = [
    { id: 1, asteroidCount: 10 },
    { id: 2, asteroidCount: 20 },
    { id: 3, asteroidCount: 30 },
  ];

  const defaultShips = [
    {
      id: 1,
      name: "Starling MK1",
      spritePath: "assets/space_sheep_1.png",
      attack: 1,
      fireRate: 1,
      price: 0,
    },
    {
      id: 2,
      name: "Falcon X",
      spritePath: "assets/space_sheep_2.png",
      attack: 2,
      fireRate: 1.2,
      price: 300,
    },
  ];

  const existing = loadGameData();

  // Aucun fichier => on crée tout
  if (!existing) {
    const data = {
      player: null,
      levels: defaultLevels,
      ships: defaultShips,
    };
    saveGameData(data);
    return;
  }

  // Fichier déjà là mais incomplet => on complète
  let changed = false;

  if (!existing.levels || !Array.isArray(existing.levels)) {
    existing.levels = defaultLevels;
    changed = true;
  }

  if (!existing.ships || !Array.isArray(existing.ships)) {
    existing.ships = defaultShips;
    changed = true;
  }

  if (changed) {
    saveGameData(existing);
  }
}


app.whenReady().then(() => {
  createDefaultGameDataIfMissing();
  createWindow();
});
