# Guide de déploiement — Centre de Beauté Loudaya sur Namecheap cPanel

Ce guide explique comment déployer l'application (React + Vite + Node.js/Express + Prisma/MySQL) sur un hébergement mutualisé Namecheap avec **cPanel** et **Setup Node.js App** (Passenger).

---

## 📦 Contenu du dossier `deploy/`

```
deploy/
├── src/index.js                    # Point d'entrée unique (cPanel)
├── src/env.js                      # Configuration environnement
├── package.json                    # Scripts racine (build, start, prisma:generate)
├── package-lock.json               # Lockfile racine
├── .env.production.example         # Modèle de variables d'env (À COPIER EN .env)
├── .htaccess                       # Config Apache/Passenger (sécurité, HTTPS, cache, non-www)
├── index.html                      # Template HTML avec SEO meta, Open Graph, JSON-LD
├── robots.txt                      # Robots.txt (exclut /admin, /api/)
├── sitemap.xml                     # Sitemap (routes publiques seulement)
├── Logo_CentreBeauteLoudaya.jpg    # Logo pour favicon/OG image
├── dist/                           # Build frontend (Vite) — généré par `npm run build`
│   ├── index.html
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── Logo_CentreBeauteLoudaya.jpg
│   └── assets/
└── server/                         # Backend Node.js
    ├── package.json
    ├── package-lock.json
    ├── .gitignore
    ├── prisma/
    │   ├── schema.prisma
    │   ├── seed.js                 # Inclut Options & Soins Extra (opt-deco, opt-paraffine-jelly)
    │   └── migrations/
    └── src/
        ├── index.js
        ├── env.js
        ├── lib/
        ├── middleware/
        └── routes/
```

---

## 🚀 ÉTAPE 1 — Upload via File Manager (cPanel)

1. Connectez-vous à **cPanel** → **File Manager**.
2. Allez dans le dossier **document root** de votre domaine (ex: `public_html` ou `public_html/votre-domaine.com`).
3. **Uploadez** tout le contenu du dossier local `deploy/` (glissez-déposez ou *Upload* → zip → *Extract*).
   - Vous devez avoir `src/index.js`, `package.json`, `server/`, `.htaccess`, `.env.production.example` à la racine.
   - Le dossier `dist/` sera créé à l'étape 4.

---

## 🛠️ ÉTAPE 2 — Setup Node.js App (cPanel)

1. Dans cPanel, ouvrez **Setup Node.js App** (section *Software*).
2. Cliquez **CREATE APPLICATION** :
   - **Node.js version** : `20` (LTS recommandé)
   - **Application mode** : `Production`
   - **Application root** : chemin absolu vers le dossier de l'app (ex: `/home/centxfci/public_html`)
   - **Application URL** : votre domaine (ex: `https://centrebeauteloudaya.com`)
   - **Application startup file** : `src/index.js`
   - **Passenger log file** : laissez vide ou `passenger.log`
3. Cliquez **CREATE**.
4. Une fois créé, notez la **commande d'entrée dans l'environnement virtuel** affichée (ex: `source /home/centxfci/nodevenv/public_html/20/bin/activate && cd /home/centxfci/public_html`).

---

## 🔐 ÉTAPE 3 — Créer le fichier `.env` sur le serveur

1. Toujours dans **Setup Node.js App**, cliquez sur le bouton **ENVIRONMENT VARIABLES** → **ADD VARIABLE** pour chaque variable ci-dessous, **OU** créez un fichier `.env` à la racine via File Manager (plus simple).

