-- update.sql — Safe one-time/retriable migration for production DB
-- Run in phpMyAdmin (or mysql CLI) on the target database.
-- Uses lowercase table names: booking, service, category (Linux MySQL case-sensitive).
-- Safe to run multiple times: ALTER TABLE uses IF NOT EXISTS via conditionals,
-- INSERT uses WHERE NOT EXISTS to skip duplicates.

/* ============================================================
   1. Add extra option columns to `booking` table
   Columns match schema.prisma:
     - extraOptionSlug  VARCHAR(40) NULL
     - extraOptionName  VARCHAR(160) NULL
     - extraOptionPrice INT DEFAULT 0
   ============================================================ */

-- MySQL 8.0+ supports IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- If running on older MySQL, these will error on 2nd run; that's acceptable for one-time migration.
ALTER TABLE `booking`
  ADD COLUMN `extraOptionSlug` VARCHAR(40) NULL AFTER `notes`,
  ADD COLUMN `extraOptionName` VARCHAR(160) NULL AFTER `extraOptionSlug`,
  ADD COLUMN `extraOptionPrice` INT NOT NULL DEFAULT 0 AFTER `extraOptionName`;

/* ============================================================
   2. Insert the two extra option services into `service`
   Category: "massage" (id from category where slug='massage')
   These are add-on only (opt-*) — never booked as main service.
   ============================================================ */

-- opt-deco: Option Nail Art & Finitions (+50 DH, 15 min)
INSERT INTO `service` (
  `slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`,
  `price`, `priceNote`, `duration`, `popular`, `badge`, `available`, `order`
)
SELECT
  'opt-deco',
  c.`id`,
  'Option Nail Art & Finitions (French, Chrome, Baby-Boomer, Cat Eye, Ongle 3D)',
  'إضافات نيل آرت وتزيين (فرينش، كروم، بيبي بومر، كات آي، ظفر 3D)',
  'Option add-on : ne peut être réservée qu\'en complément d\'un soin principal.',
  'خيار إضافي: لا يمكن حجزه إلا كإضافة لخدمة رئيسية.',
  50, 'DH', '15 min', 0, NULL, 1, 999
FROM `category` c
WHERE c.`slug` = 'massage'
  AND NOT EXISTS (
    SELECT 1 FROM `service` s WHERE s.`slug` = 'opt-deco'
  );

-- opt-paraffine-jelly: Option Soins Paraffine / Soins Jelly (+60 DH, 20 min)
INSERT INTO `service` (
  `slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`,
  `price`, `priceNote`, `duration`, `popular`, `badge`, `available`, `order`
)
SELECT
  'opt-paraffine-jelly',
  c.`id`,
  'Option Soins Paraffine / Soins Jelly',
  'عناية إضافية بالبرافين أو الجيلي المرطب (Paraffine / Jelly)',
  'Option add-on : soin hydratant intense pour les mains ou les pieds.',
  'خيار إضافي: عناية ترطيب عميق لليدين أو القدمين.',
  60, 'DH', '20 min', 0, NULL, 1, 1000
FROM `category` c
WHERE c.`slug` = 'massage'
  AND NOT EXISTS (
    SELECT 1 FROM `service` s WHERE s.`slug` = 'opt-paraffine-jelly'
  );