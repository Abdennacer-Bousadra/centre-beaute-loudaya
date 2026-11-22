<div align="center">

<img src="src/assets/Logo_CentreBeauteLoudaya.jpg" width="320" alt="Centre Beauté Loudaya — Salon & Spa, Loudaya, Marrakech" />

# Centre Beauté Loudaya

**Salon de beauté & spa pour femmes — Loudaya, Marrakech**

Site vitrine bilingue (français / arabe) avec catalogue de soins,
réservation en ligne en 4 étapes confirmée par WhatsApp,
et panneau d'administration.

🌐 **Site en production : [https://centrebeauteloudaya.com](https://centrebeauteloudaya.com)**

📍 [Voir sur Google Maps](https://maps.app.goo.gl/e9RKXNCU6QzzNXhE6) · 📸 Instagram : [@centredebeaute_loudaya](https://www.instagram.com/centredebeaute_loudaya)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white)

</div>

---

## À propos

Le **Centre Beauté Loudaya** est un salon de beauté et spa pour femmes situé à
Loudaya, près de Marrakech. Le site présente le salon et permet aux clientes
de réserver un soin en ligne, avec confirmation via WhatsApp.

- 💅 **52 soins en 8 catégories** : coiffure, manucure / onglerie, pédicure,
  épilation, soin visage, maquillage / esthétique, massage, packs mariée
  (tarifs affichés sur le site, à partir de 30 DH)
- 📅 **Réservation en 4 étapes** : choix du soin → date et heure → coordonnées
  → récapitulatif et message WhatsApp préformaté
- 🌍 **Bilingue FR / AR** avec bascule automatique du sens de lecture
  (LTR / RTL)
- 🕙 Ouvert du lundi au samedi, de 10:00 à 20:00 — **fermé le dimanche**
- 📞 Téléphone / WhatsApp : 0666923910 (+212 666-923910)

## Fonctionnalités

| Domaine | Détails |
| --- | --- |
| **Site vitrine** | Accueil, catalogue des soins, galerie, avis, contact, WhatsApp flottant |
| **Catalogue** | 52 soins en 8 catégories, recherche instantanée, filtres, disponibilité |
| **Réservation** | Parcours en 4 étapes, créneaux de 10h00 à 20h00, dimanches désactivés, validation du numéro marocain, confirmation WhatsApp |
| **Administration** | Panneau `/admin` : gestion des prestations et tarifs (FR & AR), suivi des réservations par statut (*En attente, Confirmé, Terminé, Annulé*), contact WhatsApp en un clic, paramètres du salon |
| **Multilingue** | Français / Arabe (`i18next`), direction RTL automatique |
| **Design** | Charte Rose Gold / Prune / Or, typographies Playfair Display, Tajawal et Plus Jakarta Sans, animations et confettis à la confirmation |

## Stack technique

| Couche | Technologies |
| --- | --- |
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, React Router 6, `i18next` |
| **Backend** | Node.js, Express 4, Prisma 6, MySQL |
| **Authentification** | JWT (8 h), bcrypt, cookie HttpOnly |
| **Sécurité** | Helmet, CORS restreint, limitation de débit, validation Zod, assainissement des saisies |
| **Base de données** | MySQL 8 — schéma Prisma, migrations et seed |

## Démarrage rapide

### Prérequis

- **Node.js 18.18+** et npm
- **MySQL 8** (XAMPP en local, par exemple)

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/Abdennacer-Bousadra/centre-beaute-loudaya.git
cd centre-beaute-loudaya

# 2. Installer les dépendances (frontend + serveur)
npm install
npm --prefix server install

# 3. Configurer l'environnement du serveur
cp server/.env.example server/.env
# → remplir DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD…
```

### Base de données

```bash
npm --prefix server run prisma:generate   # génère le client Prisma
npm --prefix server run prisma:migrate    # applique les migrations
npm --prefix server run prisma:seed       # crée le compte admin et les données
```

### Lancement

```bash
npm run dev   # lance le serveur (port 5000) et le frontend Vite (port 5173) ensemble
```

Autres scripts : `npm run build` (build de production), `npm run preview`
(aperçu du build), `npm --prefix server run prisma:studio` (explorateur de
la base de données).

## Variables d'environnement

Fichier `server/.env` (modèle : `server/.env.example`) :

| Variable | Description | Exemple |
| --- | --- | --- |
| `DATABASE_URL` | Connexion MySQL (Prisma) | `mysql://root:@localhost:3306/salon` |
| `PORT` | Port de l'API | `5000` |
| `NODE_ENV` | Environnement | `development` |
| `JWT_SECRET` | Secret de signature des JWT (**obligatoire**, 48+ octets aléatoires) | — |
| `JWT_EXPIRES_IN` | Durée de validité du token admin | `8h` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Compte administrateur créé par le seed | `admin@loudaya.ma` |
| `CORS_ORIGINS` | Origines autorisées à appeler l'API | `http://localhost:5173` |
| `SALON_PHONE` / `SALON_WHATSAPP` | Numéro du salon (local / international) | `0666923910` / `212666923910` |

> ⚠️ **Ne jamais commiter le fichier `server/.env`.** Il contient le secret
> JWT et le mot de passe administrateur. En production, utilisez des valeurs
> fortes et uniques.

## Structure du projet

```
centre-beaute-loudaya/
├── src/                  # Application React
│   ├── components/       # layout, home, booking, services, admin
│   ├── context/          # AuthContext, BookingContext, ServicesContext
│   ├── data/             # Catalogue (servicesData), infos du salon
│   ├── api/              # Client HTTP de l'API
│   ├── i18n.js           # Traductions FR / AR
│   └── assets/           # Logo, images des catégories, visuels hero
├── server/               # API Express
│   ├── src/
│   │   ├── routes/       # services, bookings, admin
│   │   ├── middleware/   # auth (JWT), gestion des erreurs
│   │   └── lib/          # Prisma, JWT, règles de réservation, WhatsApp
│   ├── prisma/           # schema.prisma, migrations, seed.js
│   └── .env.example      # Modèle des variables d'environnement
├── deploy-sql/           # Scripts SQL de mise à jour du catalogue
├── public/               # Fichiers statiques
└── DEPLOY.md             # Guide de déploiement (Namecheap)
```

## API — aperçu

| Route | Description |
| --- | --- |
| `GET /api/services` | Catalogue : catégories et prestations avec tarifs et disponibilité |
| `GET /api/bookings/availability?date=YYYY-MM-DD` | Créneaux disponibles pour une date donnée |
| `POST /api/bookings` | Créer une réservation (coordonnées validées, numéro marocain) |
| `/api/admin/...` | Administration (JWT administrateur requis) : prestations, réservations, paramètres |

Les réservations sont stockées en base (modèles Prisma `Category`,
`Service`, `Booking`, `BookingItem`, `Admin`) et la confirmation part vers
le WhatsApp du salon.

## Sécurité

- Mot de passe administrateur haché avec **bcrypt**, session par **JWT**
  (8 h) en cookie HttpOnly
- **Helmet**, CORS restreint aux origines configurées, **limitation de débit**
- Validation des données avec **Zod** (dont le format des numéros marocains)
- Corps des requêtes limité à 32 Ko
- Identifiants administrateur **uniquement via variables d'environnement** —
  aucun mot de passe n'est présent dans ce dépôt

## Déploiement

Le site est hébergé chez **Namecheap**
(https://centrebeauteloudaya.com). Le guide complet est dans
[`DEPLOY.md`](DEPLOY.md) : build du frontend (`npm run build`), lancement
de l'API avec `NODE_ENV=production`, variables d'environnement côté serveur.

---

## Contact

- 🌐 Site : [https://centrebeauteloudaya.com](https://centrebeauteloudaya.com)
- 📍 Google Maps : [Centre Beauté Loudaya, Loudaya, Marrakech](https://maps.app.goo.gl/e9RKXNCU6QzzNXhE6)
- 📸 Instagram : [@centredebeaute_loudaya](https://www.instagram.com/centredebeaute_loudaya)
- 📞 Téléphone / WhatsApp : 0666923910
- 🕙 Lundi – Samedi, 10:00 – 20:00 (fermé le dimanche)

*Projet privé — © Centre Beauté Loudaya, tous droits réservés.*
