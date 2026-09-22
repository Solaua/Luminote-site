# Charte « papier » — distillée de l'export design (Tour 11, figée)

> Source de vérité : `Design/Refonte design Luminote app/Luminote - DA Jeu.dc.html`
> (planche d'intention, tours 1→11). Ce fichier est la distillation de
> référence pour les chantiers C8-C14 — en cas de doute, l'export prime.
> Implémentation : `src/styles/papier.css` (tokens) + `src/styles/papier.js`
> (miroir canvas) + `src/components/papier/` (primitives).

## L'esprit (Tour 11)

- **La main** : Cuphead et *Mouse P.I. for Hire* — encre, papier, cartoon des années 30.
- **Le mouvement** : les **12 principes de Disney**.
- **La posture** : la Gazette du Sorcier — au repos, une page de journal
  parfaitement sobre et lisible ; c'est quand ça bouge que la fantaisie se révèle.

## 1 · Posture

Sobre au repos, fantasque en mouvement. **Aucun élément décoratif statique** :
toute fantaisie est une *animation* (tampon qui claque, pièce qui saute, jauge
qui respire). Un écran figé doit pouvoir passer pour une page imprimée.

## 2 · Couleurs

- Papier crème grainé `#FBF8F1`, encre `#23201C`.
- **Deux encres hachées seulement** : rouge `#B4442E` = ce qui se **gagne**
  (jetons, étoiles, série, scores, rangs) ; vert bouteille `#2F6B52` = ce qui
  se **joue** (CTA, curseur, tempo, chevrons). **Jamais de troisième accent.**
- Hachures à 38° sur tout aplat coloré.
- Exception unique hors charte : l'ocre `#C79A3B` du jugement « BIEN »
  (Tour 10 — PARFAIT vert / BIEN ocre).
- **Fonds pâles par teinte** (tampons, jugements, aplats doux) :
  terracotta `#FBF2EF`, vert `#EFF5F1`, ocre `#FAF4E4` (texte BIEN =
  ocre foncé `#A97F2C`) ; état « faux » d'un bouton : `#F3DDD6`.
- **Grammaire du TAMPON** (FAIT, ×2, PARFAIT, BIEN) : bordure simple
  1,25-1,5 px de la teinte, fond pâle de la teinte, ombre `0 2px 0` de la
  MÊME encre, Atkinson 700 espacé `.08em`, rayon 5-6, incliné (−4/−6°),
  entrée `stampIn`.
- **Grammaire de l'ÉTOILE** (fancyStars) : tracé 5 branches
  `M0,-28 L8.2,-8.7 L28,-8.7 L12,4 L16.9,23.5 L0,11.5 …` (viewBox
  −34 −34 70 70) ; gagnée = ombre décalée terracotta (translate 2.6/3,
  opacité .85) + remplissage hachuré sur ENCRE (#jHat) + reflet blanc .14
  sur le quadrant droit ; manquée = contour POINTILLÉ (5 3, opacité .45) ;
  chaque étoile penche (−8°, la médiane +6°).
- Surfaces (Tour 1) : creux `#EFECE5`, état appui `#E2DED5` ; en pratique les
  tours 9-10 posent les creux en `#F3F0E9` grainé.
- Teintes de notes : 7 teintes rabattues (deux tables divergeaient RÉ/MI/FA —
  unifiées sur la variante sombre, `src/styles/papier.js` NOTE_TINTS).

## 3 · Mouvement (Disney)

- **Squash & stretch sur tout appui** : écrasement 3-5 px + `scale(1.015,.96)`,
  l'ombre opaque **s'absorbe** (0 4px → 0 1px, ou 0 3px → 0). Ressort d'appui :
  `transform .16s cubic-bezier(.34,2.1,.6,1)`.
- **Anticipation** avant tout saut.
- **Follow-through** : rebond avec dépassement — `cubic-bezier(.3,1.4,.5,1)`.
- **Entrées en cascade, jamais simultanées.**
- **Exagération aux moments gagnés** (tampons, ondes).
- **Un idle discret par écran maximum** (ex. `inkBreath` scale 1→1.045 1,6 s
  sur le CTA courant ; `starTwirl` : pirouette d'étoile, 86 % du temps
  immobile, durées/délais décalés par étoile).
- **Dépliage au tap (5a)** : panneau `max-height` en TRANSITION
  `.5s cubic-bezier(.3,1.25,.45,1)` (s'ouvre ET se referme) ; chaque rang
  se tamponne en cascade — `rowStamp` (opacity 0, scale 2.2 rotate −5° →
  .86/1.2° → 1.09 → 1, .3 s ressort canonique, origine gauche) avec délais
  `.12s + k×.06s`, rejoué à chaque ouverture. Variante scène 4a : unfold
  `.55s cubic-bezier(.3,1.2,.45,1)`, rangs à +70 ms.
- **Tampon d'entrée** : `stampIn` (opacity 0, scale 2.6 rotate −24° →
  .82/2° → 1.12 → 1), .35-.4 s ressort canonique.

## 4 · Filigrane & matière

- **Clé de sol Bravura géante en filigrane sur CHAQUE écran** : 4-5 % d'encre,
  inclinée, coupée par un bord (ex. 9b : `right:-60px; top:150px;
  font:400 200px/1 Bravura; color:rgba(35,32,28,.05); rotate(8deg)`).
- Trait `1,25 px` constant (fort : 1,5 px).
- **Rayons : 10 (boutons) · 16 (surfaces)** — les cartouches de sommaire vivent
  en 5-7 (grammaire propre extraite des écrans 9d/4a).
- Ombres opaques décalées, **jamais floues** ; les cartes de l'accueil portent
  une **ombre brun papier** `#6B5F4A` (Tour 5 : l'ombre n'est plus de la
  couleur de la reliure).
- Grain papier : `radial-gradient(rgba(35,32,28,.05) .5px, transparent .6px)
  0 0/4px 4px` (creux : alpha .09).
- Hachures : `repeating-linear-gradient(38deg, rgba(245,241,233,.16) 0 1.1px,
  transparent 1.1px 4px)`.
- **Filet de header estompé aux extrémités** :
  `linear-gradient(90deg, transparent, rgba(35,32,28,.22) 22%,
  rgba(35,32,28,.22) 78%, transparent)`.

## Typographie (Tour 3 + Tour 11)

- **Bricolage Grotesque** : titres ET chiffres (tabulaires) — porte le 92 %,
  les stats, le nom du chapitre. (Tweaks 11a-11g : pistes alternatives non
  retenues — Young Serif, Instrument Serif, Bowlby One SC, Gloock, Archivo
  Black, Caprasimo.)
- **Atkinson Hyperlegible** : tout ce qui se lit vite — boutons, légendes,
  sous-titres, corps.
- **Caveat** : annotation manuscrite ponctuelle (« nouveau ! »).
- **Bravura** : glyphes de partition partout (jamais d'icônes pour les figures)
  + filigranes.

## Grammaires d'écran actées (tours 2-10)

- **2d Jeu** : curseur = trait vert 2 px qui défile ; l'encre colore la note
  jouée (7 teintes) ; boutons du clavier : squash 3 px + perte d'ombre, chaque
  bouton sonne sa hauteur réelle.
- **3a Résultat** : voile + cartouche qui tombe avec rebond (façon Cuphead),
  étoiles tamponnées une à une (la manquée reste en contour), chiffre pop,
  stats SANS encadré (chiffres posés, séparés par filets). Trois sorties,
  trois poids : encre pleine / papier grainé / simple lien.
- **4a Déblocage** : cadenas frétille → saute (splash) → le cartouche se
  réveille (fond, ombre, rebond) → « nouveau ! » manuscrit de travers.
- **5a Bibliothèque** : feuilletage horizontal, un livre au centre (squash à
  l'arrivée), couvertures d'édition (encadré numéro, titre souligné, folio),
  sommaire en cartouches dépliables SUR PLACE (le chapitre en cours arrive déjà
  déplié).
- **6a Entrée en jeu** : dépôt strictement successif (lignes → clé → chiffrage
  → notes une à une avec rebond) puis décompte tamponné 1·2·3·4 (une mesure
  entière, au BPM réel). « Disney, pas fanfare ».
- **8a Pause** : même scène que le Résultat (voile + cartouche) ; la partition
  reste lisible dessous ; à la reprise le décompte se rejoue.
- **8b Entraînement** : menus dépliants à filets (PAS des cartouches), 17
  tuiles rythmiques en vrais glyphes, jauge de tempo libre 40-140 (curseur qui
  s'étire pendant la traînée, s'écrase à la dépose).
- **8c Intro de notion** : 3 cartes max, fondu posé — « on introduit, on ne
  célèbre pas » ; « passer » toujours visible.
- **9-series (freemium)** : accueil P1/Complète, ouverture pleine page (jeton
  qui tombe : rotation + écrasement, onde rouge, ×2 frappé), série (tache
  d'encre qui grossit, semaine en tampons, paliers en filets), sommaire-dépense
  (cadenas saute, numéro se frappe en rouge, « jouer ▶ » se tamponne, compteur
  s'écrase), paywall poli (le mur n'arrive qu'encrier vide, rappelle le cadeau
  quotidien).
- **10 Arcade** : rendu statique conservé, DA qui s'emballe ; titre vert +
  tempo courant ; combo central écrasé à chaque frappe ; jugements PARFAIT
  vert / BIEN ocre ; vies à droite du score (cœur perdu en pointillé) ; lobby
  = top 5 (record en carte à relief), reprise à la meilleure zone, jamais de
  menu de paliers.
- **10d Succès** : médailles = pastilles rouges hachurées (emblème ★/✓/glyphe/
  ×N), FAIT tamponné, en-cours = jauge verte + compteur tabulaire, lointain =
  pastille pointillée + cadenas.
