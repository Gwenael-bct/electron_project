const { ipcRenderer } = require("electron");

/**
 * Chargement du joueur via IPC (JSON côté main process).
 */
async function loadPlayer() {
  try {
    const player = await ipcRenderer.invoke("player:load");
    return player; // soit un objet, soit null
  } catch (err) {
    console.error("Erreur IPC player:load :", err);
    return null;
  }
}

/**
 * Sauvegarde du joueur via IPC.
 */
async function savePlayer(player) {
  try {
    await ipcRenderer.invoke("player:save", player);
  } catch (err) {
    console.error("Erreur IPC player:save :", err);
  }
}

/**
 * Reset des données joueur via IPC.
 */
async function resetPlayer() {
  try {
    await ipcRenderer.invoke("player:reset");
  } catch (err) {
    console.error("Erreur IPC player:reset :", err);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const newPlayerSection = document.getElementById("new-player-section");
  const existingPlayerSection = document.getElementById(
    "existing-player-section"
  );

  const usernameInput = document.getElementById("username-input");
  const playButtonNew = document.getElementById("play-button-new");
  const playButtonExisting = document.getElementById("play-button-existing");
  const welcomeText = document.getElementById("welcome-text");
  const resetButton = document.getElementById("reset-player");

  // On regarde s'il existe déjà un joueur dans le JSON
  const existingPlayer = await loadPlayer();

  if (existingPlayer) {
    // On affiche la section "joueur existant"
    newPlayerSection.classList.add("hidden");
    existingPlayerSection.classList.remove("hidden");

    welcomeText.textContent = `Bienvenue ${existingPlayer.userName} !`;
  } else {
    // On affiche la section "nouveau joueur"
    existingPlayerSection.classList.add("hidden");
    newPlayerSection.classList.remove("hidden");
  }

  // Gestion de l'input pseudo : tant que vide → bouton désactivé
  usernameInput.addEventListener("input", () => {
    const value = usernameInput.value.trim();
    playButtonNew.disabled = value.length === 0;
  });

  // Création d'un nouveau joueur quand on clique sur "Jouer"
  playButtonNew.addEventListener("click", async () => {
    const userName = usernameInput.value.trim();
    if (!userName) return;

    const newPlayer = {
      userName,
      level: 1,
      attack: 1,
      attackSpeed: 1,
      life: 3,
      gold: 0,
      currentShipId: 1,
      unlockedShips: [1],
    };

    await savePlayer(newPlayer);

    alert(
      `Bienvenue ${userName} ! (prochainement : écran de sélection des niveaux)`
    );

    // On recharge juste la page pour repasser dans la branche "joueur existant"
    window.location.reload();
  });

  // Bouton "Continuer" pour un joueur existant
  playButtonExisting.addEventListener("click", async () => {
    const player = await loadPlayer();
    if (!player) return;

    alert(
      `On continue avec ${player.userName} (Niveau ${player.level}) – prochainement : écran de sélection des niveaux.`
    );
    // TODO: ici on ira vers le menu des niveaux
  });

  // Permet de "changer de joueur"
  resetButton.addEventListener("click", async () => {
    await resetPlayer();
    window.location.reload();
  });
});
