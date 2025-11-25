const { app, BrowserWindow, ipcMain } = require("electron");
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
  const filePath = path.join(__dirname, "playerData.json");
  console.log("Chemin du fichier de sauvegarde :", filePath);
  return filePath;
}

/**
 * Lecture des données complètes de jeu.
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
 * Écriture des données complètes de jeu.
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
 * Suppression des données (reset complet).
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

/**
 * Initialise les données par défaut si le fichier est absent ou incomplet.
 */
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
    {
      id: 3,
      name: "Eagle Pro",
      spritePath: "assets/space_sheep_3.png",
      attack: 4,
      fireRate: 1.5,
      price: 600,
    },
  ];

  const existing = loadGameData();

  if (!existing) {
    const data = {
      player: null,
      levels: defaultLevels,
      ships: defaultShips,
    };
    saveGameData(data);
    return;
  }

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

/* ---------- IPC : API appelée depuis le renderer ---------- */

ipcMain.handle("player:load", () => {
  const data = loadGameData();
  if (!data) return null;
  return data.player ?? null;
});

ipcMain.handle("player:save", (event, player) => {
  const existing = loadGameData() || {};

  const dataToSave = {
    levels: existing.levels || [],
    ships: existing.ships || [],
    player,
  };

  saveGameData(dataToSave);
  return true;
});

ipcMain.handle("player:reset", () => {
  resetGameData();
  // On recrée un fichier par défaut vide de player mais avec levels/ships
  createDefaultGameDataIfMissing();
  return true;
});

// Nouvelle API pour récupérer toutes les données de jeu (player + levels + ships)
ipcMain.handle("game:load", () => {
  const data = loadGameData();
  if (!data) {
    // si jamais rien, on force la création
    createDefaultGameDataIfMissing();
    return loadGameData();
  }
  return data;
});

/* ---------- Lancement de l'application ---------- */
app.whenReady().then(() => {
  createDefaultGameDataIfMissing();
  createWindow();
});
