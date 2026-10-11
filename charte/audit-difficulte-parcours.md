# Audit de difficulté du parcours — Luminote v2

> 11/10/2026 · branche `v2` (HEAD `1ddebdb`, curriculum et moteur identiques à `23fe5c9`) · lecture seule, aucun fichier du dépôt modifié hors ce rapport.
> Périmètre : les 555 exercices de l'app (454 de la livraison + 101 prises en main S0), parcours dans l'ordre I → XII, et entrées par VI (clé de fa), IX (ut 3), XI (ut 4) et XII (deux clés).

## En bref

**20 constats : 3 bloquants, 10 gênants, 7 à surveiller.**

1. **La courbe est en dents de scie, et presque toutes les marches se trouvent au passage S1 → S2.** Chaque chapitre repart à 60 avec l'aide. L'Exercice 2 monte ensuite d'un cran de tempo, relève `deltaMax` de 2 à 3, ajoute des cellules et élargit souvent la tessiture de 5 notes ou plus, au moment même où l'aide disparaît. **59 des 97 passages S1 → S2 dépassent les deux crans de SEQ-04** (55 des 76 chapitres à nouveauté). Ni SEQ-04 ni SEQ-01 (« une nouveauté apparaît d'abord isolée en D/R/L ») ne sont vérifiés par le lint, d'où la plupart des constats.
2. **Les trois points bloquants :**
   - les doubles croches en 6/8 : V-5-S2 et VIII-3-S2 demandent **3,04 notes/s** (61 notes en 20 s), contre 0,88 au chapitre précédent ;
   - XI-2-S2 contient **trois notes de clé d'ut 4 jamais montrées** (mi3, fa3, sol3), soit environ 4,7 occurrences par tentative pour 3 erreurs tolérées ;
   - l'entrée par XI pour un débutant complet : croche et noire pointée apparaissent sans aide dès XI-1-S2.
3. **Le seuil de 85 % agit comme une falaise** sur la fiabilité par note. À 85 % de notes justes, un joueur réussit environ une tentative sur deux, quelle que soit la longueur. À 80 %, il n'en réussit plus qu'une sur cinq à une sur trois (tableau au §2). Le risque se concentre là où la densité dépasse environ 2 notes/s sans aide (19 exercices requis), et sur les exercices à très peu de notes, où une seule faute fait échouer (V-1-R : 0 erreur tolérée).
4. **Corrections prioritaires (données seules, effets simulés sur le vrai moteur) :**
   - V-5, VIII-3 (et V-6, VIII-4) : retirer les cellules à 9 notes, cibler `focus` sur les cellules à 7 notes, S2 à 60 → **3,04 → 2,10 n/s** ;
   - XI-2-L : tessiture sol2–sol3 avec 6 notes imposées → mi3, fa3 et sol3 lues avec leur nom (environ 9 occurrences par tentative) avant le S2 ;
   - S2 des chapitres à nouveauté : `deltaMax` gelé à celui du S1 et tessiture plafonnée à 8 notes → étendue jouée de 10–13 degrés ramenée à 5–7, sauts ≥ quarte de 19–27 % ramenés à 0 %.

---

## 1. Méthode

**Mesure.** Chaque exercice est généré 12 fois (graines 0 à 11) sur la même chaîne que l'app (`exerciseLoader`) :
- `generateExercise` → `toTimeline` → `stampTimeline`, sur le curriculum transpilé `src/data/v3/curriculum.json` ;
- l'aide est posée par `appliquerProfil` (`etayage.js`).

Les scripts tournaient sous Node avec un crochet de résolution des imports sans extension : ni Vite, ni Playwright, ni tests, aucun port. Ils sont restés dans le scratchpad, non versionnés. Les corrections proposées ont été **simulées** de la même façon : copie de la livraison, patch, `withAid` du transpile, puis génération. Aucune erreur de génération sur 12 graines.

**Métriques** (moyennes sur les 12 tentatives) :
- **N** : nombre d'événements, c'est-à-dire le dénominateur de la précision (`tally.totalNotes`, silences et notes liées compris) ;
- **frappes** : notes à frapper (hors silences et notes liées) ;
- **n/s** : frappes par seconde de musique ; **pointe** : maximum de n/s sur une mesure ;
- **≤ c** : part des frappes de valeur ≤ croche (poids ≤ 128) ; **≤ 96** : doubles croches, triolets, quadrolets ;
- **IOI min** : écart minimal entre deux frappes ;
- **étendue** : écart en degrés diatoniques entre la note la plus grave et la plus aiguë effectivement jouées ;
- **sauts ≥ quarte** : part des intervalles d'au moins 3 degrés ;
- **part aidée** : notes portant leur nom ;
- **erreurs tolérées 1★** : nombre maximal de fautes encore compatibles avec la 1re étoile.

**Barème, tel qu'il est codé :**
- **Précision** = justes / (événements + frappes dans le vide), arrondie (`results.js`). Silences et notes liées sont validés d'office sauf frappe pendant le silence, ce qui facilite les exercices à silences.
- **Fenêtre de validation** = max(150 ms, 20 % d'une **noire**) : ±200 ms à 60, ±167 à 72, ±150 à 88 et au-delà (`Validator.js`).
- **Frappe en avance :** hors fenêtre mais moins de 1,2 s avant la note suivante, elle fait rater cette note (`pressHandler.js`).
- **Audio :** la mélodie est toujours jouée (autoplay). Le temps est donc donné à l'oreille ; la difficulté d'un S tient surtout à **lire et nommer** assez vite.
- **Économie :** toute tentative notée finie à 0 ★ coûte un jeton (`GameScreen.jsx`, l. 336) — R, L, S0 et bonus compris.
- **Filet :** il ne relève l'aide que si l'exercice n'en avait aucune (`part <= 0`), donc jamais sur S1.

**Ce que le lint garantit déjà (non re-signalé) :** SEQ-02 (matériau d'appui des S1), SEQ-03 (R/L/S1 ≤ 60, S2 ≤ 72 en chapitre à nouveauté), SCO-03, SCO-05 et SEQ-06 (rampes faisables à deux étoiles). **Non lintés : SEQ-01 et SEQ-04.**

**Hypothèse de calibrage, à valider.** Pour un débutant de quelques semaines, environ 1,5 note/s soutenue sur du matériau récent paraît tenable ; au-delà de 2 n/s en moyenne (2,5 en pointe) sans aide, la fiabilité par note passe probablement sous 85 %. Ce repère se vérifie directement : le journal local (`exercise_done` : id, étoiles, précision, aide) exporté par les testeurs donne la distribution réelle des précisions par exercice.

## 2. Vue d'ensemble

| Type | D | R | L | S0 | S1/S1B/S2… | B |
|---|---|---|---|---|---|---|
| Exercices | 49 | 61 | 22 | 101 | 221 | 101 |

Sur les **405 exercices requis**, 184 ont l'aide complète (R, L, S0), 104 l'aide sur la moitié (S1, S1B) et **117 aucune aide** (S2 et suivants).

Densité des 117 requis sans aide : minimum 0,40 · 1er quartile 0,83 · **médiane 1,10** · 3e quartile 1,52 · **maximum 3,04 n/s**.

**Sauts à l'entrée d'un chapitre** (n/s du S1 rapporté au S2 du chapitre précédent) :

| Chapitre | Avant → après | Rapport |
|---|---|---|
| V-5 | 0,88 → 2,51 | ×2,86 |
| VIII-3 | 0,86 → 2,43 | ×2,81 |
| V-2 | 0,57 → 1,41 | ×2,49 |
| III-1 (depuis II-11) | 1,00 → 1,67 | ×1,67 |
| III-7 | 0,93 → 1,54 | ×1,66 |
| IV-2 | 0,67 → 1,08 | ×1,60 |
| II-1 | 0,74 → 1,14 | ×1,53 |
| VII-1 | 0,76 → 1,14 | ×1,50 |
| VII-7 | 1,18 → 1,72 | ×1,46 |

**Le seuil de 85 % est une falaise.** Probabilité d'obtenir la 1re étoile selon la fiabilité par note *p* (modèle binomial, notes indépendantes) :

| N (erreurs tolérées) | p = 0,80 | 0,85 | 0,88 | 0,90 | 0,93 | 0,95 |
|---|---|---|---|---|---|---|
| 6 (0) | 26 % | 38 % | 46 % | 53 % | 65 % | 74 % |
| 11 (1) | 32 % | 49 % | 61 % | 70 % | 82 % | 90 % |
| 24 (3) | 26 % | 50 % | 68 % | 79 % | 92 % | 97 % |
| 40 (6) | 29 % | 61 % | 80 % | 90 % | 98 % | 100 % |
| 60 (9) | 21 % | 59 % | 82 % | 93 % | 99 % | 100 % |

Jetons perdus en moyenne avant la réussite, pour une probabilité de succès *q* par tentative : 0,4 (q = 0,7), 1,0 (q = 0,5), 2,3 (q = 0,3), **4,0 (q = 0,2), soit presque la réserve entière** (5 jetons). Le filet adoucit l'Exercice 2 après un premier échec, mais ce premier échec est déjà payé.

---

## 3. Constats par axe

Identifiants : **B** = bloquant · **G** = gênant · **S** = à surveiller.

### Axe 1 — Sauts et plateaux

#### B1 — Doubles croches en 6/8 : V-5, V-6, VIII-3, VIII-4 · bloquant

| Exercice | Tempo | Durée | Frappes | n/s | Pointe | ≤ c | ≤ 96 | IOI min / fenêtre | Erreurs tolérées 1★ |
|---|---|---|---|---|---|---|---|---|---|
| V-5-S1 (aide ½) | 60 | 24 s | 60 | 2,51 | 3,0 | 90 % | 75 % | 250 / ±200 ms | 9 sur 60 |
| **V-5-S2** | 72 | 20 s | 61 | **3,04** | **3,6** | 91 % | 74 % | 208 / ±167 ms | 9 sur 61 |
| **VIII-3-S2** | 72 | 20 s | 61 | **3,04** | **3,6** | 90 % | 74 % | 208 / ±167 ms | 9 sur 61 |
| V-6-S2 / VIII-4-S2 | 72 | 20 s | 48 | 2,39 / 2,40 | 2,7 / 2,8 | 84–85 % | 61 % | 208 / ±167 ms | 7 sur 48 |

- **Saut ×2,9 par rapport au chapitre précédent** (V-4-S2 0,88 ; VIII-2-S2 0,86 n/s). Ce sont les quatre exercices requis les plus denses de la méthode ; même la prise en main V-5-S0 demande 2,57 n/s.
- **Cause en données :** toutes les cellules sauf `2 NP` contiennent les 6 doubles croches. Les cellules `6dc 3c` et `3c 6dc` font 9 notes par mesure. Le quota de nouveauté (≥ 50 % des mesures libres sur le `focus`) interdit de les diluer.
- **S1 sans recours :** le filet ne fait rien sur S1 (S6). Un échec sur V-5-S1 ou VIII-3-S1 (2,4–2,5 n/s) rejoue avec la même aide et recoûte un jeton.
- **Correction :**
  - V-5-S1/S2 et VIII-3-S1/S2 : retirer `6dc 3c` et `3c 6dc` (les garder pour le bonus), ajouter `NP 3c`, poser `focus: ["6dc NP", "NP 6dc"]` (lu tel quel par `resolve.js`), S2 `tempo: 60`. **Simulé : S1 2,51 → 2,25 n/s ; S2 3,04 → 2,10 n/s, pointe 3,6 → 2,5.** Lint conforme (SEQ-03 ≤ 72).
  - V-6/VIII-4 : même traitement, `focus` sur `c 4dc NP` et `NP c 4dc`, S2 à 60.

#### G1 — Passage S1 → S2 en triple marche (SEQ-04 non respecté, non linté) · gênant

- 59 des 97 passages S1 (ou S1B) → S2 dépassent deux crans ; dans 55 cas, il s'agit d'un chapitre à nouveauté.
- **Cas type (59 cas) :** tempo +1 cran (60 → 72), `deltaMax` 2 → 3, cellules ajoutées, soit 3 crans, plus une tessiture élargie de 5 notes ou davantage (25 cas). Aide moitié → aucune, simultanément.
- **Cas à 4 crans** (le S1 étant en `deltaMax` 1, style gamme) : IX-6, X-1, XI-2.
- **Effet mesuré du relèvement de `deltaMax` :** les sauts ≥ quarte passent de 0 % au S1 à **14–27 %** au S2 (II-3, II-7, III-1, III-5, III-8, V-5, VII-6, IX-6, X-1, XI-2…).
- **Correction :**
  - dans les S2 des chapitres `intro.type` notes ou rythme : `deltaMax` = celui du S1 (en pratique 2). **Simulé : sauts ≥ quarte 14–27 % → 0 %**, densité inchangée. Le relèvement de `deltaMax` passe aux bonus et aux chapitres de révision/synthèse ;
  - ajouter au lint un étage SEQ-04 (compter tempo + `deltaMax` + extension de cellules + longueur entre exercices consécutifs, seuil 2). C'est de l'outillage, pas le moteur.

#### G2 — Tessiture des S2 dans les chapitres de notes · gênant

L'étendue jouée triple ou quadruple au S2, à 72 et sans aide :

| Chapitre | S1 : notes / étendue | S2 : notes / étendue | Sauts ≥ quarte au S2 |
|---|---|---|---|
| II-9 | 5 / 2,2 | 10 / 9,0 | 22 % |
| III-3 | 5 / 2,4 | 12 / 10,4 | 21 % |
| III-10 | 5 / 3,6 | 13 / 10,3 | 19 % |
| III-11 | 6 / 5,0 | **15 / 12,2** | 20 % |
| IV-5 | 5 / 3,0 | **15 / 13,0** (do4–do6) | 25 % |
| VII-6 | 5 / 4,0 | 11 / 8,8 | 19 % |
| VII-9 | 6 / 4,1 | 12 / 10,4 | 23 % |
| VII-11 | 5 / 2,5 | **15 / 12,6** (do2–do4) | 24 % |
| IX-6 | 7 / 6,0 | 13 / 9,8 | 21 % |
| X-1 | 5 / 1,6 | **15 / 11,7** | 27 % |
| XI-2 | 7 / 6,0 | 13 / 10,3 | 18 % |

**Correction :** S2 plafonné à 8 notes conjointes autour des nouveautés, tonique comprise (MEL-03 respecté), `deltaMax` 2. La grande tessiture va au bonus ou à la synthèse du livre.
- Pools proposés : III-3-S2 la3–la4, III-10-S2 sol4–fa5, III-11-S2 si4–la5, IV-5-S2 do5–do6, VII-6-S2 fa2–mi3, VII-9-S2 sol3–mi4, VII-11-S2 do2–do3, II-9-S2 sol4–mi5.
- **Simulé : étendue 9–13 → 5–7 degrés, sauts ≥ quarte → 0 %, densité inchangée.**

#### G3 — Doubles croches binaires : III-1-S2 et S2 denses à 12 notes · gênant

- **Passage du livre II au livre III :**

  | Exercice | n/s | ≤ croche | ≤ 96 | Tessiture |
  |---|---|---|---|---|
  | II-11-S2 | 1,00 | 28 % | — | — |
  | III-1-S1 | 1,67 | 57 % | 53 % | 3 notes |
  | **III-1-S2** | **2,01** (pointe 2,3) | 58 % | 51 % | 7 notes, `deltaMax` 3, sauts 14 % |

- **Autres S2 requis entre 1,7 et 2,1 n/s avec une tessiture de 11 à 13 notes :** III-7-S2 (1,83), III-8-S2 (1,88), III-9-S2 (1,76), VII-7-S2 (2,09, 11 notes), X-3-S2 (1,74, 13 notes), XI-4-S2 (1,92, 13 notes). À partir du milieu des livres III, VII, X et XI, les S2 des chapitres rythmiques montent à 11–13 notes (la3–mi5 ou équivalent).
- **Correction :**
  - III-1-S2 : pool do4–sol4, `deltaMax` 2, retirer les 4 cellules à 8 notes (`4dc 2c 2n`, `n 4dc 2c n`, `2c 4dc 2n`, `4dc 2n 2c`), ajouter `4 noires` et `n 2c 2n`. **Simulé : 2,01 → 1,83 n/s, étendue 6 → 4, sauts 14 → 0 %** ;
  - sur les autres : plafond de tessiture de G2 (7–8 notes) dans les S2 des chapitres rythmiques, la tessiture complète étant réservée au bonus.

#### G4 — Figures annoncées dans l'intro mais pratiquées seulement au S2 (SEQ-01) · gênant

| Chapitre | Figure annoncée | Absente de | Première apparition | Fréquence au S2 |
|---|---|---|---|---|
| V-6 | « Doubles croche doubles » (`2dc c 2dc`) | R et S1 | S2 | ≈ 2,4 mesures sur 8 |
| V-7 | « Croche pointée et trois doubles » (`CP 3dc`, 6 cellules) | R et S1 | S2 | ≈ 2,7 mesures sur 8 |
| V-10 | « Quadrolet » (nouveau groupe irrégulier) | R et S1 | S2 | ≈ 1,5 mesure sur 8 |
| V-11 | 12/8 (et la ronde pointée) | R et S1, en 9/8 | **tout le S2** | — |
| V-11 | 3/8 | tout requis | bonus uniquement | — |

Mineur : II-2-S2 introduit sans aide 7 cellules de croches en 3/4 ; le 3/4 et la croche sont toutefois connus.

**Correction :**
- ajouter les cellules annoncées au R et au S1 de V-6, V-7 et V-10 (le `focus` les fera alors sortir avec l'aide), ou les retirer du S2 au profit du bonus ;
- V-11-S2 en 9/8 avec les cellules du S1. **Simulé : N 54 → 39, 1,35 → 1,30 n/s.** Le 12/8 et le 3/8 passent dans V-12, dont le R mêle déjà 6/8 et 9/8.

#### S1 — Plateaux · à surveiller

- **Livre I :** 31 exercices requis entre 0,36 et 0,91 n/s, aucune valeur plus courte que la noire, au plus 5 notes. I-3 (ronde et pause) descend à 0,36–0,40 n/s : environ 12 frappes en 32 s. VI (23 requis) et IX (26 requis) suivent le même profil.
- Cohérent pour des livres Découverte : le risque est l'ennui, pas l'échec.
- Le plateau de XII est traité en G8.

#### S2 — Densité à l'entrée des chapitres rythmiques · à surveiller

V-2 (×2,49, 79 % de croches), IV-2 (×1,60), II-1 (×1,53), VII-1 (×1,50) et IX-5 (×1,40) : le saut accompagne la figure nouvelle, mais l'écart entre frappes reste confortable (≥ 332 ms à 60). Les entrées en doubles croches (V-5, VIII-3, III-1, VII-7), où l'écart descend à 250 ms, sont traitées en B1 et G3. Rien à faire sans retour de playtest contraire.

### Axe 2 — Seuils d'étoiles, tolérance et densité

19 exercices requis sans aide franchissent au moins un de ces critères : ≥ 1,75 n/s, pointe ≥ 2,5, ou ≥ 40 % de valeurs ≤ 96 à 72. La plupart relèvent de B1, G3 et G9. V-7-S2, V-8-S2, VIII-5-S2 et VIII-6-S2 (1,9–2,0 n/s) prolongent la série du 6/8 : leur appliquer le traitement de B1 (`focus`, S2 à 60) si le playtest le confirme.

| Exercice | Tempo | Mesures | Durée | Frappes | n/s | Pointe | ≤ c | ≤ 96 | IOI min / fenêtre | Notes / étendue | Erreurs 1★ |
|---|---|---|---|---|---|---|---|---|---|---|---|
| V-5-S2 | 72 | 8 | 20 s | 61 | 3,04 | 3,6 | 91 % | 74 % | 208 / ±167 | 7 / 6 | 9 sur 61 |
| VIII-3-S2 | 72 | 8 | 20 s | 61 | 3,04 | 3,6 | 90 % | 74 % | 208 / ±167 | 7 / 6 | 9 sur 61 |
| V-6-S2 | 72 | 8 | 20 s | 48 | 2,39 | 2,7 | 84 % | 61 % | 208 / ±167 | 7 / 6 | 7 sur 48 |
| VIII-4-S2 | 72 | 8 | 20 s | 48 | 2,40 | 2,8 | 85 % | 61 % | 208 / ±167 | 7 / 6 | 7 sur 48 |
| VII-7-S2 | 72 | 8 | 27 s | 56 | 2,09 | 2,3 | 60 % | 54 % | 208 / ±167 | 11 / 10 | 8 sur 56 |
| V-13-S2 | 88 | 12 | 25 s | 51 | 2,08 | 2,8 | 64 % | 30 % | 170 / ±150 | 10 / 9 | 8 sur 53 |
| V-12-S2 | 88 | 12 | 29 s | 59 | 2,07 | 3,3 | 70 % | 23 % | 170 / ±150 | 10 / 9 | 9 sur 59 |
| III-1-S2 | 72 | 8 | 27 s | 54 | 2,01 | 2,3 | 58 % | 51 % | 208 / ±167 | 7 / 6 | 8 sur 54 |
| VIII-7-S2 | 88 | 12 | 25 s | 49 | 2,01 | 2,8 | 66 % | 26 % | 170 / ±150 | 15 / 14 | 8 sur 52 |
| V-7-S2 | 72 | 8 | 20 s | 40 | 1,98 | 2,6 | 66 % | 32 % | 208 / ±167 | 7 / 6 | 6 sur 40 |
| V-8-S2 | 72 | 8 | 20 s | 40 | 1,98 | 2,4 | 65 % | 23 % | 208 / ±167 | 7 / 6 | 6 sur 40 |
| XI-4-S2 | 72 | 8 | 27 s | 51 | 1,92 | 2,3 | 56 % | 42 % | 208 / ±167 | 13 / 11 | 7 sur 51 |
| VIII-6-S2 | 72 | 8 | 20 s | 38 | 1,91 | 2,4 | 64 % | 22 % | 208 / ±167 | 7 / 6 | 5 sur 38 |
| VIII-5-S2 | 72 | 8 | 20 s | 38 | 1,89 | 2,4 | 62 % | 34 % | 208 / ±167 | 7 / 6 | 5 sur 38 |
| III-8-S2 | 72 | 8 | 27 s | 50 | 1,88 | 2,3 | 56 % | 53 % | 277 / ±167 | 12 / 11 | 7 sur 50 |
| III-7-S2 | 72 | 8 | 27 s | 49 | 1,83 | 2,1 | 56 % | 30 % | 208 / ±167 | 12 / 11 | 7 sur 49 |
| III-2-S2 | 72 | 8 | 27 s | 47 | 1,76 | 2,0 | 51 % | 31 % | 208 / ±167 | 7 / 6 | 7 sur 47 |
| III-9-S2 | 72 | 8 | 27 s | 47 | 1,76 | 1,9 | 50 % | 48 % | 208 / ±167 | 12 / 11 | 8 sur 55 |
| X-3-S2 | 72 | 8 | 27 s | 46 | 1,74 | 2,2 | 51 % | 42 % | 208 / ±167 | 13 / 11 | 7 sur 49 |

Côté temps, la fenêtre reste généreuse : sa demi-largeur (±167 ms) vaut 80 % de l'écart entre deux doubles croches à 72 (208 ms), et la mélodie jouée donne le temps. Le budget d'erreurs, de 15 % du N, n'est donc pas trop serré en soi. **C'est la vitesse de lecture demandée qui fait passer la fiabilité par note sous 85 %.** Il faut donc agir sur la densité (B1, G3, G9) plutôt que sur les seuils. Baisser la 1re étoile à 80 % sur ces seuls exercices serait un palliatif possible (champ `stars` d'exercice), mais il masquerait le saut sans le corriger.

#### G5 — Exercices à très peu d'événements : une faute suffit à échouer · gênant

- **V-1-R :** environ 6 événements (5 au minimum), seuil 85 %, donc **aucune erreur tolérée**. Un joueur fiable à 95 % par note échoue 26 % du temps ; à 90 %, 47 %. Chaque échec coûte un jeton, sur le **premier exercice noté du livre V**.
- **I-3-R :** 5 événements en moyenne, 4 selon la graine, donc 0 erreur tolérée à 80 % dans ces tirages.
- **Une seule erreur tolérée (au N minimal) :**
  - les R de I-4, I-6, I-7, II-2, II-6, II-10, III-6, IV-1, V-3, V-4, VI-3, VI-5, VIII-1, VIII-2, X-5 et XI-5 ;
  - V-1-S0, V-1-S1 et V-1-S2 (11–12 événements) ;
  - II-2-S1 et I-3-S2 (minimum 9).
- **Correction :**
  - `measures: 8` sur ces R (carrure autorisée). **Simulé : V-1-R 6 → 13 événements (2 erreurs) ; I-3-R 5 → 12 ; VI-3-R 6 → 18 ; II-2-R 9 → 20 (3 erreurs)** ;
  - V-1-S0/S1/S2 : `measures: 16`. **Simulé : 12 → 24 événements, 3 erreurs.**

#### S3 — Mesures composées et 2/2 : tolérance et pulsation lente · à surveiller

- La fenêtre se calcule sur la noire (`note.beatSec = 60/tempo`). En 6/8 à « 60 », ±200 ms ne représentent que 13 % de la pulsation réelle (noire pointée, 1,5 s), contre 20 % en 4/4.
- Le 6/8 à « 60 » correspond à une pulsation de 40, sous le plancher de 56 de SCO-02 (« tenir une pulsation lente est un piège de débutant »). Le 2/2 à 60 correspond à une blanche à 30.
- V-1, qui ne contient que des noires pointées et des blanches pointées (1,5 à 3 s par note), cumule pulsation lente, petit N (G5) et la règle de frappe en avance (< 1,2 s).
- **Correction :**
  - arbitrage à prendre : lire SEQ-03 et SCO-02 sur la **pulsation** pour le 6/8 et le 2/2, ce qui permettrait V-1-S1 à 88 (noire pointée ≈ 59) ;
  - à défaut, appliquer au moins G5 à V-1.

#### S4 — Variance d'une tentative à l'autre · à surveiller

Selon la graine, le nombre de frappes varie fortement : I-3-S1 de 6 à 15, IX-6-S2 de 10 à 36, XII-4-S4 de 9 à 39, XII-2-S0 de 6 à 20. Les cellules longues (ronde, pause) font varier N, donc le budget d'erreurs, du simple au triple. Le passage à 12 mesures resserre la variance relative ; sinon, à observer dans le journal.

### Axe 3 — Rampes de déblocage (`starsRequired`)

#### S5 — Rampes inertes dans I, VI et IX, tendues à la fin de III, VII et XII · à surveiller

Repère de comparaison : les étoiles garanties par la seule complétion, soit 1 ★ sur chaque exercice requis en amont. Avec les prises en main S0 ajoutées au transpile, ce plancher est plus haut que celui sur lequel le lint a calé les rampes.

- **I, VI et IX :** `starsRequired` reste partout sous les étoiles garanties (écart de −2 à −5). La rampe ne demande rien, la condition « chapitre précédent terminé » suffit. **II-2 et II-3 :** écart 0.
- **Autres livres :** 1,13 à 1,47 ★ par exercice requis. Aucune rampe ne dépasse le nombre d'exercices aidés en amont (R, L, S0), donc **aucun blocage strict** pour qui obtient 2 ★ sur les exercices aidés.
- **Rampes les plus tendues :**

  | Chapitre | Étoiles requises | Exercices requis en amont | Étoiles en plus de la complétion | Exercices aidés en amont |
  |---|---|---|---|---|
  | III-12 | 66 | 45 | +21 | 22 |
  | III-11 | 59 | — | +18 | 20 |
  | VII-12 | 56 | — | +16 | 20 |
  | XII-2 / XII-3 / XII-4 | 8 / 16 / 24 | — | +1 / +2 / +3 | 1 / 2 / 3 |

  À III-12, il faut donc 2 ★ sur 21 des 22 exercices aidés, ou des bonus. Or rejouer pour gagner des étoiles coûte un jeton à chaque 0 ★, bonus compris.
- **Correction :**
  - III-11 59 → 56 et III-12 66 → 60 (ratio ≤ 1,33 ★ par exercice, comme les autres livres) ; XII-2/3/4 laissés tels quels ou ramenés à 7/14/21 ;
  - I, VI et IX : rien à faire, sauf à vouloir que les 2 ★ comptent ; dans ce cas, environ 1,1 × la complétion.

### Axe 4 — Rôle de l'aide

- **L'Exercice 1 est bien conçu.** L'aide couvre 51 à 70 % des notes (mesuré) ; la coupure tombe au début de A′, qui rejoue le rythme de A (forme `AA'`, `formPlan.js`). La moitié sans aide relit ce qu'on vient de voir nommé.
- **L'aide s'arrête trop tôt à l'Exercice 2,** parce que c'est l'exercice qui change trois axes ou plus (G1). Sur les 117 exercices requis sans aide, beaucoup sont aussi le premier contact avec un élément nouveau (SEQ-01) :
  - parcours dans l'ordre : V-10-S2 (quadrolet), V-11-S2 (12/8, ronde pointée), V-6-S2 et V-7-S2 (cellules annoncées), XI-2-S2 (mi3, fa3, sol3) ;
  - entrées : VI-5-S2 (3/4), VII-12-S2 (liaison), X-2-S2 (2/4), XI-1-S2 (croche, noire pointée), XI-2-S2 (ronde, soupir, blanche pointée), XII-1-S3 (fa, sol), XII-2-S3 (blanche pointée), XII-2-S4 (la4, si4), XII-3-S3 (3/4).
- **Correction privilégiée : déplacer le premier contact** vers R, S0 ou S1 (G4, G6, G7, G8) plutôt qu'étendre l'aide.
- **Si l'on veut quand même étendre l'aide :** `aidFor` (transpile) déduit le niveau du suffixe. Il faut soit renommer en `S1B` (niveau moitié, mais l'id change), soit une ligne de transpile qui lise un champ source explicite (par exemple `aidLevel`).

#### S6 — Le filet ne s'applique pas à l'Exercice 1 · à surveiller

`profilDeTentative` ne relève l'aide que si `part <= 0`. Un S1 raté rejoue donc avec la même moitié d'aide et recoûte un jeton à chaque 0 ★. C'est sans conséquence quand le S1 est léger, mais sensible sur les S1 denses : V-5-S1 2,51, VIII-3-S1 2,43, V-6-S1 2,19, VIII-4-S1 2,16 n/s. La correction de B1 suffit ; aucune action moteur nécessaire.

### Axe 5 — Entrées par d'autres clés

#### B2 — XI-2-S2 : trois notes jamais montrées · bloquant (tous les parcours)

- **Contenu actuel de XI-2 :**
  - intro : sol2, la2, si2, sol4, la4, si4 ;
  - L : sol2–ré3, avec do3 et ré3 non annoncés ;
  - S0/S1 : do4–si4, avec fa4 non annoncé ;
  - **S2 : si2–sol4, soit 13 notes.**
- **Mi3, fa3 et sol3 n'apparaissent qu'au S2**, sans aide et à 72. Ce sont pourtant les notes du milieu de la portée d'ut 4 (1er interligne, 2e ligne, 2e interligne).
- **Mesuré :** 2,1 + 1,2 + 1,4 = **4,7 occurrences par tentative sur 23,6 notes, pour 3 erreurs tolérées sur 24**. S'y ajoutent do3 et ré3 (2,7 occurrences) : do3 n'apparaît qu'environ 1,6 fois en L, ré3 pratiquement jamais (sur 20 graines). Au total, XI-2 compte **12 notes nouvelles** (6 annoncées, 6 non annoncées), quand le maximum ailleurs est de 6 (IX-6).
- **Correction :**
  - XI-2-L : `pool` sol2–sol3 (8 notes), `required: ["SOL2","LA2","SI2","MI3","FA3","SOL3"]`. **Simulé, sans erreur de génération : mi3 3,8, fa3 3,9, sol3 1,4 occurrences par tentative, avec leur nom.**
  - Compléter `intro.new`/`shown` (do3 à sol3, fa4).
  - Mieux : scinder XI-2 en deux chapitres, graves puis aigus.
  - Garde-fou : un étage de lint vérifiant que le pool des S2 est inclus dans les notes vues en L, S0 ou S1 du chapitre ou en amont.

#### B3 — Entrée par XI (débutant complet) : prérequis rythmiques jamais enseignés · bloquant

XI est le seul livre de clé d'ut 4, donc nécessairement l'entrée dans cette clé. Ce qu'il suppose acquis :

| Élément | Première apparition dans XI | Aide |
|---|---|---|
| noire, blanche, 4/4 | XI-1-D (démo de notes) | jamais présentés |
| **croche, noire pointée** | **XI-1-S2** | aucune |
| ronde, soupir, blanche pointée | XI-2-S2 | aucune |
| pause | XI-2-S3 (bonus) | — |
| croche pointée, lombard, double croche | XI-3-R (« Révision », sans démo) | — |
| double croche, syncope, triolet | XI-4-R (3 familles d'un coup, sans démo) ; XI-4-S2 à 1,92 n/s | — |
| 6/8, noire pointée, groupe de 3 croches | XI-5-R (sans démo) | — |

Sans objet pour qui a fait les livres II et III : le titre « Niveau » le laisse entendre, mais rien ne l'exige.

**Correction :**
- **minimale :** déclarer le prérequis (livres II et III) dans le `desc` de XI ;
- **si XI doit rester une porte d'entrée :**
  - XI-1-S2 limité à noire et blanche (retirer `2c 3n`, `n 2c 2n`, `NP c 2n`, à garder pour le bonus) ;
  - XI-2-S2 sans silences ni blanche pointée (`rests: false`) ;
  - une démo D en tête de XI-3, XI-4 et XI-5 (copies de III-4-D, III-1-D, III-8-D et V-1-D, clé héritée du livre).

#### G6 — Entrée par VI (VI → VII → VIII) · gênant

- **VI-5-S2 :** le 3/4 apparaît pour la première fois à l'Exercice 2 sans aide (6 cellules nouvelles, tessiture 5 → 7). Le R et le S1 ne sont qu'en 2/4.
- **VI-3 :** ronde, pause, blanche pointée et soupir arrivent en même temps, contre 3 chapitres dans le livre I. La densité est faible (0,41 n/s), donc acceptable.
- **VII-12-S2 (synthèse, requis) :** liaisons de prolongation, **4,6 par tentative** (10,4 au bonus). La liaison n'est plus enseignée dans les livres VI à VIII depuis le retrait de VII-3 le 21/09. Pour qui ne la connaît pas, frapper la note liée fait rater la note suivante (frappe en avance), sur un budget de 8 erreurs.
- **VII-10 :** triolet, syncope et syncopette arrivent ensemble, en R seul, sans démo.
- **Correction :**
  - VI-5-R en segments 2/4 × 2 + 3/4 × 2 (comme IV-6-R), et un segment 3/4 dans VI-5-S1 ; ou bien VI-5-S2 en 2/4, avec le 3/4 au bonus et à VI-6 ;
  - retirer `ties` de VII-12-S2 et de VII-12-S3 ;
  - ajouter une démo à VII-10 (copies de III-8-D, III-5-D et III-7-D en clé de fa).

#### G7 — Entrée par IX (IX → X) · gênant

- **X-2-S2 :** premier 2/4 du parcours ut 3, sans aide, avec 8 cellules nouvelles (dont `4c 24`). Tessiture 7 → 13 notes (étendue 9,3), sauts ≥ quarte 31 %, et seulement 17 événements, donc 2 erreurs tolérées. Le 3/4 n'apparaît qu'au bonus.
- **X-3, X-4 et X-5 :** deux à trois familles nouvelles par chapitre (doubles croches + contretemps ; croche pointée + lombard + syncope ; 6/8), en R seul, sans démo.
- **X-6 :** S1 directement à 88 sur 12 mesures, puis S2 à 100, soit deux crans au-dessus de X-5-S2.
- **IX-6 :** 6 notes nouvelles, dont les trois graves vues pour la première fois en S0. **X-1-S2 :** 15 notes juste après 4 notes nouvelles.
- **Correction :**
  - X-2-R en segments 4/4 × 2 + 2/4 × 2 ; X-2-S2 avec la tessiture du S1 (7 notes) et `deltaMax` 2 ;
  - une démo dans X-3, X-4 et X-5 ;
  - X-1-S2 plafonné selon G2 ;
  - X-6-S1 à 72.

#### G8 — Entrée par XII (deux clés) · gênant

- **Aide quasi absente :** 7 exercices requis par chapitre, dont **5 sans aide** (S2 à S6). L'alternance des clés toutes les 2 mesures s'impose dès la prise en main XII-1-S0, sans démo ni L.
- **Plateau de doublons :** dans XII-1, S1 et S2 sont identiques (60, do–mi), de même S3 et S4 (do–sol), et S5 et S6 (72). XII-2 à XII-4 suivent le même schéma. 28 exercices requis restent entre 0,47 et 0,94 n/s, avec les rythmes du livre I.
- **Prérequis :** côté fa, les notes do3–si3 viennent de VI (vérifié, transposition de −1 octave). Côté sol, **la4 et si4** (II-3, absents du livre I) apparaissent sans aide à partir de XII-2-S4 (≈ 2,9 occurrences par tentative sur 18 notes, 3 erreurs tolérées). La blanche pointée (XII-2-S3) et le 3/4 (XII-3-S3) apparaissent eux aussi pour la première fois sans aide.
- **Correction :**
  - faire de `clefEvery` l'axe de progression : 4 sur XII-1-S1/S2 (simulé : sauts ≥ quarte 13 → 4 %, aucune erreur), 2 ensuite, 1 dans XII-4 ;
  - transformer les doublons en vraie marche (tempo 60 → 72 → 88, `clefEvery` 4 → 2 → 1) ;
  - aide moitié sur XII-1-S2/S3 (renommage en S1B, ou la ligne de transpile décrite à l'axe 4) ;
  - pools de XII-2 limités à do–sol, ou prérequis II-3 déclaré dans le `desc`.

### Axe 6 — Bonus, révisions et synthèses

#### G9 — Synthèses et consolidations à 88 trop denses · gênant

- **V-12-S2 :** 88, trois chiffrages (6/8, 9/8, 6/8), 12 mesures, 2,07 n/s, pointe 3,3, 70 % ≤ croche.
- **V-13-S2 :** 88, 2,08 n/s, pointe 2,8.
- **VIII-7-S2 :** 88, 2,01 n/s, **15 notes do2–do4 (étendue 13,6)**, contre 7 notes dans les S2 de VIII-3 à VIII-6 (11 au S1 de la synthèse).
- **X-7-S2 et XI-7-S2 :** 6/8 à 88, deux chapitres après son introduction à 60/72, sur 15 notes.
- **Correction :**
  - ces S2 à 72, soit environ 1,7 n/s (la densité suit le tempo) ;
  - VIII-7-S2 avec le pool du S1 (fa2–si3, 11 notes).

#### G10 — Bonus extrêmes, alors qu'un échec coûte un jeton · gênant

- **Écart type avec le S2 du même chapitre** (101 bonus, médianes) : tempo +22 % (88 contre 72), n/s ×1,24, pointe ×1,30, sauts ≥ quarte +5 points. 22 bonus sont plus longs que le S2. 91 sur 101 sont en forme `through`, sans reprise, donc sans la lecture par blocs que permet la forme AA′ (les 10 bonus de synthèse sont en AABA′).
- **3e étoile :** elle exige zéro faute sur les 101 bonus. C'est conforme à SCO-01, mais elle reste quasi inatteignable.
- **Coût :** un bonus raté coûte un jeton comme un exercice requis (0 ★ → `perdJeton`). Or les bonus servent à combler les rampes (S5).
- **Bonus hors d'échelle :** V-11-S3 (3/8 à 88, **pointe 5,9 n/s**, écart de 170 ms), V-5-S3 et VIII-3-S3 (3,76 n/s, pointe 4,4), V-6-S3 et VIII-4-S3 (3,1, pointe 3,9), III-8-S3 (pointe 3,7).
- **Correction :** ces 6 bonus à 72, ou retirer `6dc 38`, `c 4dc 38` et `4dc c 38` de V-11-S3.

#### S7 — La révision II-10 est plus dure que la synthèse II-11 · à surveiller

| Chapitre | R | S1 | S2 | Bonus | n/s du S2 |
|---|---|---|---|---|---|
| II-10 (révision) | 72 | 72 | **88** (premier exercice requis à 88 de la méthode) | 100 | 1,42 |
| II-11 (synthèse) | — | 60 | 72 | 88 | 1,00 |

**Correction :** II-10-S2 à 72 et II-10-S3 à 88, ce qui aligne aussi la marche des bonus du livre (SCO-03).

---

## 4. Synthèse par gravité

| Id | Gravité | Où | Preuve chiffrée | Correction (données) |
|---|---|---|---|---|
| B1 | **Bloquant** | V-5, V-6, VIII-3, VIII-4 (S0, S1, S2) | S2 3,04 n/s (pointe 3,6) ; ×2,9 par rapport au chapitre précédent ; 74 % ≤ 96 | retirer `6dc 3c`/`3c 6dc`, `focus` sur les cellules à 7 notes, S2 à 60 → 2,10 n/s |
| B2 | **Bloquant** | XI-2-S2 | mi3, fa3, sol3 jamais montrées : 4,7 occurrences par tentative, 3 erreurs tolérées | XI-2-L sol2–sol3 avec 6 notes imposées ; `intro.new` complété ; voire scinder XI-2 |
| B3 | **Bloquant** (débutant complet) | XI-1-S2, XI-2-S2, XI-3/4/5 | croche, noire pointée, silences sans aide ; 3 familles d'un coup en XI-4 | prérequis dans le `desc`, ou S2 allégés et démos ajoutées |
| G1 | Gênant | S1 → S2 (59 sur 97) | tempo +1, `deltaMax` +1, cellules ajoutées ; sauts ≥ quarte 0 → 14–27 % | `deltaMax` du S2 = celui du S1 ; étage SEQ-04 au lint |
| G2 | Gênant | S2 des chapitres de notes (11) | étendue 2–6 → 9–13 degrés ; 10 à 15 notes | 8 notes max, `deltaMax` 2 → étendue 5–7 |
| G3 | Gênant | III-1-S2 ; S2 de III-7/8/9, VII-7, X-3, XI-4 | 1,74–2,09 n/s, 11–13 notes | III-1-S2 do–sol, 4 cellules retirées → 1,83 n/s ; plafond de tessiture |
| G4 | Gênant | V-6, V-7, V-10, V-11 | figure annoncée découverte au S2 ; 12/8 sur tout V-11-S2 | cellules ajoutées au R et au S1 ; V-11-S2 en 9/8 |
| G5 | Gênant | V-1-R (0 erreur) ; 16 R ; V-1-S0/S1/S2 | N de 5 à 12 ; 26–47 % d'échecs pour un joueur fiable à 90–95 % | R sur 8 mesures ; V-1 sur 16 mesures |
| G6 | Gênant | VI-5-S2, VII-12-S2, VII-10 | 3/4 sans aide ; 4,6 liaisons jamais enseignées ; 3 figures sans démo | 3/4 dans le R et le S1 ; retirer `ties` ; démo ajoutée |
| G7 | Gênant | X-2-S2, X-3/4/5, X-6, X-1-S2 | 2/4 sans aide (17 événements) ; R sans démo ; 88 → 100 | segments dans le R ; démos ; plafond de tessiture ; X-6-S1 à 72 |
| G8 | Gênant | XII (28 requis) | 5 sur 7 sans aide ; doublons ; la4/si4 | `clefEvery` 4 → 2 → 1 ; doublons en marche ; aide moitié sur S2/S3 |
| G9 | Gênant | V-12-S2, V-13-S2, VIII-7-S2, X-7-S2, XI-7-S2 | 88 BPM, 2,0–2,1 n/s ; 15 notes | S2 à 72 ; VIII-7-S2 avec le pool du S1 |
| G10 | Gênant | V-11-S3, V-5-S3, VIII-3-S3, V-6-S3, VIII-4-S3, III-8-S3 | pointes 3,7–5,9 n/s ; un échec coûte un jeton | tempo 72 ou cellules en doubles croches retirées |
| S1 | À surveiller | livres I, VI, IX | 0,36–0,91 n/s sur 23–31 requis | rien (Découverte) |
| S2 | À surveiller | V-2, IV-2, II-1, VII-1, IX-5 | ×1,4–2,5 à l'entrée, écarts ≥ 332 ms | rien sans playtest |
| S3 | À surveiller | 6/8 et 2/2, V-1 | fenêtre = 13 % de la pulsation ; pulsation à 40 | arbitrage SEQ-03/SCO-02 sur la pulsation |
| S4 | À surveiller | I-3-S1, IX-6-S2, XII-4-S4, XII-2-S0 | frappes ×2 à ×4 selon la graine | 12 mesures, ou suivi au journal |
| S5 | À surveiller | I/VI/IX (inertes) ; III-11/12, VII-12, XII | écart ≤ 0 ; +21 étoiles pour 22 aidés | III-11 → 56, III-12 → 60 |
| S6 | À surveiller | S1 denses (V-5, VIII-3, V-6, VIII-4) | filet inactif sur S1 | couvert par B1 |
| S7 | À surveiller | II-10 contre II-11 | S2 à 88 contre 72 | II-10-S2 à 72, S3 à 88 |

## 5. Corrections les plus rentables

Toutes en données, compatibles avec le lint actuel, à retranspiler (`curriculum:transpile`, l'étage 8 du lint le vérifie).

1. **V-5, VIII-3, V-6 et VIII-4 : dé-densifier** (B1).
   - Retirer `6dc 3c`/`3c 6dc` (ou leurs équivalents) des S1 et S2, ajouter `NP 3c` ;
   - poser `focus: ["6dc NP","NP 6dc"]` (V-6/VIII-4 : `c 4dc NP`, `NP c 4dc`) ;
   - S2 à 60.
   - *Effet simulé : V-5-S2 et VIII-3-S2 passent de 3,04 à 2,10 n/s, pointe de 3,6 à 2,5.*
2. **XI-2-L : pool sol2–sol3 avec 6 notes imposées**, `intro.new`/`shown` complétés (B2). *Effet simulé : mi3, fa3 et sol3 lues avec leur nom environ 9 fois par tentative avant le S2.*
3. **S2 des chapitres à nouveauté : `deltaMax` du S1 et 8 notes maximum** (G1, G2, G3), puis un étage SEQ-04 au lint. *Effet simulé : étendue 9–13 → 5–7 degrés, sauts ≥ quarte 14–27 % → 0 %.* Cela touche une soixantaine de S2.
4. **R courts sur 8 mesures, V-1 sur 16 mesures** (G5). *Effet simulé : V-1-R passe de 0 à 2 erreurs tolérées ; 12 → 24 événements sur V-1-S0/S1/S2.*
5. **Premiers contacts ramenés avant le S2** : cellules annoncées de V-6, V-7 et V-10 ajoutées au R et au S1 ; V-11-S2 en 9/8, 12/8 et 3/8 déplacés ; 3/4 dans VI-5-R et VI-5-S1 ; 2/4 dans X-2-R (G4, G6, G7). *V-11-S2 simulé : N 54 → 39.*
6. **VII-12-S2 et VII-12-S3 : retirer `ties`** (G6) — trace du retrait de VII-3.
7. **Synthèses à 88 ramenées à 72** (V-12-S2, V-13-S2, VIII-7-S2, X-7-S2, XI-7-S2), plus VIII-7-S2 avec le pool du S1 (G9). *Effet estimé : environ 1,7 n/s.*
8. **XII : `clefEvery` 4 → 2 → 1 comme axe de progression**, doublons remplacés par une marche (G8). *Simulé sur XII-1-S1/S2 : sans erreur.*
9. **Six bonus extrêmes à 72** (G10) et **II-10-S2 à 72, II-10-S3 à 88** (S7).
10. **Prérequis déclarés dans le `desc` de X, XI et XII** (B3, G7, G8) — une ligne de donnée par livre, la seule correction de B3 qui ne demande aucune restructuration.

---

## Annexe — Mesures par chapitre

Moyennes sur 12 tentatives. T = tempo · n/s = frappes par seconde · ≤ c = part des frappes de valeur ≤ croche · ≤ 96 = doubles croches et groupes irréguliers · pool/étendue = notes du pool et étendue jouée en degrés (pour XII, l'étendue inclut la transposition d'octave de la clé de fa) · N = événements · err. 1★ = erreurs tolérées pour la 1re étoile.

| Chap. | Nouveauté | Req. | S1 : T · n/s · ≤ c | S2 : T · n/s · pointe · ≤ c · ≤ 96 · pool/étendue · N · err. 1★ | B : T · n/s |
|---|---|---|---|---|---|
| I-1 | rythme (5 cellules) ; 4/4 | 4 | 60 · 0,75 · 0 % | 72 · 0,91 · 1,2 · 0 % · 0 % · 3/2 · 24 · 4 | 88 · 1,10 |
| I-2 | rythme (9 cellules) | 4 | 60 · 0,71 · 0 % | 72 · 0,83 · 0,9 · 0 % · 0 % · 3/2 · 30 · 6 | 88 · 0,94 |
| I-3 | rythme (2 cellules) | 4 | 60 · 0,36 · 0 % | 72 · 0,40 · 0,9 · 0 % · 0 % · 3/2 · 14 · 2 | 88 · 0,57 |
| I-4 | rythme (9 cellules) | 4 | 60 · 0,52 · 0 % | 72 · 0,58 · 0,6 · 0 % · 0 % · 3/2 · 20 · 4 | 88 · 0,57 |
| I-5 | notes fa4 sol4 | 4 | 60 · 0,79 · 0 % | 72 · 0,77 · 0,9 · 0 % · 0 % · 5/4 · 22 · 4 | 88 · 0,77 |
| I-6 | rythme (4 cellules) ; 2/4 | 4 | 60 · 0,63 · 0 % | 72 · 0,78 · 1,2 · 0 % · 0 % · 5/4 · 14 · 2 | 88 · 0,91 |
| I-7 | rythme (9 cellules) ; 3/4 | 4 | 60 · 0,69 · 0 % | 72 · 0,79 · 1,2 · 0 % · 0 % · 5/4 · 18 · 3 | 88 · 0,86 |
| I-8 | révision/objectif | 3 | 60 · 0,55 · 0 % | 72 · 0,74 · 0,9 · 0 % · 0 % · 5/4 · 20 · 4 | 88 · 0,81 |
| II-1 | rythme (18 cellules) ; 4/4 | 5 | 60 · 1,14 · 38 % | 72 · 1,48 · 1,7 · 48 % · 0 % · 5/4 · 39 · 6 | 88 · 1,83 |
| II-2 | 2/4 3/4 ; révision/objectif | 4 | 60 · 1,00 · 44 % | 72 · 1,33 · 1,8 · 56 % · 0 % · 5/4 · 27 · 4 | 88 · 1,53 |
| II-3 | notes la4 si4 | 4 | 60 · 1,03 · 25 % | 72 · 1,05 · 1,5 · 29 % · 0 % · 7/6 · 29 · 4 | 88 · 1,29 |
| II-5 | rythme (12 cellules) | 5 | 60 · 0,96 · 25 % | 72 · 1,20 · 1,4 · 32 % · 0 % · 7/6 · 40 · 6 | 88 · 1,46 |
| II-6 | rythme (1 cellule) ; liaison | 4 | 60 · 0,67 · 0 % | 72 · 0,89 · 1,3 · 12 % · 0 % · 7/6 · 26 · 4 | 88 · 1,05 |
| II-7 | rythme (14 cellules) | 4 | 60 · 0,96 · 25 % | 72 · 1,17 · 1,3 · 31 % · 0 % · 7/6 · 31 · 4 | 88 · 1,43 |
| II-8 | notes do5 | 4 | 60 · 1,03 · 27 % | 72 · 1,09 · 1,3 · 19 % · 0 % · 8/7 · 31 · 4 | 88 · 1,29 |
| II-9 | notes re5 mi5 | 4 | 60 · 0,94 · 16 % | 72 · 1,02 · 1,3 · 17 % · 0 % · 10/9 · 28 · 4 | 88 · 1,31 |
| II-10 | révision/objectif | 4 | 72 · 1,04 · 31 % | 88 · 1,42 · 1,7 · 24 % · 0 % · 10/9 · 32 · 4 | 100 · 1,48 |
| II-11 | révision/objectif | 3 | 60 · 0,82 · 18 % | 72 · 1,00 · 1,4 · 28 % · 0 % · 10/8 · 47 · 7 | 88 · 1,18 |
| III-1 | rythme (13 cellules) ; 4/4 | 4 | 60 · 1,67 · 57 % | 72 · 2,01 · 2,3 · 58 % · 51 % · 7/6 · 54 · 8 | 88 · 2,48 |
| III-2 | rythme (13 cellules) | 4 | 60 · 1,44 · 48 % | 72 · 1,76 · 2,0 · 51 % · 31 % · 7/6 · 47 · 7 | 88 · 2,19 |
| III-3 | notes si3 la3 | 4 | 60 · 1,05 · 28 % | 72 · 1,05 · 1,3 · 21 % · 0 % · 12/10 · 30 · 4 | 88 · 1,54 |
| III-4 | rythme (16 cellules) | 5 | 60 · 1,22 · 19 % | 72 · 1,49 · 1,7 · 25 % · 20 % · 12/11 · 40 · 6 | 88 · 1,91 |
| III-5 | rythme (9 cellules) | 4 | 60 · 1,36 · 55 % | 72 · 1,62 · 1,8 · 55 % · 0 % · 12/11 · 43 · 6 | 88 · 2,15 |
| III-6 | rythme (1 cellule) ; liaison | 4 | 60 · 0,69 · 7 % | 72 · 0,93 · 1,4 · 13 % · 0 % · 12/10 · 28 · 4 | 88 · 1,13 |
| III-7 | rythme (12 cellules) | 4 | 60 · 1,54 · 57 % | 72 · 1,83 · 2,1 · 56 % · 30 % · 12/11 · 49 · 7 | 88 · 2,29 |
| III-8 | rythme (12 cellules) | 4 | 60 · 1,55 · 55 % | 72 · 1,88 · 2,3 · 56 % · 53 % · 12/11 · 50 · 7 | 88 · 2,46 |
| III-9 | rythme (14 cellules) | 4 | 60 · 1,44 · 48 % | 72 · 1,76 · 1,9 · 50 % · 48 % · 12/11 · 55 · 8 | 88 · 2,13 |
| III-10 | notes fa5 | 4 | 60 · 0,97 · 22 % | 72 · 1,30 · 1,7 · 27 % · 9 % · 13/10 · 35 · 5 | 88 · 1,54 |
| III-11 | notes sol5 la5 | 4 | 60 · 1,02 · 26 % | 72 · 1,32 · 1,7 · 31 % · 15 % · 15/12 · 35 · 5 | 88 · 1,66 |
| III-12 | révision/objectif | 3 | 60 · 1,22 · 35 % | 72 · 1,32 · 1,8 · 39 % · 26 % · 15/13 · 59 · 9 | 88 · 1,62 |
| IV-1 | rythme (14 cellules) ; 2/2 | 4 | 60 · 0,59 · 0 % | 72 · 0,67 · 0,9 · 0 % · 0 % · 12/10 · 19 · 2 | 88 · 0,95 |
| IV-2 | rythme (13 cellules) ; 4/4 | 4 | 60 · 1,08 · 5 % | 72 · 1,36 · 1,7 · 8 % · 8 % · 12/10 · 36 · 5 | 88 · 1,72 |
| IV-3 | tonalité | 3 | 60 · 0,90 · 14 % | 72 · 1,10 · 1,4 · 23 % · 0 % · 8/7 · 30 · 4 | 88 · 1,49 |
| IV-4 | tonalité | 3 | 60 · 1,05 · 28 % | 72 · 1,06 · 1,3 · 22 % · 0 % · 8/7 · 29 · 4 | 88 · 1,46 |
| IV-5 | notes si5 do6 | 4 | 60 · 0,98 · 19 % | 72 · 1,19 · 1,5 · 23 % · 7 % · 15/13 · 32 · 4 | 88 · 1,65 |
| IV-6 | 3/4 2/4 ; révision/objectif | 4 | 72 · 1,09 · 24 % | 88 · 1,52 · 2,2 · 23 % · 0 % · 12/11 · 42 · 6 | 100 · 1,98 |
| IV-7 | révision/objectif | 4 | 88 · 1,45 · 20 % | 100 · 1,55 · 1,8 · 16 % · 0 % · 12/10 · 30 · 4 | 116 · 1,58 |
| IV-8 | liaison ; révision/objectif | 4 | 72 · 1,08 · 27 % | 88 · 1,52 · 2,0 · 29 % · 7 % · 15/13 · 70 · 10 | 88 · 1,63 |
| IV-9 | révision/objectif | 3 | 72 · 1,09 · 22 % | 88 · 0,83 · 1,2 · 0 % · 0 % · 12/10 · 28 · 4 | 100 · 1,58 |
| V-1 | rythme (2 cellules) ; 6/8 | 4 | 60 · 0,51 · 0 % | 72 · 0,57 · 0,8 · 0 % · 0 % · 5/4 · 11 · 1 | 88 · 0,72 |
| V-2 | rythme (3 cellules) | 4 | 60 · 1,41 · 79 % | 72 · 1,56 · 2,4 · 77 % · 0 % · 7/6 · 31 · 4 | 88 · 1,62 |
| V-3 | rythme (10 cellules) | 4 | 60 · 1,12 · 46 % | 72 · 1,37 · 1,9 · 47 % · 0 % · 7/6 · 27 · 4 | 88 · 1,77 |
| V-4 | rythme (8 cellules) | 4 | 60 · 0,71 · 65 % | 72 · 0,88 · 1,4 · 67 % · 0 % · 7/6 · 25 · 3 | 88 · 1,34 |
| V-5 | rythme (8 cellules) | 4 | 60 · 2,51 · 90 % | 72 · 3,04 · 3,6 · 91 % · 74 % · 7/6 · 61 · 9 | 88 · 3,76 |
| V-6 | rythme (18 cellules) | 4 | 60 · 2,19 · 88 % | 72 · 2,39 · 2,7 · 84 % · 61 % · 7/6 · 48 · 7 | 88 · 3,15 |
| V-7 | rythme (16 cellules) | 4 | 60 · 1,53 · 61 % | 72 · 1,98 · 2,6 · 66 % · 32 % · 7/6 · 40 · 6 | 88 · 2,38 |
| V-8 | rythme (15 cellules) | 4 | 60 · 1,64 · 67 % | 72 · 1,98 · 2,4 · 65 % · 23 % · 7/6 · 40 · 6 | 88 · 2,44 |
| V-9 | rythme (15 cellules) | 4 | 60 · 0,75 · 22 % | 72 · 1,25 · 2,3 · 47 % · 38 % · 7/6 · 33 · 5 | 88 · 1,66 |
| V-10 | rythme (8 cellules) | 4 | 60 · 1,34 · 33 % | 72 · 1,67 · 2,4 · 46 % · 19 % · 7/6 · 33 · 5 | 88 · 2,09 |
| V-11 | rythme (24 cellules) ; 9/8 12/8 3/8 | 4 | 60 · 1,06 · 60 % | 72 · 1,35 · 2,3 · 70 % · 0 % · 7/6 · 54 · 8 | 88 · 2,65 |
| V-12 | révision/objectif | 4 | 72 · 1,20 · 49 % | 88 · 2,07 · 3,3 · 70 % · 23 % · 10/9 · 59 · 9 | 100 · 2,12 |
| V-13 | révision/objectif | 3 | 72 · 1,36 · 54 % | 88 · 2,08 · 2,8 · 64 % · 30 % · 10/9 · 53 · 8 | 100 · 2,39 |
| VI-1 | notes do3 re3 mi3 | 4 | 60 · 0,73 · 0 % | 72 · 0,86 · 1,1 · 0 % · 0 % · 3/2 · 23 · 4 | 88 · 1,12 |
| VI-2 | notes fa3 sol3 | 4 | 60 · 0,80 · 0 % | 72 · 0,87 · 1,0 · 0 % · 0 % · 5/4 · 23 · 4 | 88 · 1,10 |
| VI-3 | rythme (11 cellules) | 4 | 60 · 0,41 · 0 % | 72 · 0,50 · 0,9 · 0 % · 0 % · 5/4 · 18 · 3 | 88 · 0,70 |
| VI-4 | notes la3 si3 | 4 | 60 · 0,79 · 0 % | 72 · 0,72 · 1,0 · 0 % · 0 % · 7/6 · 20 · 4 | 88 · 0,89 |
| VI-5 | rythme (11 cellules) ; 2/4 3/4 | 4 | 60 · 0,64 · 0 % | 72 · 0,84 · 1,2 · 0 % · 0 % · 7/6 · 19 · 3 | 88 · 0,96 |
| VI-6 | révision/objectif | 3 | 60 · 0,62 · 0 % | 72 · 0,76 · 0,9 · 0 % · 0 % · 7/6 · 19 · 3 | 88 · 0,78 |
| VII-1 | rythme (18 cellules) ; 4/4 | 4 | 60 · 1,14 · 37 % | 72 · 1,49 · 1,8 · 49 % · 0 % · 7/6 · 40 · 6 | 88 · 1,77 |
| VII-2 | notes si2 la2 | 4 | 60 · 0,76 · 0 % | 72 · 1,01 · 1,4 · 22 % · 0 % · 9/8 · 27 · 4 | 88 · 1,20 |
| VII-4 | rythme (14 cellules) | 4 | 60 · 0,97 · 24 % | 72 · 1,19 · 1,4 · 32 % · 0 % · 9/8 · 32 · 4 | 88 · 1,43 |
| VII-5 | rythme (12 cellules) | 4 | 60 · 0,95 · 24 % | 72 · 1,19 · 1,5 · 33 % · 0 % · 9/8 · 39 · 6 | 88 · 1,45 |
| VII-6 | notes sol2 fa2 | 4 | 60 · 0,84 · 5 % | 72 · 1,18 · 1,4 · 24 % · 0 % · 11/9 · 32 · 4 | 88 · 1,41 |
| VII-7 | rythme (10 cellules) | 4 | 60 · 1,72 · 59 % | 72 · 2,09 · 2,3 · 60 % · 54 % · 11/10 · 56 · 8 | 88 · 2,65 |
| VII-8 | rythme (15 cellules) | 4 | 60 · 1,22 · 19 % | 72 · 1,47 · 1,7 · 25 % · 20 % · 11/9 · 39 · 6 | 88 · 1,90 |
| VII-9 | notes do4 re4 mi4 | 4 | 60 · 0,89 · 16 % | 72 · 1,16 · 1,4 · 24 % · 7 % · 12/10 · 31 · 4 | 88 · 1,47 |
| VII-10 | rythme (14 cellules) | 4 | 60 · 1,35 · 45 % | 72 · 1,72 · 2,0 · 51 % · 29 % · 11/10 · 46 · 7 | 88 · 2,10 |
| VII-11 | notes mi2 re2 do2 | 4 | 60 · 0,94 · 18 % | 72 · 1,11 · 1,6 · 28 % · 12 % · 15/13 · 32 · 4 | 88 · 1,63 |
| VII-12 | liaison ; révision/objectif | 3 | 60 · 1,01 · 31 % | 72 · 1,13 · 1,7 · 33 % · 11 % · 15/12 · 53 · 8 | 88 · 1,57 |
| VIII-1 | rythme (11 cellules) ; 6/8 | 4 | 60 · 1,14 · 72 % | 72 · 1,13 · 1,7 · 51 % · 0 % · 3/2 · 23 · 3 | 88 · 1,61 |
| VIII-2 | rythme (15 cellules) | 4 | 60 · 0,67 · 61 % | 72 · 0,86 · 1,4 · 58 % · 0 % · 5/4 · 25 · 3 | 88 · 1,19 |
| VIII-3 | rythme (8 cellules) | 4 | 60 · 2,43 · 88 % | 72 · 3,04 · 3,6 · 90 % · 74 % · 7/6 · 61 · 9 | 88 · 3,76 |
| VIII-4 | rythme (18 cellules) | 4 | 60 · 2,16 · 87 % | 72 · 2,40 · 2,8 · 85 % · 61 % · 7/6 · 48 · 7 | 88 · 3,11 |
| VIII-5 | rythme (16 cellules) | 4 | 60 · 1,53 · 61 % | 72 · 1,89 · 2,4 · 62 % · 34 % · 7/6 · 38 · 5 | 88 · 2,37 |
| VIII-6 | rythme (16 cellules) | 4 | 60 · 1,65 · 67 % | 72 · 1,91 · 2,4 · 64 % · 22 % · 7/6 · 38 · 5 | 88 · 2,40 |
| VIII-7 | révision/objectif | 3 | 72 · 1,65 · 68 % | 88 · 2,01 · 2,8 · 66 % · 26 % · 15/14 · 52 · 8 | 100 · 2,50 |
| IX-1 | notes do4 re4 si3 | 4 | 60 · 0,75 · 0 % | 72 · 0,86 · 1,1 · 0 % · 0 % · 3/2 · 23 · 4 | 88 · 1,13 |
| IX-2 | notes mi4 la3 | 4 | 60 · 0,78 · 0 % | 72 · 0,84 · 1,1 · 0 % · 0 % · 5/4 · 22 · 4 | 88 · 1,06 |
| IX-3 | rythme (12 cellules) | 3 | 60 · 0,40 · 0 % | 72 · 0,47 · 0,9 · 0 % · 0 % · 5/3 · 18 · 3 | 88 · 0,69 |
| IX-4 | notes fa4 sol3 | 4 | 60 · 0,76 · 0 % | 72 · 0,84 · 1,0 · 0 % · 0 % · 7/6 · 23 · 4 | 88 · 0,87 |
| IX-5 | rythme (12 cellules) | 4 | 60 · 1,17 · 40 % | 72 · 1,42 · 1,6 · 41 % · 0 % · 7/6 · 38 · 7 | 88 · 1,78 |
| IX-6 | notes sol4 la4 si4 re3 mi3 fa3 | 4 | 60 · 0,82 · 0 % | 72 · 0,86 · 1,2 · 8 % · 0 % · 13/10 · 24 · 4 | 88 · 1,02 |
| IX-7 | révision/objectif | 3 | 60 · 0,68 · 5 % | 72 · 0,73 · 1,0 · 4 % · 0 % · 13/10 · 22 · 4 | 88 · 0,96 |
| X-1 | notes do5 re5 si2 do3 | 4 | 60 · 0,77 · 0 % | 72 · 0,84 · 1,2 · 10 % · 0 % · 15/12 · 25 · 3 | 88 · 1,15 |
| X-2 | rythme (23 cellules) ; 2/4 3/4 | 4 | 60 · 0,96 · 24 % | 72 · 1,06 · 2,1 · 38 % · 0 % · 13/9 · 17 · 2 | 88 · 1,26 |
| X-3 | rythme (14 cellules) | 4 | 60 · 1,44 · 48 % | 72 · 1,74 · 2,2 · 51 % · 42 % · 13/11 · 49 · 7 | 88 · 2,23 |
| X-4 | rythme (14 cellules) | 4 | 60 · 1,22 · 24 % | 72 · 1,49 · 1,7 · 30 % · 15 % · 13/11 · 40 · 6 | 88 · 1,78 |
| X-5 | rythme (12 cellules) ; 6/8 | 4 | 60 · 1,16 · 73 % | 72 · 1,30 · 2,1 · 62 % · 0 % · 7/6 · 26 · 4 | 88 · 1,57 |
| X-6 | révision/objectif | 4 | 88 · 1,54 · 31 % | 100 · 1,53 · 1,9 · 17 % · 0 % · 13/11 · 44 · 6 | 116 · 1,58 |
| X-7 | révision/objectif | 3 | 72 · 1,27 · 31 % | 88 · 1,66 · 2,3 · 55 % · 0 % · 15/12 · 42 · 6 | 100 · 1,75 |
| XI-1 | notes la3 si3 do4 re4 mi4 | 4 | 60 · 0,71 · 0 % | 72 · 1,04 · 1,3 · 14 % · 0 % · 5/4 · 28 · 4 | 88 · 1,40 |
| XI-2 | notes sol2 la2 si2 sol4 la4 si4 | 4 | 60 · 0,74 · 0 % | 72 · 0,87 · 1,3 · 13 % · 0 % · 13/10 · 24 · 3 | 88 · 1,06 |
| XI-3 | rythme (12 cellules) | 4 | 60 · 1,20 · 19 % | 72 · 1,46 · 1,7 · 23 % · 19 % · 13/11 · 39 · 6 | 88 · 1,84 |
| XI-4 | rythme (15 cellules) | 4 | 60 · 1,45 · 48 % | 72 · 1,92 · 2,3 · 56 % · 42 % · 13/11 · 51 · 7 | 88 · 2,25 |
| XI-5 | rythme (13 cellules) ; 6/8 | 4 | 60 · 1,14 · 72 % | 72 · 1,18 · 2,0 · 55 % · 0 % · 7/6 · 24 · 3 | 88 · 1,63 |
| XI-6 | révision/objectif | 4 | 72 · 1,27 · 25 % | 88 · 1,54 · 2,0 · 31 % · 8 % · 15/14 · 69 · 10 | 88 · 1,63 |
| XI-7 | révision/objectif | 3 | 72 · 1,31 · 30 % | 88 · 1,58 · 2,2 · 53 % · 0 % · 15/13 · 41 · 6 | 100 · 1,83 |
| XII-1 | 4/4 ; révision/objectif | 7 | 60 · 0,76 · 0 % | 60 · 0,76 · 0,9 · 0 % · 0 % · 3/9 · 24 · 4 | 88 · 1,12 |
| XII-2 | révision/objectif | 7 | 60 · 0,48 · 0 % | 60 · 0,47 · 0,7 · 0 % · 0 % · 5/11 · 19 · 3 | 88 · 0,76 |
| XII-3 | 2/4 3/4 ; révision/objectif | 7 | 72 · 0,71 · 0 % | 72 · 0,78 · 1,2 · 0 % · 0 % · 7/12 · 13 · 2 | 88 · 0,99 |
| XII-4 | révision/objectif | 7 | 72 · 0,66 · 0 % | 72 · 0,60 · 0,9 · 0 % · 0 % · 7/12 · 28 · 5 | 88 · 0,93 |
