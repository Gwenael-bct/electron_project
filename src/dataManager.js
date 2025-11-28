const path = require("path");
const fs = require("fs");

/**
 * Chemin du fichier de sauvegarde JSON.
 */
function getSaveFilePath(userDataPath) {
    const filePath = path.join(userDataPath, "playerData.json");
    // console.log("Chemin du fichier de sauvegarde :", filePath); // Optional logging
    return filePath;
}

/**
 * Lecture des données complètes de jeu.
 */
function loadGameData(userDataPath) {
    const filePath = getSaveFilePath(userDataPath);

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
function saveGameData(userDataPath, data) {
    const filePath = getSaveFilePath(userDataPath);

    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
        console.error("Erreur d'écriture playerData.json :", err);
    }
}

/**
 * Suppression des données (reset complet).
 */
function resetGameData(userDataPath) {
    const filePath = getSaveFilePath(userDataPath);

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
function createDefaultGameDataIfMissing(userDataPath) {
    const defaultLevels = [
        {
            id: 1,
            duration: 30, // secondes
            spawnMinInterval: 0.8,
            spawnMaxInterval: 1.5,
            minAsteroids: 3,
            maxAsteroids: 4,
            goldReward: 100,
        },
        {
            id: 2,
            duration: 45,
            spawnMinInterval: 0.6,
            spawnMaxInterval: 1.2,
            minAsteroids: 4,
            maxAsteroids: 6,
            goldReward: 250,
        },
        {
            id: 3,
            duration: 60,
            spawnMinInterval: 0.3,
            spawnMaxInterval: 1,
            minAsteroids: 6,
            maxAsteroids: 9,
            goldReward: 500,
        },
        {
            id: 4,
            duration: 60,
            spawnMinInterval: 0.3,
            spawnMaxInterval: 0.9,
            minAsteroids: 6,
            maxAsteroids: 9,
            goldReward: 600,
        },
        {
            id: 5,
            duration: 60,
            spawnMinInterval: 0.3,
            spawnMaxInterval: 0.7,
            minAsteroids: 6,
            maxAsteroids: 9,
            goldReward: 1000,
            boss: true,
        },
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

    const existing = loadGameData(userDataPath);

    if (!existing) {
        const data = {
            player: null,
            levels: defaultLevels,
            ships: defaultShips,
        };
        saveGameData(userDataPath, data);
        return;
    }

    let changed = false;

    // On force la mise à jour des niveaux pour appliquer la nouvelle structure (temps vs astéroïdes)
    existing.levels = defaultLevels;
    changed = true;

    if (!existing.ships || !Array.isArray(existing.ships)) {
        existing.ships = defaultShips;
        changed = true;
    }

    // Migration : ajouter les champs d'amélioration si manquants
    if (existing.player) {
        if (existing.player.healthUpgrades === undefined) {
            existing.player.healthUpgrades = 0;
            changed = true;
        }
        if (existing.player.attackUpgrades === undefined) {
            existing.player.attackUpgrades = 0;
            changed = true;
        }
        if (existing.player.attackSpeedUpgrades === undefined) {
            existing.player.attackSpeedUpgrades = 0;
            changed = true;
        }
        if (existing.player.moveSpeedUpgrades === undefined) {
            existing.player.moveSpeedUpgrades = 0;
            changed = true;
        }
        if (existing.player.moveSpeed === undefined) {
            existing.player.moveSpeed = 350;
            changed = true;
        }
        // Migration : patterns de missiles
        if (existing.player.missilePatterns === undefined) {
            existing.player.missilePatterns = [1];
            changed = true;
        }
        if (existing.player.currentMissilePattern === undefined) {
            existing.player.currentMissilePattern = 1;
            changed = true;
        }
    }

    if (changed) {
        saveGameData(userDataPath, existing);
    }
}

module.exports = {
    loadGameData,
    saveGameData,
    resetGameData,
    createDefaultGameDataIfMissing,
};
