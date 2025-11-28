# Prompt pour Gamma (ou Plan de Présentation)

Voici un plan détaillé que vous pouvez copier-coller dans Gamma ou utiliser pour structurer votre présentation orale de 10 minutes.

**Sujet :** Développement d'un jeu Arcade Cross-Platform avec Electron.
**Contexte :** Projet de Master 2.
**Ton :** Professionnel, Technique et Engageant.

---

## Structure de la Présentation (10 Slides)

### 1. Titre et Introduction
*   **Titre :** Space Shooter - Projet Electron Cross-Platform.
*   **Sous-titre :** Une approche moderne du développement Desktop avec des technologies Web.
*   **Contenu :** Présentation personnelle et du contexte (Projet M2).

### 2. Description du Projet (Le "Quoi")
*   **Concept :** Un jeu de tir spatial (Shmup) en 2D vue de dessus.
*   **Objectif :** Survivre à des vagues d'astéroïdes, vaincre des boss, et progresser à travers des niveaux de difficulté croissante.
*   **Fonctionnalités Clés :**
    *   Système de niveaux et de progression.
    *   Boutique d'améliorations (Vaisseaux, Stats).
    *   Sauvegarde persistante des données joueur.

### 3. Stack Technique & Choix (Le "Comment" et "Pourquoi")
*   **Electron :**
    *   *Pourquoi ?* Permet de créer une application Desktop native (Windows, Mac, Linux) en utilisant HTML/CSS/JS. Gain de temps de développement et portabilité.
*   **Vanilla JavaScript + HTML5 Canvas :**
    *   *Pourquoi ?* Performance optimale pour le rendu 2D (Game Loop). Pas de surcharge liée à un moteur de jeu lourd (comme Unity) pour un projet de cette échelle. Maîtrise totale du code.
*   **TailwindCSS :**
    *   *Pourquoi ?* Développement rapide et maintenable de l'interface utilisateur (Menus, HUD) avec une approche "Utility-first".

### 4. Architecture de l'Application
*   **Séparation des Processus :**
    *   **Main Process (Node.js) :** Gère le cycle de vie de l'application, les fenêtres, et l'accès système (Fichiers de sauvegarde).
    *   **Renderer Process (Chromium) :** Gère l'affichage du jeu, les animations et les interactions utilisateur.
*   **Communication (IPC) :** Utilisation de `ipcMain` et `ipcRenderer` pour échanger des données de manière sécurisée (ex: demander la sauvegarde du score).

### 5. Qualité Code & CI (Intégration Continue)
*   **Tests Unitaires (Jest) :**
    *   *Pourquoi ?* Garantir la robustesse des fonctionnalités critiques (Sauvegarde/Chargement des données, Logique des projectiles).
    *   *Exemple :* Vérifier que le fichier `playerData.json` est bien créé s'il est absent.
*   **GitHub Actions (CI) :**
    *   *Pourquoi ?* Automatisation. À chaque `push` ou `Pull Request`, les tests sont exécutés automatiquement dans un environnement virtuel. Cela empêche d'intégrer du code cassé dans la branche principale.

### 6. Cas d'Utilisation (User Cases)
*   **Scénario 1 : Le Nouveau Joueur**
    *   Lance le jeu -> Tutoriel/Niveau 1 -> Meurt ou Gagne -> Le score est sauvegardé localement.
*   **Scénario 2 : La Progression**
    *   Le joueur accumule de l'or -> Accède à la boutique -> Achète un nouveau vaisseau ("Falcon X") -> Les stats sont mises à jour et persistées.
*   **Scénario 3 : Le "Power User"**
    *   Le joueur lance le jeu sur Linux ou Windows -> L'expérience est identique (Cross-platform).

### 7. Défis Techniques Rencontrés
*   **Gestion du Temps (Delta Time) :** Assurer que la vitesse du jeu est la même quel que soit le taux de rafraîchissement de l'écran (30fps vs 144fps).
*   **Persistance des Données :** Gérer correctement les chemins de fichiers (`app.getPath('userData')`) pour que la sauvegarde fonctionne aussi bien en développement qu'une fois l'application compilée (.exe).

### 8. Démonstration (Si possible)
*   Montrer rapidement le lancement du jeu, un tir, et l'achat d'un item.

### 9. Améliorations Futures (Roadmap)
*   Support manette (Gamepad API).
*   Leaderboard en ligne (Backend distant).
*   Ajout de sons et musiques (Web Audio API).

### 10. Conclusion
*   Projet complet couvrant le cycle de vie logiciel : Conception -> Développement -> Test -> Build -> CI.
*   Démonstration de la puissance d'Electron pour le jeu 2D léger.

---

**Note pour Gamma :** Vous pouvez copier ces sections point par point pour générer les slides. Demandez un style "Dark / Cyberpunk" ou "Modern Tech" pour coller au thème spatial.
