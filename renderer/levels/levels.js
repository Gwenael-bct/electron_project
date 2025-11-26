const { loadGameData } = require("../api");

function createLevelCard(level, player) {
  const isUnlocked = level.id <= player.level;

  const card = document.createElement("div");
  card.className =
    "bg-black/60 border border-white/20 rounded-lg px-4 py-3 flex flex-col gap-2 text-white";

  const title = document.createElement("h2");
  title.className = "text-lg font-bold";
  title.textContent = `Niveau ${level.id}`;

  const details = document.createElement("p");
  details.className = "text-xs text-gray-300";
  details.textContent = `Astéroïdes : ${level.asteroidCount}`;

  const status = document.createElement("span");
  status.className = "text-xs font-semibold";
  status.textContent = isUnlocked ? "Débloqué" : "Verrouillé";

  if (isUnlocked) {
    status.classList.add("text-green-400");
  } else {
    status.classList.add("text-red-400");
  }

  const button = document.createElement("button");
  button.className =
    "mt-2 px-3 py-1 rounded text-sm font-bold " +
    (isUnlocked
      ? "bg-indigo-500 hover:bg-indigo-600"
      : "bg-gray-500 cursor-not-allowed");
  button.textContent = isUnlocked ? "Jouer" : "Verrouillé";
  button.disabled = !isUnlocked;

  if (isUnlocked) {
    button.addEventListener("click", () => {
      // On lance le niveau
      window.location.href = `../game/game.html?level=${level.id}`;
    });
  }

  card.appendChild(title);
  card.appendChild(details);
  card.appendChild(status);
  card.appendChild(button);

  return card;
}

document.addEventListener("DOMContentLoaded", async () => {
  const gameData = await loadGameData();
  if (!gameData) {
    console.error("Impossible de charger les données de jeu.");
    window.location.href = "index.html";
    return;
  }

  const { player, levels } = gameData;

  // Sécurité : si aucun joueur, on retourne à l'écran d'accueil
  if (!player) {
    window.location.href = "index.html";
    return;
  }

  const playerSummary = document.getElementById("player-summary");
  const levelsContainer = document.getElementById("levels-container");
  const backButton = document.getElementById("back-to-home");

  playerSummary.textContent = `${player.userName} – Niveau joueur : ${
    player.level
  } | Attaque : ${player.attack} | Vitesse d'attaque : ${
    player.attackSpeed
  } | Vie : ${player.life} | Gold : ${player.gold}`;

  levelsContainer.innerHTML = "";

  levels.forEach((level) => {
    const card = createLevelCard(level, player);
    levelsContainer.appendChild(card);
  });

  backButton.addEventListener("click", () => {
    window.location.href = "../index.html";
  });
});
