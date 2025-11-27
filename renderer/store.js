const { loadGameData, savePlayer } = require("./api");

// Configuration des améliorations de caractéristiques
const CHAR_UPGRADES = {
    health: {
        name: "Vie",
        basePrice: 50,
        increment: 10,
        icon: "❤️",
        getCurrentValue: (player) => player.life,
        getUpgradeCount: (player) => player.healthUpgrades || 0,
    },
    attack: {
        name: "Attaque",
        basePrice: 75,
        increment: 1,
        icon: "⚔️",
        getCurrentValue: (player) => player.attack,
        getUpgradeCount: (player) => player.attackUpgrades || 0,
    },
    attackSpeed: {
        name: "Vitesse de tir",
        basePrice: 100,
        increment: 0.2,
        icon: "⚡",
        getCurrentValue: (player) => player.attackSpeed,
        getUpgradeCount: (player) => player.attackSpeedUpgrades || 0,
    },
    moveSpeed: {
        name: "Vitesse",
        basePrice: 80,
        increment: 20,
        icon: "🚀",
        getCurrentValue: (player) => player.moveSpeed || 350,
        getUpgradeCount: (player) => player.moveSpeedUpgrades || 0,
    },
};

// Calcule le prix d'une amélioration (augmente de 20% à chaque niveau)
function getUpgradePrice(basePrice, upgradeCount) {
    return Math.floor(basePrice * Math.pow(1.2, upgradeCount));
}

// Crée une carte d'amélioration de caractéristique
function createCharacteristicCard(charKey, charConfig, player) {
    const upgradeCount = charConfig.getUpgradeCount(player);
    const currentValue = charConfig.getCurrentValue(player);
    const price = getUpgradePrice(charConfig.basePrice, upgradeCount);
    const canAfford = player.gold >= price;

    const card = document.createElement("div");
    card.className =
        "group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:border-blue-500/30 overflow-hidden";

    // Glow effect background
    const glow = document.createElement("div");
    glow.className = "absolute -top-10 -right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/30 transition-all";
    card.appendChild(glow);

    // Header with Icon and Title
    const header = document.createElement("div");
    header.className = "flex items-center gap-3 z-10";

    const iconContainer = document.createElement("div");
    iconContainer.className = "w-12 h-12 rounded-lg bg-gradient-to-br from-blue-900/50 to-black border border-white/10 flex items-center justify-center text-2xl shadow-inner";
    iconContainer.textContent = charConfig.icon;

    const titleContainer = document.createElement("div");
    const title = document.createElement("h3");
    title.className = "text-lg font-bold text-white group-hover:text-blue-300 transition-colors";
    title.textContent = charConfig.name;

    const levelBadge = document.createElement("span");
    levelBadge.className = "text-xs font-mono text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded border border-blue-500/20";
    levelBadge.textContent = `LVL ${upgradeCount}`;

    titleContainer.appendChild(title);
    titleContainer.appendChild(levelBadge);
    header.appendChild(iconContainer);
    header.appendChild(titleContainer);

    // Stats Display
    const statsContainer = document.createElement("div");
    statsContainer.className = "flex flex-col gap-1 z-10 my-2";

    const statRow = document.createElement("div");
    statRow.className = "flex justify-between text-sm";
    statRow.innerHTML = `<span class="text-gray-400">Actuel</span> <span class="text-white font-mono">${currentValue.toFixed(1)}</span>`;

    const nextRow = document.createElement("div");
    nextRow.className = "flex justify-between text-xs text-green-400";
    nextRow.innerHTML = `<span>Prochain</span> <span>+${charConfig.increment}</span>`;

    statsContainer.appendChild(statRow);
    statsContainer.appendChild(nextRow);

    // Price and Button
    const footer = document.createElement("div");
    footer.className = "mt-auto z-10 flex flex-col gap-2";

    const button = document.createElement("button");
    button.className = "w-full py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ";

    if (canAfford) {
        button.innerHTML = `<span>AMÉLIORER</span> <span class="bg-black/20 px-1.5 rounded text-xs">${price} G</span>`;
        button.className += "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-900/20";
        button.addEventListener("click", async () => {
            await buyCharacteristicUpgrade(charKey, charConfig, player);
        });
    } else {
        button.innerHTML = `<span>${price} G</span>`;
        button.className += "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5";
        button.disabled = true;
    }

    footer.appendChild(button);

    card.appendChild(header);
    card.appendChild(statsContainer);
    card.appendChild(footer);

    return card;
}

