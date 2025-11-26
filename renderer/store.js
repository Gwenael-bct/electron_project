const { loadGameData, savePlayer } = require("./api");

function createShipCard(ship, player) {
    const isUnlocked = player.unlockedShips.includes(ship.id);
    const isSelected = player.currentShipId === ship.id;
    const canAfford = player.gold >= ship.price;

    const card = document.createElement("div");
    card.className =
        "bg-black/60 border border-white/20 rounded-lg px-4 py-3 flex flex-col gap-3 text-white items-center transition-transform hover:scale-105";

    // Image du vaisseau
    const img = document.createElement("img");
    img.src = `../${ship.spritePath}`;
    img.alt = ship.name;
    img.className = "w-16 h-16 object-contain pixelated"; // pixelated pour le style rétro si besoin

    const title = document.createElement("h2");
    title.className = "text-lg font-bold";
    title.textContent = ship.name;

    const stats = document.createElement("div");
    stats.className = "text-xs text-gray-300 flex flex-col gap-1";
    stats.innerHTML = `
    <span>Attaque : ${ship.attack}</span>
    <span>Vitesse de tir : ${ship.fireRate}</span>
    <span>Prix : ${ship.price} Gold</span>
  `;

    const button = document.createElement("button");
    button.className = "mt-2 px-4 py-2 rounded text-sm font-bold w-full ";

    if (isSelected) {
        button.textContent = "Équipé";
        button.className += "bg-green-600 cursor-default";
        button.disabled = true;
    } else if (isUnlocked) {
        button.textContent = "Sélectionner";
        button.className += "bg-blue-500 hover:bg-blue-600";
        button.addEventListener("click", async () => {
            await selectShip(ship.id, player);
        });
    } else {
        if (canAfford) {
            button.textContent = "Acheter";
            button.className += "bg-yellow-500 hover:bg-yellow-600 text-black";
            button.addEventListener("click", async () => {
                await buyShip(ship, player);
            });
        } else {
            button.textContent = "Pas assez d'or";
            button.className += "bg-gray-600 cursor-not-allowed";
            button.disabled = true;
        }
    }

    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(stats);
    card.appendChild(button);

    return card;
}

async function buyShip(ship, player) {
    if (player.gold < ship.price) return;

    player.gold -= ship.price;
    player.unlockedShips.push(ship.id);
    // On sauvegarde
    await savePlayer(player);
    // On recharge l'interface
    window.location.reload();
}

async function selectShip(shipId, player) {
    player.currentShipId = shipId;
    await savePlayer(player);
    window.location.reload();
}

document.addEventListener("DOMContentLoaded", async () => {
    const gameData = await loadGameData();
    if (!gameData) {
        window.location.href = "index.html";
        return;
    }

    const { player, ships } = gameData;

    if (!player) {
        window.location.href = "index.html";
        return;
    }

    const playerSummary = document.getElementById("player-summary");
    const shipsContainer = document.getElementById("ships-container");
    const backButton = document.getElementById("back-to-levels");

    playerSummary.textContent = `Gold : ${player.gold}`;

    shipsContainer.innerHTML = "";

    ships.forEach((ship) => {
        const card = createShipCard(ship, player);
        shipsContainer.appendChild(card);
    });

    backButton.addEventListener("click", () => {
        window.location.href = "levels/levels.html";
    });
});
