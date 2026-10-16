# Site vitrine Luminote — luminote-app.com

Site statique trilingue (FR/EN/ES) de l'application **Luminote**, éditée par
Premier Degré SARL. Trois pages : accueil, politique de confidentialité,
mentions légales. **Aucune dépendance externe** : polices, images et vidéo
sont embarquées — le site ne fait aucune requête hors de son propre domaine
(cohérent avec la politique de confidentialité).

DA « papier » de l'app 2.0 (octobre 2026) : papier grainé, encre, terracotta
et vert hachurés, ombres opaques, tampons, polices de l'app (Bricolage
Grotesque, Atkinson Hyperlegible, Caveat, Bravura). Valeurs reprises de
`src/styles/papier.css` du dépôt de l'app.

Ce dossier est **le dépôt complet** : il ne contient aucun secret et peut être
publié en public tel quel.

## Contenu

| Fichier / dossier | Rôle |
|---|---|
| `index.html` | Accueil : héros + vidéo de jeu, « comment ça marche », écrans réels, le programme, l'offre (gratuit / Luminote Complète), boutons Google Play et App Store (« bientôt ») |
| `confidentialite.html` | Politique de confidentialité 2.0 (FR/EN/ES) — l'URL à donner à Google Play et à l'App Store |
| `mentions-legales.html` | Mentions légales 2.0 (FR/EN/ES) — le lien Premier Degré ↔ Luminote pour la validation du compte |
| `assets/` | CSS, JS (bascule de langue), polices woff2, images, vidéo de jeu |
| `demo/app/` | Ancienne démo jouable de la 1.x — **plus liée depuis la 2.0** (la v2 n'a pas encore de mode démo bridé, voir plus bas) |
| `v2/`, `charte/` | Page privée de test de la 2.0 et copie de la charte pour Claude Design |
| `.nojekyll` | Indique à GitHub Pages de servir les fichiers tels quels |

## 🚀 Mettre en ligne (GitHub Pages)

1. Sur github.com : **New repository** → nom `luminote-site` (par exemple) →
   **Public** → Create. Ne pas cocher « Add a README ».
2. Téléverser **tout le contenu de ce dossier** (glisser-déposer via
   « uploading an existing file », ou `git init` + push). Attention à bien
   inclure `.nojekyll` (fichier caché).
3. Dans le dépôt : **Settings → Pages** → Source : « Deploy from a branch » →
   Branch `main`, dossier `/ (root)` → Save.
4. Après ~1 minute, le site est en ligne sur
   `https://<votre-compte>.github.io/luminote-site/`. Tout fonctionne déjà à
   cette adresse (chemins relatifs partout).

## 🌐 Brancher le domaine luminote-app.com

1. Chez le registrar du domaine (là où luminote-app.com a été acheté), créer :
   - **4 enregistrements A** sur `@` (domaine nu) :
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - **1 enregistrement CNAME** sur `www` → `<votre-compte>.github.io`
2. Dans le dépôt : **Settings → Pages → Custom domain** → saisir
   `luminote-app.com` → Save (GitHub crée un fichier `CNAME` dans le dépôt —
   c'est normal, le laisser).
3. Attendre la propagation DNS (quelques minutes à quelques heures), puis
   cocher **Enforce HTTPS** dès que la case devient disponible.

## 🔎 Vérifier le site dans Google Search Console

(Exigé pour valider le compte développeur « organisation » sur Google Play.)

1. [search.google.com/search-console](https://search.google.com/search-console)
   → Ajouter une propriété → type **Domaine** → `luminote-app.com`.
2. Search Console fournit un enregistrement **TXT** à ajouter chez le
   registrar → l'ajouter → « Vérifier ».
3. Dans la Play Console, déclarer `https://luminote-app.com` comme site web de
   l'organisation ; l'URL de la politique de confidentialité à donner est
   `https://luminote-app.com/confidentialite.html`.

## ✅ App publiée

- Fiche Play Store :
  `https://play.google.com/store/apps/details?id=fr.premierdegre.solfege`
  (liée depuis le hero et le bandeau final).
- **Rafraîchir les captures** si l'app a changé, depuis le dépôt de l'app :
  `node tools/site/captures-vitrine.mjs` — écrans réels (`ecran-*.webp`,
  600 px de large) et vidéo d'un exercice joué par le pilote de dev
  (`jeu.mp4`, `jeu-poster.webp`) ; ffmpeg requis.
- `og.png` (image de partage, 1200×630) est un rendu de la charte : à
  refaire si la marque change.

## 🔁 Démo jouable (1.x seulement)

⚠️ La 2.0 n'a pas encore de mode démo bridé : `VITE_DEMO=1` n'y limite plus
le contenu. **Ne pas** régénérer la démo depuis la branche `v2` tant que ce
mode n'existe pas — tout le jeu serait publié sur le web. La procédure
ci-dessous vaut pour la 1.x.

Depuis le dépôt de l'app (`solfgg`). **`VITE_DEMO=1` est indispensable** :
c'est lui qui bride la démo au tutoriel + chapitre 1 (voir `src/demo.js`
dans le dépôt de l'app) — sans lui, le jeu complet serait publié sur le web.

```bash
VITE_DEMO=1 npx vite build --base=./ --outDir "../luminote-site/demo/app" --emptyOutDir
cd ../luminote-site/demo/app
# Bravura est injectée par le JS de l'app avec un chemin absolu : le rendre relatif
sed -i "s|url('/fonts/Bravura.woff2')|url('fonts/Bravura.woff2')|g" assets/index-*.js
rm -rf samples vite.svg           # inutilisés dans le build web
cp ../../assets/img/favicon-32.png favicon.png
sed -i 's|type="image/svg+xml" href="./vite.svg"|type="image/png" href="./favicon.png"|' index.html
# masquer les barres de scroll dans le cadre du téléphone
sed -i 's|</title>|</title>\n    <style>/* démo intégrée : pas de barres de scroll visibles */ html,body{overflow:hidden} *{scrollbar-width:none} *::-webkit-scrollbar{display:none}</style>|' index.html
```

---
© Premier Degré SARL — RCS Paris 911 757 912