// Achète une amélioration de caractéristique
async function buyCharacteristicUpgrade(charKey, charConfig, player) {
    const upgradeCount = charConfig.getUpgradeCount(player);
    const price = getUpgradePrice(charConfig.basePrice, upgradeCount);

    if (player.gold < price) return;

    // Déduit l'or
    player.gold -= price;

    // Applique l'amélioration selon le type
    switch (charKey) {
        case "health":
            player.life += charConfig.increment;
            player.healthUpgrades = (player.healthUpgrades || 0) + 1;
            break;
        case "attack":
            player.attack += charConfig.increment;
            player.attackUpgrades = (player.attackUpgrades || 0) + 1;
            break;
        case "attackSpeed":
            player.attackSpeed += charConfig.increment;
            player.attackSpeedUpgrades = (player.attackSpeedUpgrades || 0) + 1;
            break;
        case "moveSpeed":
            player.moveSpeed = (player.moveSpeed || 350) + charConfig.increment;
            player.moveSpeedUpgrades = (player.moveSpeedUpgrades || 0) + 1;
            break;
    }

    // Sauvegarde et recharge
    await savePlayer(player);
    window.location.reload();
}

// Configuration des patterns de missiles
const MISSILE_PATTERNS = [
    {
        id: 1,
        name: "Tir Simple",
        price: 0,
        description: "Un seul missile droit devant.",
        icon: "I"
    },
    {
        id: 2,
        name: "Tir Double",
        price: 150,
        description: "Deux missiles parallèles.",
        icon: "II"
    },
    {
        id: 3,
        name: "Tir Triple",
        price: 300,
        description: "Trois missiles parallèles.",
        icon: "III"
    },
    {
        id: 4,
        name: "Tir Latéral",
        price: 400,
        description: "Un missile devant + deux sur les côtés.",
        icon: "Y"
    },
    {
        id: 5,
        name: "Tir en Éventail",
        price: 600,
        description: "Cinq missiles dispersés en éventail.",
        icon: "W"
    }
];

