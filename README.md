# Space Shooter – Jeu Desktop ElectronJS

## Contexte

Ce projet a été réalisé afin de créer une application **desktop** avec **ElectronJS**, dans le but d’apprendre :

- la manipulation d’interfaces graphiques en HTML/CSS/JS ;
- l’utilisation d’ElectronJS;
- la mise en place de linters (HTML & JS) ;
- la configuration d’une CI GitHub Actions ;
- la structuration d’un projet selon une architecture claire ;

---

## Description du Projet

**Space Shooter** est un jeu desktop où le joueur pilote un vaisseau spatial et doit détruire des astéroïdes pour progresser à travers différents niveaux.

### Fonctionnalités principales

- Déplacement et contrôle du vaisseau
- Apparition d'astéroïdes et système de tir
- Gestion des collisions
- Plusieurs niveaux
- Système de progression sauvegardé localement
- Boutique pour acheter des vaisseaux avec des golds gagné dans les niveaux
- Gestion de caratéristiques pour améliorer son vaisseau

### Sauvegarde locale

La progression du joueur est enregistrée dans une table players contenant :

- le nom du joueur
- le niveau du joueur ;
- les golds accumulés ;
- les vaisseaux débloqués ;
- le vaisseau sélectionné.

---

## Use Cases

### Use Case 1 – Jouer une partie

**Scénario :**
1. Le joueur lance le jeu.
2. Il démarre une partie.
3. Il déplace son vaisseau et détruit les astéroïdes.
4. Il détruit des astéroïdes et gagne des points.
5. En fin de partie, sa progression est sauvegardée.

---

### Use Case 2 – Acheter un vaisseau

**Scénario :**
1. Le joueur ouvre la boutique.
2. Il consulte les vaisseaux disponibles.
3. Il sélectionne un modèle.
4. Le système vérifie les golds.
5. Le vaisseau est débloqué et ajouté à l'inventaire.

---

## Modèle de Données (MDD)

Le jeu utilise uniquement une sauvegarde locale (fichier JSON) pour stocker la progression du joueur.  
Ce MDD décrit les différentes entités manipulées :

- `Player`
- `Level`
- `Ship`

---

### 1. Entité : Player

Représente les informations du joueur sauvegardées en local.

| Attribut       | Type            | Description                                      |
|----------------|-----------------|--------------------------------------------------|
| `userName`     | `string`        | Nom du joueur                                    |
| `level`        | `number`        | Niveau actuel du joueur                          |
| `attack`       | `number`        | Attaque actuel du joueur                         |
| `attackSpeed`  | `number`        | Vitesse d'attaque actuel du joueur               |
| `life`         | `number`        | Vie actuel du joueur                             |
| `gold`         | `number`        | Or disponible pour acheter des vaisseaux         |
| `currentShipId`| `number`        | ID du vaisseau actuellement équipé               |
| `unlockedShips`| `array<number>` | Liste des vaisseaux débloqués par le joueur      |

#### Exemple JSON `Player`

```json
{
  "userName": "John",
  "level": 3,
  "gold": 250,
  "currentShipId": 1,
  "unlockedShips": [1, 2]
}
```

### 2. Entité : Level

| Attribut          | Type            | Description                                      |
|-------------------|-----------------|--------------------------------------------------|
| `id`              | `number`        | Identifiant du niveau                            |
| `duration`        | `number`        | Nombre d’astéroïdes dans ce niveau               |
| `spawnMinInterval`| `number`        | Nombre d’astéroïdes dans ce niveau               |
| `spawnMaxInterval`| `number`        | Nombre d’astéroïdes dans ce niveau               |
| `minAsteroids`    | `number`        | Nombre d’astéroïdes dans ce niveau               |
| `maxAsteroids`    | `number`        | Nombre d’astéroïdes dans ce niveau               |
| `goldReward`      | `number`        | Nombre d’astéroïdes dans ce niveau               |

#### Exemple JSON `Level`

```json
{
  "id": 3,
  "duration": 60,
  "spawnMinInterval": 0.3,
  "spawnMaxInterval": 1,
  "minAsteroids": 6,
  "maxAsteroids": 9,
  "goldReward": 500,
}
```
### 3. Entité : Ship

| Attribut       | Type            | Description                                      |
|----------------|-----------------|--------------------------------------------------|
| `id`           |  `number`       | Identifiant du vaisseau                          |
| `name`         |  `string`       | Nom du vaisseau                                  |
| `spritePath`   |  `string`       | Chemin du sprite                                 |
| `attack`       |  `number`       | Attaque du vaisseau                              |
| `fireRate`     |  `number`       | Vitesse d'attaque du vaisseau                    |
| `price`        |  `number`       | Prix d'achat                                     |

#### Exemple JSON `Ship`

```json
{
  "id": 1,
  "name": "Starling MK1",
  "spritePath": "assets/space_sheep_2.png",
  "attack": 4,
  "fireRate": 1,
  "price": 1900
}
```

```
electron_project/
.
├── README.md
├── main.js                   # Processus principal Electron
│
├── package.json
├── package-lock.json
│
├── eslint.config.mjs         # Configuration ESLint
├── tailwind.config.js        # Config Tailwind
├── postcss.config.js         # PostCSS pour Tailwind
│
├── .github/
│   └── workflows/
│       └── lint.yml          # CI : lint auto HTML/JS
│
├── assets/                   # Images, sprites
│   ├── asteroid.png
│   ├── background.jpg
│   ├── space_sheep_1.png
│   ├── space_sheep_2.png
│   └── space_sheep_3.png
│
├── renderer/                 # Frontend du jeu
│   ├── index.html            # Interface du jeu
│   ├── input.css             # Fichier source Tailwind
│   ├── output.css            # CSS généré
│   ├── game.js               # Logique du gameplay
│   ├── store.js              # Gestion des données
│   ├── levels/               # Niveaux
│     ├── levels.html
│     ├── levels.js
│   ├── game/                 # Gameplay
│     ├── game.html
│     ├── game.js
│     ├── player.js           # Vaisseau joueur
│     ├── asteroid.js         # Astéroïdes
│     ├── bullet.js           # Tirs
│     ├── sprites.js          # Sprites
│   
└── notes.txt                 # Notes perso
```