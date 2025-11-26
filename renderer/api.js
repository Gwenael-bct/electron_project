const { ipcRenderer } = require("electron");

// Player

async function loadPlayer() {
  try {
    return await ipcRenderer.invoke("player:load");
  } catch (err) {
    console.error("Erreur IPC player:load :", err);
    return null;
  }
}

async function savePlayer(player) {
  try {
    await ipcRenderer.invoke("player:save", player);
  } catch (err) {
    console.error("Erreur IPC player:save :", err);
  }
}

async function resetPlayer() {
  try {
    await ipcRenderer.invoke("player:reset");
  } catch (err) {
    console.error("Erreur IPC player:reset :", err);
  }
}

// Game (player + levels + ships)

async function loadGameData() {
  try {
    return await ipcRenderer.invoke("game:load");
  } catch (err) {
    console.error("Erreur IPC game:load :", err);
    return null;
  }
}

module.exports = {
  loadPlayer,
  savePlayer,
  resetPlayer,
  loadGameData,
};