function createMissilePatternCard(pattern, player) {
    const isUnlocked = player.missilePatterns && player.missilePatterns.includes(pattern.id);
    const isSelected = player.currentMissilePattern === pattern.id;
    const canAfford = player.gold >= pattern.price;

    const card = document.createElement("div");
    // Base style
    let cardClasses = "group relative rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 overflow-hidden border ";

    if (isSelected) {
        cardClasses += "bg-purple-900/20 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.15)] scale-[1.02]";
    } else if (isUnlocked) {
        cardClasses += "bg-black/40 border-white/10 hover:border-purple-500/50 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]";
    } else {
        cardClasses += "bg-black/40 border-white/5 opacity-80 hover:opacity-100 hover:border-white/20";
    }
    card.className = cardClasses;

    // Background Icon (faded)
    const bgIcon = document.createElement("div");
    bgIcon.className = "absolute -bottom-4 -right-4 text-8xl font-black text-white/5 select-none pointer-events-none group-hover:text-purple-500/10 transition-colors";
    bgIcon.textContent = pattern.icon;
    card.appendChild(bgIcon);

    // Header
    const header = document.createElement("div");
    header.className = "flex justify-between items-start z-10";

    const titleInfo = document.createElement("div");
    const title = document.createElement("h3");
    title.className = `text-lg font-bold ${isSelected ? 'text-purple-300' : 'text-white'} group-hover:text-purple-300 transition-colors`;
    title.textContent = pattern.name;

    const icon = document.createElement("div");
    icon.className = "text-2xl font-mono text-purple-400";
    icon.textContent = pattern.icon;

    titleInfo.appendChild(title);
    header.appendChild(titleInfo);
    header.appendChild(icon);

    // Description
    const desc = document.createElement("p");
    desc.className = "text-sm text-gray-400 h-10 z-10 leading-snug";
    desc.textContent = pattern.description;

    // Button
    const button = document.createElement("button");
    button.className = "mt-auto w-full py-2.5 rounded-lg text-sm font-bold transition-all duration-200 z-10 ";

    if (isSelected) {
        button.innerHTML = `<span class="flex items-center justify-center gap-2">✓ ÉQUIPÉ</span>`;
        button.className += "bg-purple-600 text-white cursor-default shadow-lg shadow-purple-900/40";
        button.disabled = true;
    } else if (isUnlocked) {
        button.textContent = "SÉLECTIONNER";
        button.className += "bg-white/10 hover:bg-purple-600 hover:text-white text-gray-300 border border-white/10 hover:border-purple-500/50";
        button.addEventListener("click", async () => {
            await selectMissilePattern(pattern.id, player);
        });
    } else {
        if (canAfford) {
            button.innerHTML = `ACHETER <span class="ml-1 opacity-80">${pattern.price} G</span>`;
            button.className += "bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-900/20";
            button.addEventListener("click", async () => {
                await buyMissilePattern(pattern, player);
            });
        } else {
            button.innerHTML = `<span class="opacity-50">${pattern.price} G</span>`;
            button.className += "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5";
            button.disabled = true;
        }
    }

    card.appendChild(header);
    card.appendChild(desc);
    card.appendChild(button);

    return card;
}

async function buyMissilePattern(pattern, player) {
    if (player.gold < pattern.price) return;

    player.gold -= pattern.price;
    if (!player.missilePatterns) player.missilePatterns = [1];
    player.missilePatterns.push(pattern.id);

    // Auto-equip on buy
    player.currentMissilePattern = pattern.id;

    await savePlayer(player);
    window.location.reload();
}

async function selectMissilePattern(patternId, player) {
    player.currentMissilePattern = patternId;
    await savePlayer(player);
    window.location.reload();
}


