const { loadPlayer, savePlayer, resetPlayer } = require("./api");

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

  // On regarde s'il existe déjà un joueur
  const existingPlayer = await loadPlayer();

  if (existingPlayer) {
    newPlayerSection.classList.add("hidden");
    existingPlayerSection.classList.remove("hidden");

    welcomeText.textContent = `Bienvenue de nouveau, ${existingPlayer.userName} !`;
  } else {
    existingPlayerSection.classList.add("hidden");
    newPlayerSection.classList.remove("hidden");
  }

  // Input pseudo => active/désactive le bouton
  usernameInput.addEventListener("input", () => {
    const value = usernameInput.value.trim();
    playButtonNew.disabled = value.length === 0;
  });

  // Création d'un nouveau joueur
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

    // On enchaîne vers l'écran des niveaux
    window.location.href = "levels/levels.html";
  });

  // Continuer avec le joueur existant
  playButtonExisting.addEventListener("click", async () => {
    const player = await loadPlayer();
    if (!player) {
      // sécurité : si pas de joueur, on retourne à l'écran d'accueil "nouveau joueur"
      window.location.href = "index.html";
      return;
    }

    window.location.href = "levels/levels.html";
  });

  // Changer de joueur
  resetButton.addEventListener("click", async () => {
    await resetPlayer();
    window.location.reload();
  });
});
