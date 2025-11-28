const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const {
  loadGameData,
  saveGameData,
  resetGameData,
  createDefaultGameDataIfMissing,
} = require("./src/dataManager");

function createWindow() {
  const mainWindow = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile("renderer/index.html");
}

function getUserDataPath() {
  return app.getPath("userData");
}

/* ---------- IPC : API appelée depuis le renderer ---------- */

ipcMain.handle("player:load", () => {
  const data = loadGameData(getUserDataPath());
  if (!data) return null;
  return data.player ?? null;
});

ipcMain.handle("player:save", (event, player) => {
  const existing = loadGameData(getUserDataPath()) || {};

  const dataToSave = {
    levels: existing.levels || [],
    ships: existing.ships || [],
    player,
  };

  saveGameData(getUserDataPath(), dataToSave);
  return true;
});

ipcMain.handle("player:reset", () => {
  resetGameData(getUserDataPath());
  // On recrée un fichier par défaut vide de player mais avec levels/ships
  createDefaultGameDataIfMissing(getUserDataPath());
  return true;
});

// Nouvelle API pour récupérer toutes les données de jeu (player + levels + ships)
ipcMain.handle("game:load", () => {
  const data = loadGameData(getUserDataPath());
  if (!data) {
    // si jamais rien, on force la création
    createDefaultGameDataIfMissing(getUserDataPath());
    return loadGameData(getUserDataPath());
  }
  return data;
});

/* ---------- Lancement de l'application ---------- */
app.whenReady().then(() => {
  createDefaultGameDataIfMissing(getUserDataPath());
  createWindow();
});
