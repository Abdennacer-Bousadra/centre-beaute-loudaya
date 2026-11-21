# 🌸 Centre Beauté Loudaya | مركز التجميل الوداية
> Application Web & Système de Réservation Haut de Gamme pour Salon de Beauté & Spa Féminin.

---

## ✨ Aperçu du Projet

Site web complet, ultra réactif, bilingue (**Français & Arabe avec support RTL/LTR**), conçu sur mesure pour le **Centre de Beauté Loudaya** (مركز التجميل الوداية).

L'application allie une esthétique féminine et luxueuse (teintes Rose Gold, Prune Magenta, et Or Métallique) à un parcours de conversion optimisé pour attirer et fidéliser la clientèle féminine.

---

## 🛠️ Stack Technique

- **Framework** : React.js (Vite)
- **Styling** : Tailwind CSS avec palette personnalisée, typographie soignée (Playfair Display, Tajawal, Plus Jakarta Sans) et effets verres/animations.
- **Iconographie** : Lucide React
- **Internationalisation (i18n)** : `i18next` & `react-i18next` avec inversion automatique du sens de lecture (`dir="rtl"` en Arabe, `dir="ltr"` en Français).
- **Animations & UX** : `canvas-confetti` pour la célébration lors de la validation du rendez-vous, animations fluides, boutons WhatsApp interactifs.
- **Sécurité & Données** : Assainissement des saisies de formulaires, validation regex des numéros de téléphone marocains, panneau d'administration sécurisé par mot de passe avec persistance locale (`localStorage`).

---

## 🎨 Palette de Couleurs & Charte Graphique

- **Couleur Primaire (Rose Gold / Soft Pink)** : `#E8A0BF` / `#D47FA6`
- **Accent Secondaire (Deep Magenta / Plum Purple)** : `#581845` / `#6C224B`
- **Accents Dorés (Metallic Gold / Warm Gold)** : `#D4AF37` / `#E5C158`
- **Arrière-plans (Soft Cream / Light Beige)** : `#FDFBF7` / `#FAF3E0`
- **Texte Principal (Dark Charcoal)** : `#2C2C2C`

---

## 📋 Prestations & Menu des Soins Inclus

1. **Épilation / إزالة الشعر** :
   - *Pack Vedette* : Épilation Complète (Maillot Intégral, Jambes Complètes, Bras Complets, Aisselles) : **350 DH**
   - Sourcil (50 DH), Duvet (30 DH), Visage au fil (130 DH), Visage à la cire (130 DH), Menton (40 DH), Aisselles (50 DH), Bras entier (100 DH), Demi-bras (50 DH), Jambe entière (150 DH), Demi-jambe (75 DH), Maillot intégral (150 DH), Fesses (70 DH), Ventre (80 DH), Dos (100 DH).
   - Option en plus (French, Chrome, Baby-Boomer, Cat Eye, Ongle 3D) : **50 DH**
   - Option Soins Paraffine / Soins Jelly : **60 DH**

2. **Manucure / العناية باليدين والأظافر** :
   - Manucure / Manucure Spa Vernis Normal : **90 DH / 140 DH**
   - Manucure Renforcement Vernis Permanent : **250 DH**
   - Manucure Spa Semi-Permanent : **280 DH**
   - Manucure + Faux Ongles Permanent : **300 DH**
   - Manucure + Capsule Permanent : **300 DH**
   - Renforcement Semilac Main, Bombé : **300 DH**
   - Pose Permanent Renforcement Manu : **250 DH**

3. **Pédicure / العناية بالقدمين** :
   - Pédicure Spa Vernis Normal : **190 DH**
   - Pédicure Médicale : à partir de **250 DH**
   - Pédicure Médicale Permanent : **400 DH**
   - Pédicure Spa Capsule Permanente : **380 DH**
   - Pédicure Spa Faux Ongles Permanent : **350 DH**
   - Gel X Pieds : **400 DH**
   - Renforcement Pieds : **350 DH**
   - BIAB (The Gel Bottle) : **400 DH**
   - Dépose Permanent : **50 DH** | Dépose Gel / BIAB : **100 DH**

4. **Coiffure & Soins Cheveux / Cils & Sourcils** :
   - Cils Normal : **100 DH**
   - Sourcils et Teinture : **130 DH**
   - Coupe Cheveux : **200 DH** | Pointes Cheveux : **100 DH**
   - Brushing : à partir de **70 DH** | Brushing Bouclé : à partir de **80 DH**
   - Protéine Cheveux Courts : **900 DH**
   - Protéine Cheveux Demi-Longs : **1200 DH**
   - Protéine Cheveux Longs : à partir de **1300 DH**
   - Coloration (Produit fourni) : **350 DH** | Coloration Sans Produit : **150 DH**

5. **Massage & Relaxation / التدليك والاسترخاء** :
   - Massage Relaxant et Tonique : **400 DH** (60 min de pure détente)

---

## 📅 Système de Réservation & Alerte WhatsApp

- **Parcours en 4 étapes** :
  1. Choix du soin (filtrable par catégorie avec recherche instantanée).
  2. Sélection de la date et de l'heure (créneaux de 10h00 à 20h00). **Les dimanches sont strictement désactivés et signalés comme jour de fermeture**.
  3. Saisie sécurisée des coordonnées de la cliente (Nom, Téléphone WhatsApp, remarques).
  4. Récapitulatif ticket et **redirection automatique avec message WhatsApp préformaté** vers le numéro officiel du salon : `0666923910` (`wa.me/212666923910`).

---

## 🔐 Espace Administration (`/admin` ou Icône Cadenas)

- **Accès sécurisé** par mot de passe : `loudaya2026`
- **Gestion des prestations** : Ajout, modification de tarif, modification d'intitulé (FR & AR), bascule de disponibilité (Actif / Inactif) et suppression.
- **Suivi des demandes de rendez-vous** : Visualisation de toutes les réservations, filtrage par statut (*En attente, Confirmé, Terminé, Annulé*), contact direct de la cliente sur WhatsApp en un clic.
- **Paramètres du salon** : Modification des horaires, du numéro WhatsApp, et du statut d'ouverture exceptionnelle.

---

## 🚀 Installation & Lancement Local

1. Ouvrez votre terminal dans le répertoire du projet :
```bash
cd "C:\Users\ordin\.gemini\antigravity\scratch\center-beaute-loudaya"
```

2. Installez les dépendances (si ce n'est pas déjà fait) :
```bash
npm install
```

3. Lancez le serveur de développement :
```bash
npm run dev
```

4. Ouvrez votre navigateur sur l'adresse indiquée (ex: `http://localhost:5173`).

---

## 📍 Informations de Contact Officielles

- **Nom** : Centre Beauté Loudaya / مركز التجميل الوداية
- **Téléphone** : `0666923910`
- **WhatsApp** : `+212666923910`
- **Instagram** : `@centredebeaute_loudaya`
- **Horaires** : Lundi au Samedi de 10h00 à 20h00 — **Fermé le Dimanche**
- **Slogan** : *Prenez soin de vous ♡* / *أبرزي جمالكِ الطبيعي ودللي نفسكِ*