function createShipCard(ship, player) {
    const isUnlocked = player.unlockedShips.includes(ship.id);
    const isSelected = player.currentShipId === ship.id;
    const canAfford = player.gold >= ship.price;

    const card = document.createElement("div");
    let cardClasses = "group relative rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 overflow-hidden border ";

    if (isSelected) {
        cardClasses += "bg-green-900/20 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.15)] scale-[1.02]";
    } else if (isUnlocked) {
        cardClasses += "bg-black/40 border-white/10 hover:border-green-500/50 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]";
    } else {
        cardClasses += "bg-black/40 border-white/5 opacity-80 hover:opacity-100 hover:border-white/20";
    }
    card.className = cardClasses;

    // Image Container
    const imgContainer = document.createElement("div");
    imgContainer.className = "relative w-full h-32 flex items-center justify-center bg-black/30 rounded-lg border border-white/5 group-hover:border-white/10 transition-colors mb-2 overflow-hidden";

    // Grid background for image
    const grid = document.createElement("div");
    grid.className = "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]";
    imgContainer.appendChild(grid);

    const img = document.createElement("img");
    img.src = `../${ship.spritePath}`;
    img.alt = ship.name;
    img.className = `w-24 h-24 object-contain pixelated relative z-10 transition-transform duration-500 group-hover:scale-110 ${!isUnlocked ? 'brightness-0 invert opacity-30' : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]'}`;
    imgContainer.appendChild(img);

    card.appendChild(imgContainer);

    // Title
    const title = document.createElement("h2");
    title.className = `text-xl font-bold ${isSelected ? 'text-green-400' : 'text-white'} group-hover:text-green-300 transition-colors`;
    title.textContent = ship.name;
    card.appendChild(title);

    // Stats
    const stats = document.createElement("div");
    stats.className = "flex flex-col gap-3 mb-2";

    // Helper for progress bars
    const createStatBar = (label, value, max, color) => {
        const container = document.createElement("div");
        container.className = "flex flex-col gap-1";

        const labelRow = document.createElement("div");
        labelRow.className = "flex justify-between text-xs text-gray-400";
        labelRow.innerHTML = `<span>${label}</span> <span>${value}</span>`;

        const barBg = document.createElement("div");
        barBg.className = "w-full h-1.5 bg-white/10 rounded-full overflow-hidden";

        const barFill = document.createElement("div");
        barFill.className = `h-full ${color} rounded-full`;
        barFill.style.width = `${Math.min((value / max) * 100, 100)}%`;

        barBg.appendChild(barFill);
        container.appendChild(labelRow);
        container.appendChild(barBg);
        return container;
    };

    // Assuming max attack ~10 and max fireRate ~5 for visualization
    stats.appendChild(createStatBar("PUISSANCE DE FEU", ship.attack, 10, "bg-red-500"));
    stats.appendChild(createStatBar("CADENCE DE TIR", ship.fireRate, 5, "bg-yellow-500"));

    card.appendChild(stats);

    // Button
    const button = document.createElement("button");
    button.className = "mt-auto w-full py-3 rounded-lg text-sm font-bold transition-all duration-200 z-10 ";

    if (isSelected) {
        button.innerHTML = `<span class="flex items-center justify-center gap-2">✓ PILOTÉ</span>`;
        button.className += "bg-green-600 text-white cursor-default shadow-lg shadow-green-900/40";
        button.disabled = true;
    } else if (isUnlocked) {
        button.textContent = "DÉCOLLER";
        button.className += "bg-white/10 hover:bg-green-600 hover:text-white text-gray-300 border border-white/10 hover:border-green-500/50";
        button.addEventListener("click", async () => {
            await selectShip(ship.id, player);
        });
    } else {
        if (canAfford) {
            button.innerHTML = `ACHETER <span class="ml-1 opacity-80">${ship.price} G</span>`;
            button.className += "bg-yellow-500 hover:bg-yellow-400 text-black shadow-lg shadow-yellow-900/20";
            button.addEventListener("click", async () => {
                await buyShip(ship, player);
            });
        } else {
            button.innerHTML = `<span class="opacity-50">${ship.price} G</span>`;
            button.className += "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5";
            button.disabled = true;
        }
    }

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
    const characteristicsContainer = document.getElementById("characteristics-container");
    const missilePatternsContainer = document.getElementById("missile-patterns-container");
    const shipsContainer = document.getElementById("ships-container");
    const backButton = document.getElementById("back-to-levels");

    playerSummary.textContent = `Gold : ${player.gold}`;

    // Populate characteristics
    characteristicsContainer.innerHTML = "";
    Object.keys(CHAR_UPGRADES).forEach((charKey) => {
        const charConfig = CHAR_UPGRADES[charKey];
        const card = createCharacteristicCard(charKey, charConfig, player);
        characteristicsContainer.appendChild(card);
    });

    // Populate missile patterns
    if (missilePatternsContainer) {
        missilePatternsContainer.innerHTML = "";
        MISSILE_PATTERNS.forEach((pattern) => {
            const card = createMissilePatternCard(pattern, player);
            missilePatternsContainer.appendChild(card);
        });
    }

    // Populate ships
    shipsContainer.innerHTML = "";

    ships.forEach((ship) => {
        const card = createShipCard(ship, player);
        shipsContainer.appendChild(card);
    });

    backButton.addEventListener("click", () => {
        window.location.href = "levels/levels.html";
    });
});
