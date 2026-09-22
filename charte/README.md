# Charte « papier » de Luminote v2 — sources pour le design

Copie de lecture des sources de l'app (dépôt de l'app, branche `v2`), pour Claude Design :

- `charte-papier.md` — la charte écrite : couleurs (papier `#FBF8F1`, encre `#23201C`, terracotta `#B4442E` = ce qui se gagne, vert `#2F6B52` = ce qui se joue), typographies, traits, ombres opaques `0 3px 0`, ressorts, règles d'animation.
- `css/papier.css` — les tokens (`:root`) et primitives partagées : grain, hachures, `.tampon`, boutons papier, `.etiquette-*` (le fil), étoiles, cartouches, et les keyframes communes (tamponIn, coinIn, ringPop, stampIn, softIn, riseIn, inkUp…).
- `css/*.css` — un fichier par écran, avec ses animations : `home.css` (accueil, pièce, exercice du jour), `game.css` (jeu, aide manuscrite, décompte, pause, bilan), `book.css` (sommaire, cartouches de chapitres, réveil), `library.css` (bibliothèque, couvertures), `notion.css` (intro de notion), `daily.css` (ouverture du jour), `streak.css` (série), `progress.css`, `achievements.css`, `revision.css`, `settings.css`, `training.css`, `tutorial.css`, `economy.css`, `refonte.css`.
- `contenu-methode.md` — les douze livres, leurs chapitres (titres, notes ou figures nouvelles, seuil d'étoiles) et leurs exercices (titre, type, tempo), tels qu'affichés dans l'app.
- `textes-interface-fr.js` — tous les textes de l'interface (boutons, titres d'écrans, bilan, guide, réglages…), en français.
- `ecrans/` — captures des écrans actuels (390 × 844, ×2) : accueil, bibliothèque, sommaire, intro de notion, jeu (aide, démo, exercice du jour, cartouche du guide), bilans.
- `fonts/` — Atkinson Hyperlegible (corps), Bricolage Grotesque (titres, chiffres), Bravura (glyphes musicaux), Caveat (notes manuscrites, ponctuel).

Les animations du canvas de jeu (éclaboussures d'encre, anneau, curseur, particules de la coupure) sont dessinées en JavaScript et ne figurent pas ici.
Le site vitrine à la racine du dépôt n'est pas concerné ; `v2/` est l'app de test chiffrée.
