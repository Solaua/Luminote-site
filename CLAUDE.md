# Site Luminote, consignes pour Claude

Alexandre et Nestor travaillent sur ce dépôt à égalité, sans hiérarchie, chacun avec son propre Claude. Les règles ci-dessous ne servent qu'à une chose : ne pas se marcher dessus.

## À savoir

**`main` est en ligne.** GitHub Pages publie `main` sur https://luminote-app.com environ une minute après chaque push, sans build ni CI.

## Pour éviter les conflits

1. Avant de commencer : `git fetch`, mettre `main` à jour, regarder `gh pr list`. Si l'autre travaille sur les mêmes fichiers, le dire à son humain.
2. Chacun sur sa branche (`alexandre/<sujet>`, `nestor/<sujet>`), puis une PR vers `main` que son auteur fusionne lui-même.
3. Jamais de `git push --force` sur `main`, jamais de commit sur la branche de l'autre.
4. Un coup d'œil au rendu avant de fusionner, puisque la fusion met en ligne (`python -m http.server` à la racine, en fr, en et es).

## Le site

- Pages : `index.html`, `confidentialite.html`, `mentions-legales.html`. CSS dans `assets/site.css`, langue dans `assets/site.js`.
- Chaque texte existe en fr, en et es : `<span class="L fr" lang="fr">…</span>`, puis `en` et `es`. Une image ou une vidéo qui dépend de la langue est triplée de la même façon.
- Aucune requête hors du domaine (pas de CDN, pas de traceur), comme le promet la politique de confidentialité.
- `v2/`, `ami/`, `demo/` et `charte/` sont générés depuis le dépôt de l'app.
- Captures : `node tools/site/captures-vitrine.mjs` dans le dépôt de l'app (fr, en, es).
- Stores : https://play.google.com/store/apps/details?id=fr.premierdegre.solfege et https://apps.apple.com/app/id6814822558
- Textes courts et simples, comme dans l'app.