**Variables REQUISES (copiez depuis `.env.production.example` et remplissez) :**

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | Connexion MySQL cPanel | `mysql://centxfci_salon:CentreLoudaya2026@localhost:3306/centxfci_salon` |
| `PORT` | Port interne (Passenger l'ignore, mais requis par le code) | `5000` |
| `NODE_ENV` | Environnement | `production` |
| `JWT_SECRET` | Secret signature JWT (64+ chars) | Généré via: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Expiration token | `8h` |
| `ADMIN_EMAIL` | Email admin (créé au seed) | `admin@centrebeauteloudaya.com` |
| `ADMIN_PASSWORD` | Mot de passe admin | `CentreLoudaya2026` |
| `CORS_ORIGINS` | Domaines autorisés (HTTPS en prod) | `https://centrebeauteloudaya.com,https://www.centrebeauteloudaya.com` |
| `SALON_PHONE` | Téléphone local affiché | `0666923910` |
| `SALON_WHATSAPP` | Numéro international WhatsApp | `212666923910` |

⚠️ **Important** :
- Dans `DATABASE_URL`, encodez les caractères spéciaux du mot de passe (ex: `!` → `%21`, `@` → `%40`, `#` → `%23`, `$` → `%24`).
- Le mot de passe MySQL (`CentreLoudaya2026`) doit être **identique** à `ADMIN_PASSWORD`.
- `JWT_SECRET` doit être une chaîne aléatoire de 64+ caractères hexadécimaux.

---

## 📦 ÉTAPE 4 — Installation des dépendances & Prisma

Ouvrez le **Terminal** dans cPanel (ou SSH si activé), puis :

```bash
# 1. Activez l'environnement virtuel (copiez la commande depuis Setup Node.js App)
source /home/centxfci/nodevenv/public_html/20/bin/activate && cd /home/centxfci/public_html

# 2. Installez les dépendances racine
npm ci

# 3. Installez les dépendances serveur
cd server && npm ci && cd ..

# 4. Générez le Prisma Client (binaires Linux)
npm run prisma:generate
```

> ℹ️ `npm ci` installe exactement les versions du `package-lock.json` (plus rapide et fiable que `npm install`).

---

## 🔄 ÉTAPE 5 — Initialisation de la base de données (Premier déploiement seulement)

```bash
# Toujours dans l'environnement virtuel activé
cd server

# Option A: Si la base est vide (premier déploiement)
npx prisma migrate deploy
npm run prisma:seed

# Option B: Si la base existe déjà (migration seulement)
npx prisma migrate deploy
# NE PAS relancer le seed si des données existent déjà
```

> ℹ️ `prisma migrate deploy` applique les migrations existantes sans effacer les données.
> Le seed est idempotent : il met à jour les catégories/services et crée/maj le compte admin.

---

## 🏗️ ÉTAPE 6 — Build du frontend

```bash
# Depuis la racine du projet (environnement virtuel activé)
npm run build
```

Cela crée le dossier `dist/` avec `index.html` et `assets/` (JS/CSS/images hashés).

---

## 🔄 ÉTAPE 7 — Redémarrage de l'application

1. Retournez dans **Setup Node.js App**.
2. Cliquez **RESTART** sur votre application.
3. Attendez quelques secondes, puis visitez votre domaine : `https://centrebeauteloudaya.com`.

---

## ✅ ÉTAPE 8 — Vérifications post-déploiement

| Test | URL | Résultat attendu |
|------|-----|------------------|
| Page d'accueil | `https://centrebeauteloudaya.com/` | Site chargé, hero, services, footer |
| Services | `https://centrebeauteloudaya.com/services` | Section services affichée, scroll fluide |
| Réservation | `https://centrebeauteloudaya.com/reservation` | Formulaire fonctionnel, envoi → API `/api/bookings` |
| Pourquoi nous | `https://centrebeauteloudaya.com/pourquoi-nous` | Section avantages affichée |
| Ambiance | `https://centrebeauteloudaya.com/ambiance` | Galerie ambiance affichée |
| Contact | `https://centrebeauteloudaya.com/contact` | FAQ/Contact affichée |
| Disponibilités | (via formulaire) | Créneaux récupérés via `/api/bookings/availability` |
| Admin login | `https://centrebeauteloudaya.com/admin` | Connexion avec `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| Admin dashboard | (après login) | Liste réservations, gestion services |
| Health check API | `https://centrebeauteloudaya.com/api/health` | `{ "status": "ok", ... }` |
| WhatsApp | Bouton flottant / confirmation résa | Lien `wa.me/212666923910?text=...` correct |
| HTTPS forcé | `http://centrebeauteloudaya.com` | Redirige vers HTTPS |
| Non-www redirect | `https://www.centrebeauteloudaya.com` | Redirige vers `https://centrebeauteloudaya.com` |
| .env protégé | `https://centrebeauteloudaya.com/.env` | 403 Forbidden |

---

## 🔧 Commandes utiles (Terminal cPanel / SSH)

```bash
# Voir les logs Passenger
tail -f ~/nodevenv/public_html/20/log/passenger.log

# Redémarrer manuellement
# (depuis Setup Node.js App → RESTART, ou via terminal)
pkill -f "node src/index.js"  # puis l'app redémarre auto via Passenger

# Régénérer Prisma Client après modification schema
cd server && npm run prisma:generate && cd ..

# Rebuild frontend (si modif src/)
npm run build

# Vérifier variables d'env chargées
node -e "import('dotenv/config'); console.log(process.env.DATABASE_URL?.slice(0,30))"

# Vérifier la connexion DB
cd server && node -e "import('dotenv/config'); import { PrismaClient } from '@prisma/client'; const p = new PrismaClient(); p.\$connect().then(() => console.log('DB OK')).catch(e => console.error(e)).finally(() => p.\$disconnect())"
```

---

## 🆘 Dépannage courant

| Problème | Cause probable | Solution |
|----------|----------------|----------|
| `503 Service Unavailable` | App pas démarrée / crash au démarrage | Vérifiez logs Passenger ; vérifiez `.env` (DATABASE_URL, JWT_SECRET) |
| `CORS error` | `CORS_ORIGINS` ne contient pas votre domaine HTTPS | Ajoutez `https://centrebeauteloudaya.com` dans `.env` → RESTART |
| `Prisma Client not found` | `prisma generate` pas lancé ou binaires manquants | Lancez `npm run prisma:generate` dans `server/` |
| `Database connection failed` | Mauvais user/pass/host dans `DATABASE_URL` | Vérifiez user MySQL cPanel, mot de passe, hôte `localhost`, port `3306` |
| `admin/login 401` | Mauvais identifiants | Vérifiez `ADMIN_EMAIL` / `ADMIN_PASSWORD` dans `.env` ; relancez le seed si besoin |
| Assets (JS/CSS) 404 | Mauvaise config `dist/` ou `.htaccess` | Vérifiez que `dist/` est à la racine et `.htaccess` présent |
| `ERR_REQUIRE_ASYNC_MODULE` | Top-level await dans le point d'entrée | Utilisez `src/index.js` avec `async main()` (fourni) |

---

## 🔐 Ce que VOUS devez remplir (valeurs secrètes)

> **Ne commitez JAMAIS ces valeurs.** Remplissez-les uniquement dans le `.env` sur le serveur (cPanel File Manager ou Variables d'env Node.js App).

| Variable | Où la trouver / comment la générer |
|----------|-------------------------------------|
| **Utilisateur MySQL cPanel** | cPanel → *MySQL Databases* → *Current Users* (ex: `centxfci_salon`) |
| **Mot de passe MySQL** | **Doit être `CentreLoudaya2026`** (identique à ADMIN_PASSWORD). Si différent : changez-le dans cPanel → MySQL Databases → Current Users → Change Password. |
| **Nom de domaine** | Votre domaine réel (ex: `centrebeauteloudaya.com`) |
| **JWT_SECRET** | Générez localement : `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` → copiez la sortie (96 chars hex) |
| **ADMIN_EMAIL** | Votre email admin (ex: `admin@centrebeauteloudaya.com`) |
| **ADMIN_PASSWORD** | **Doit être `CentreLoudaya2026`** (identique au mot de passe MySQL) |
| **SALON_PHONE / SALON_WHATSAPP** | Vos numéros réels (déjà pré-remplis dans l'exemple) |

---

## 📝 Checklist finale avant mise en ligne

- [ ] Dossier `deploy/` uploadé à la racine du document root
- [ ] `Setup Node.js App` créé (Node 20, mode Production, startup `src/index.js`)
- [ ] Fichier `.env` créé avec **toutes** les variables (surtout `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`)
- [ ] Mot de passe MySQL cPanel défini sur `CentreLoudaya2026`
- [ ] `npm ci` (racine + `server/`) exécuté sans erreur
- [ ] `npm run prisma:generate` exécuté sans erreur
- [ ] `npx prisma migrate deploy` exécuté (dans `server/`)
- [ ] `npm run prisma:seed` exécuté (premier déploiement seulement, dans `server/`)
- [ ] `npm run build` exécuté sans erreur
- [ ] Application **RESTART** dans cPanel
- [ ] Site accessible en HTTPS, formulaire réservation fonctionne
- [ ] `/admin` accessible, login admin fonctionne (cookie httpOnly défini)
- [ ] Notifications WhatsApp (liens `wa.me/...`) correctes
- [ ] `.env` inaccessible via navigateur (403)
- [ ] Directory listing désactivé (403 sur `/` sans index.html)

---

## 🔒 Sécurité appliquée

- **Helmet** : headers de sécurité (HSTS, XSS, etc.)
- **CORS** : restreint aux domaines HTTPS de `CORS_ORIGINS`
- **Rate limiting** : global (120 req/min), login admin (8/15min), bookings (10/heure)
- **Validation** : Zod sur toutes les entrées (booking, admin)
- **Prisma ORM** : pas de SQL brut (sauf `FOR UPDATE` pour anti-double-booking)
- **Admin auth** : JWT dans cookie httpOnly + secure + sameSite=lax, expiry 8h, logout
- **Erreurs** : pas de stack traces en production, messages génériques
- **.htaccess** : bloque `.env`, fichiers cachés, force HTTPS, no directory listing
- **Mots de passe** : hashés avec bcrypt (cost 12), jamais en clair

---

**Besoin d'aide ?** Consultez les logs Passenger (`~/nodevenv/.../log/passenger.log`) et la console navigateur (F12 → Network/Console).
