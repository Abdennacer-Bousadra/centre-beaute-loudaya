-- ============================================================================
-- update-services.sql — Catalogue des services
-- Base de production MySQL : centxfci_salon
-- ============================================================================
--
-- ⚠️  AVANT TOUT IMPORT : FAITES UN EXPORT COMPLET DE LA BASE DE PRODUCTION
--     (phpMyAdmin > base centxfci_salon > Exporter > SQL), puis conservez
--     précieusement ce fichier de sauvegarde avant d'importer celui-ci.
--
-- Ce script est prévu pour phpMyAdmin. Il est idempotent : il peut être
-- relancé sans créer de doublons.
--
-- Règles respectées :
--   • Tables/colonnes exactes de schema.prisma (casse et @map) :
--     category, service (pas de modification des tables booking,
--     bookingitem ni admin).
--   • Aucun DELETE / TRUNCATE / DROP sur service : les anciennes
--     prestations sont conservées, seulement passées à active = 0.
--   • Les services déjà référencés dans bookingitem gardent leur id.
--   • 8 catégories et le catalogue SERVICES_DATA.md.
--   • Encodage utf8mb4 (arabe correct).
--
-- Remarque MySQL : les ALTER TABLE sont des instructions DDL et sont
-- validées immédiatement par MySQL (commit implicite). Toutes les
-- modifications de DONNÉES sont, elles, regroupées dans la transaction
-- START TRANSACTION ... COMMIT plus bas.
-- ============================================================================

USE `centxfci_salon`;

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- ============================================================================
-- 1. Colonnes ajoutées à `service` (uniquement si elles n'existent pas)
--    Types Prisma : priceMax Int?, priceFrom Boolean @default(false),
--                   active Boolean @default(true)
-- ============================================================================

SET @db_name := DATABASE();

-- priceMax : INT NULL
SET @sql := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `service` ADD COLUMN `priceMax` INT NULL AFTER `price`',
    'SELECT 1'
  )
  FROM information_schema.`COLUMNS`
  WHERE `TABLE_SCHEMA` = @db_name
    AND `TABLE_NAME` = 'service'
    AND `COLUMN_NAME` = 'priceMax'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- priceFrom : TINYINT(1) NOT NULL DEFAULT 0
SET @sql := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `service` ADD COLUMN `priceFrom` TINYINT(1) NOT NULL DEFAULT 0 AFTER `priceMax`',
    'SELECT 1'
  )
  FROM information_schema.`COLUMNS`
  WHERE `TABLE_SCHEMA` = @db_name
    AND `TABLE_NAME` = 'service'
    AND `COLUMN_NAME` = 'priceFrom'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- active : TINYINT(1) NOT NULL DEFAULT 1
SET @sql := (
  SELECT IF(
    COUNT(*) = 0,
    'ALTER TABLE `service` ADD COLUMN `active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `available`',
    'SELECT 1'
  )
  FROM information_schema.`COLUMNS`
  WHERE `TABLE_SCHEMA` = @db_name
    AND `TABLE_NAME` = 'service'
    AND `COLUMN_NAME` = 'active'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

START TRANSACTION;

-- ============================================================================
-- 2. Toutes les prestations existantes sont désactivées.
--    Aucune suppression : les lignes et leurs id restent intacts pour
--    les références de bookingitem. Les services du nouveau catalogue
--    seront réactivés (active = 1) juste après, par leur slug.
-- ============================================================================

UPDATE `service` SET `active` = 0;

-- ============================================================================
-- 3. Catégories : mise à jour des 5 existantes + ajout des 3 nouvelles
--    Ordre, noms FR/AR et descriptions issus de SERVICES_DATA.md.
-- ============================================================================

INSERT INTO `category`
  (`slug`, `nameFr`, `nameAr`, `icon`, `descriptionFr`, `descriptionAr`, `order`)
VALUES
  ('coiffure', 'Coiffure & Traitements', 'العناية بالشعر', 'Scissors', 'Coupes, brushings, protéine et colorations sur-mesure pour sublimer votre chevelure.', 'قصات، بروشينغ، بروتين وصباغة مخصصة لإبراز جمال شعركِ.', 1),
  ('manucure', 'Manucure & Onglerie', 'العناية باليدين والأظافر', 'Hand', 'Manucure, vernis permanent et finitions élégantes pour des mains impeccables.', 'مانيكير، فيرنيس برماننت ولمسات أنيقة ليدين مثاليتين.', 2),
  ('pedicure', 'Pédicure', 'العناية بالقدمين', 'Footprints', 'Soins complets des pieds, paraffine et vernis pour un confort absolu.', 'عناية كاملة بالقدمين، بارافين وطلاء لراحة تامة.', 3),
  ('epilation', 'Épilation', 'إزالة الشعر', 'Sparkles', 'Épilation douce et précise pour une peau nette et soyeuse.', 'إزالة شعر لطيفة ودقيقة لبشرة ناعمة ونظيفة.', 4),
  ('soin-visage', 'Soin Visage', 'العناية بالبشرة والوجه', 'Droplets', 'Nettoyage, hydratation et soins professionnels pour une peau éclatante.', 'تنظيف، ترطيب وعنايات احترافية لبشرة مشرقة.', 5),
  ('maquillage', 'Maquillage & Esthétique', 'المكياج والتجميل', 'Palette', 'Maquillage léger ou soirée et pose de cils pour un regard sublime.', 'مكياج خفيف أو سهرة وتركيب رموش لإطلالة ساحرة.', 6),
  ('massage', 'Massage & Relaxation', 'المساج والاسترخاء', 'HeartHandshake', 'Massages relaxants aux huiles pour libérer les tensions et retrouver l''équilibre.', 'مساج استرخائي بالزيوت لتحرير التوتر واستعادة التوازن.', 7),
  ('packs-mariee', 'Packs Mariée', 'باقات العرائس', 'Crown', 'Des formules complètes pour accompagner la mariée avant et pendant son grand jour.', 'باقات متكاملة لمرافقة العروس قبل يومها الكبير وأثناءه.', 8)
ON DUPLICATE KEY UPDATE
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `icon` = VALUES(`icon`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `order` = VALUES(`order`);

-- ============================================================================
-- 4. Services : mise à jour par slug (id conservé) ou insertion.
--    Les services existants qui ne font pas partie du nouveau catalogue
--    restent en base avec active = 0 (étape 2).
-- ============================================================================

-- coiffure / coif-coupe — Coupe de cheveux
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'coif-coupe', `id`, 'Coupe de cheveux', 'قص الشعر', 'Coupe personnalisée adaptée à votre style et à votre visage.', 'قصة مخصصة تناسب أسلوبكِ وملامح وجهكِ.', 50, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 1
FROM `category`
WHERE `slug` = 'coiffure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- coiffure / coif-pointes — Coupe des pointes
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'coif-pointes', `id`, 'Coupe des pointes', 'قص أطراف الشعر', 'Rafraîchit les pointes et favorise une repousse saine.', 'تجديد أطراف الشعر وتعزيز نمو صحي.', 20, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 2
FROM `category`
WHERE `slug` = 'coiffure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- coiffure / coif-brushing — Brushing (selon longueur et type)
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'coif-brushing', `id`, 'Brushing (selon longueur et type)', 'بروشينغ', 'Brushing soigné selon la longueur et le type de cheveux.', 'بروشينغ أنيق حسب طول ونوع الشعر.', 100, 250, 0, 'DH', '30 min', 0, NULL, 1, 1, 3
FROM `category`
WHERE `slug` = 'coiffure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- coiffure / coif-proteine — Protéine / Kératine
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'coif-proteine', `id`, 'Protéine / Kératine', 'بروتين / كيراتين', 'Lissage profond et réparation de la fibre capillaire.', 'تمليس عميق وإصلاح ألياف الشعر.', 500, 800, 0, 'DH', '30 min', 0, NULL, 1, 1, 4
FROM `category`
WHERE `slug` = 'coiffure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- coiffure / coif-hydratation — Hydratation
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'coif-hydratation', `id`, 'Hydratation', 'ترطيبة', 'Soin hydratant intense pour des cheveux souples et brillants.', 'عناية مرطبة مكثفة لشعر ناعم ولامع.', 300, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 5
FROM `category`
WHERE `slug` = 'coiffure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- coiffure / coif-coloration — Coloration
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'coif-coloration', `id`, 'Coloration', 'صباغة الشعر', 'Coloration professionnelle réalisée sur-mesure.', 'صباغة احترافية حسب اختياركِ.', 250, NULL, 1, 'DH', '30 min', 0, NULL, 1, 1, 6
FROM `category`
WHERE `slug` = 'coiffure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- coiffure / coif-meches — Mèches sans coloration
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'coif-meches', `id`, 'Mèches sans coloration', 'لي ميش بدون صباغة', 'Mèches lumineuses sans coloration complète.', 'خصلات مضيئة دون صباغة كاملة.', 300, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 7
FROM `category`
WHERE `slug` = 'coiffure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- coiffure / coif-meches-coloration — Mèches + coloration
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'coif-meches-coloration', `id`, 'Mèches + coloration', 'لي ميش + صباغة', 'Mèches et coloration pour un résultat lumineux et nuancé.', 'خصلات مع صباغة لنتيجة مشرقة ومتناسقة.', 600, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 8
FROM `category`
WHERE `slug` = 'coiffure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-classique — Manucure classique
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-classique', `id`, 'Manucure classique', 'مانيكير كلاسيك', 'Mise en forme des ongles et soin des cuticules.', 'تشكيل الأظافر والعناية بالجلد المحيط.', 30, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 1
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-spa — Manucure SPA
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-spa', `id`, 'Manucure SPA', 'مانيكير سبا', 'Soin complet des mains avec gommage et masque hydratant.', 'عناية كاملة باليدين مع تقشير وماسك مرطب.', 70, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 2
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-vernis-classique — Vernis classique
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-vernis-classique', `id`, 'Vernis classique', 'فيرنيس كلاسيك', 'Application soignée d''un vernis classique.', 'وضع أنيق لطلاء أظافر كلاسيكي.', 20, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 3
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-vernis-permanent — Vernis permanent classique
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-vernis-permanent', `id`, 'Vernis permanent classique', 'فيرنيس برماننت كلاسيك', 'Vernis permanent longue tenue et brillance durable.', 'طلاء برماننت يدوم طويلاً بلمعان دائم.', 50, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 4
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-manucure-vernis-permanent — Manucure + vernis permanent
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-manucure-vernis-permanent', `id`, 'Manucure + vernis permanent', 'مانيكير + فيرنيس برماننت', 'Manucure complète avec finition vernis permanent.', 'مانيكير كامل مع لمسة فيرنيس برماننت.', 80, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 5
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-french-smile — French smile
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-french-smile', `id`, 'French smile', 'فرنش سمايل', 'French smile réalisé avec précision.', 'فرنش سمايل منفذ بدقة.', 30, 40, 0, 'DH', '30 min', 0, NULL, 1, 1, 6
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-french-carre — French carré
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-french-carre', `id`, 'French carré', 'فرنش كاريه', 'French carré net et élégant.', 'فرنش كاريه أنيق ومرتب.', 40, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 7
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-french-gel — French gel
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-french-gel', `id`, 'French gel', 'فرنش جل', 'French en gel pour une tenue renforcée.', 'فرنش بالجل لثبات أقوى.', 60, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 8
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-pose-french — Pose d'ongles avec french
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-pose-french', `id`, 'Pose d''ongles avec french', 'بوز أظافر مع فرنش', 'Pose d''ongles avec finition french.', 'تركيب أظافر مع لمسة فرنش.', 80, 120, 0, 'DH', '30 min', 0, NULL, 1, 1, 9
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-design-leger — Design léger
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-design-leger', `id`, 'Design léger', 'ديزاين خفيف', 'Décoration discrète et raffinée.', 'تزيين خفيف وراقٍ.', 25, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 10
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-design-charge — Design chargé
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-design-charge', `id`, 'Design chargé', 'ديزاين محمّل', 'Décoration riche et travaillée.', 'تزيين غني ومتقن.', 70, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 11
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-paraffine-mains — Paraffine mains
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-paraffine-mains', `id`, 'Paraffine mains', 'بارافين اليدين', 'Bain de paraffine nourrissant pour les mains.', 'حمام بارافين مغذي لليدين.', 40, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 12
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-depose-gel — Dépose gel
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-depose-gel', `id`, 'Dépose gel', 'إزالة الجل', 'Retrait doux et sûr du gel.', 'إزالة آمنة ولطيفة للجل.', 40, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 13
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- manucure / manu-depose-permanent — Dépose permanent
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'manu-depose-permanent', `id`, 'Dépose permanent', 'إزالة البرماننت', 'Retrait du vernis permanent sans abîmer l''ongle.', 'إزالة الفيرنيس برماننت دون إتلاف الظفر.', 20, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 14
FROM `category`
WHERE `slug` = 'manucure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- pedicure / pedi-simple — Pédicure simple
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pedi-simple', `id`, 'Pédicure simple', 'باديكير بسيط', 'Soin essentiel des pieds et des ongles.', 'عناية أساسية بالقدمين والأظافر.', 50, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 1
FROM `category`
WHERE `slug` = 'pedicure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- pedicure / pedi-complete — Pédicure complète
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pedi-complete', `id`, 'Pédicure complète', 'باديكير كامل', 'Soin complet avec nettoyage et hydratation.', 'عناية كاملة مع تنظيف وترطيب.', 80, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 2
FROM `category`
WHERE `slug` = 'pedicure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- pedicure / pedi-spa — Pédicure SPA
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pedi-spa', `id`, 'Pédicure SPA', 'باديكير سبا', 'Rituel spa relaxant pour des pieds doux et reposés.', 'طقس سبا مريح لقدمين ناعمتين.', 120, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 3
FROM `category`
WHERE `slug` = 'pedicure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- pedicure / pedi-permanent — Pédicure + permanent
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pedi-permanent', `id`, 'Pédicure + permanent', 'باديكير + برماننت', 'Pédicure complète avec vernis permanent.', 'باديكير كامل مع فيرنيس برماننت.', 120, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 4
FROM `category`
WHERE `slug` = 'pedicure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- pedicure / pedi-paraffine — Pédicure avec paraffine
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pedi-paraffine', `id`, 'Pédicure avec paraffine', 'باديكير مع بارافين', 'Pédicure enrichie d''un soin à la paraffine.', 'باديكير مع عناية بالبارافين.', 100, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 5
FROM `category`
WHERE `slug` = 'pedicure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- pedicure / pedi-paraffine-pieds — Paraffine pieds
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pedi-paraffine-pieds', `id`, 'Paraffine pieds', 'بارافين القدمين', 'Bain de paraffine hydratant pour les pieds.', 'حمام بارافين مرطب للقدمين.', 50, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 6
FROM `category`
WHERE `slug` = 'pedicure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- pedicure / pedi-pack-paraffine — Pack paraffine mains et pieds
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pedi-pack-paraffine', `id`, 'Pack paraffine mains et pieds', 'باك بارافين اليدين والقدمين', 'Soin paraffine complet pour mains et pieds.', 'عناية بارافين كاملة لليدين والقدمين.', 80, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 7
FROM `category`
WHERE `slug` = 'pedicure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- pedicure / pedi-pose-vernis — Pose vernis
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pedi-pose-vernis', `id`, 'Pose vernis', 'وضع الفيرنيس', 'Application de vernis sur les pieds.', 'وضع طلاء على القدمين.', 60, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 8
FROM `category`
WHERE `slug` = 'pedicure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- pedicure / pedi-gommage — Gommage des pieds
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pedi-gommage', `id`, 'Gommage des pieds', 'تقشير القدمين', 'Gommage exfoliant pour une peau lisse.', 'تقشير لإزالة الخشونة ونعومة البشرة.', 30, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 9
FROM `category`
WHERE `slug` = 'pedicure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- pedicure / pedi-massage — Massage des pieds (15 min)
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pedi-massage', `id`, 'Massage des pieds (15 min)', 'مساج القدمين (15 دقيقة)', 'Massage relaxant des pieds pendant 15 minutes.', 'مساج مريح للقدمين لمدة 15 دقيقة.', 40, NULL, 0, 'DH', '15 min', 0, NULL, 1, 1, 10
FROM `category`
WHERE `slug` = 'pedicure'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- epilation / epil-sourcils — Sourcils
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'epil-sourcils', `id`, 'Sourcils', 'الحواجب', 'Mise en forme précise des sourcils.', 'تحديد دقيق للحواجب.', 20, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 1
FROM `category`
WHERE `slug` = 'epilation'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- epilation / epil-menton — Menton
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'epil-menton', `id`, 'Menton', 'الذقن', 'Épilation ciblée du menton.', 'إزالة شعر الذقن بدقة.', 20, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 2
FROM `category`
WHERE `slug` = 'epilation'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- epilation / epil-visage — Visage complet
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'epil-visage', `id`, 'Visage complet', 'الوجه كامل', 'Épilation complète du visage.', 'إزالة كاملة لشعر الوجه.', 50, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 3
FROM `category`
WHERE `slug` = 'epilation'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- epilation / epil-aisselles — Aisselles
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'epil-aisselles', `id`, 'Aisselles', 'تحت الإبطين', 'Épilation douce des aisselles.', 'إزالة لطيفة لشعر الإبطين.', 20, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 4
FROM `category`
WHERE `slug` = 'epilation'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- epilation / epil-bras-coude — Bras jusqu'au coude
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'epil-bras-coude', `id`, 'Bras jusqu''au coude', 'الذراعين حتى المرفق', 'Épilation des bras jusqu''au coude.', 'إزالة شعر الذراعين حتى المرفق.', 40, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 5
FROM `category`
WHERE `slug` = 'epilation'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- epilation / epil-bras-complets — Bras complets
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'epil-bras-complets', `id`, 'Bras complets', 'الذراعين كاملين', 'Épilation complète des bras.', 'إزالة كاملة لشعر الذراعين.', 60, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 6
FROM `category`
WHERE `slug` = 'epilation'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- epilation / epil-jambes — Jambes complètes
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'epil-jambes', `id`, 'Jambes complètes', 'الساقين كاملين', 'Épilation complète des jambes.', 'إزالة كاملة لشعر الساقين.', 100, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 7
FROM `category`
WHERE `slug` = 'epilation'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- epilation / epil-corps — Corps complet
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'epil-corps', `id`, 'Corps complet', 'الجسم كامل', 'Épilation du corps entier.', 'إزالة شعر الجسم كامل.', 350, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 8
FROM `category`
WHERE `slug` = 'epilation'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- soin-visage / visage-nettoyage-masque — Nettoyage de visage + masque
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'visage-nettoyage-masque', `id`, 'Nettoyage de visage + masque', 'تنظيف الوجه + ماسك', 'Nettoyage profond suivi d''un masque adapté.', 'تنظيف عميق يتبعه ماسك مناسب.', 120, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 1
FROM `category`
WHERE `slug` = 'soin-visage'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- soin-visage / visage-hydrafacial — Hydrafacial
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'visage-hydrafacial', `id`, 'Hydrafacial', 'هايدرافيشل', 'Soin hydratant et purifiant professionnel.', 'عناية احترافية مرطبة ومنقية.', 500, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 2
FROM `category`
WHERE `slug` = 'soin-visage'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- maquillage / maqui-leger — Maquillage léger
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'maqui-leger', `id`, 'Maquillage léger', 'مكياج خفيف', 'Mise en beauté naturelle et lumineuse.', 'مكياج طبيعي ومشرق.', 50, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 1
FROM `category`
WHERE `slug` = 'maquillage'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- maquillage / maqui-soiree — Maquillage soirée / lourd
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'maqui-soiree', `id`, 'Maquillage soirée / lourd', 'مكياج سهرة / ثقيل', 'Maquillage intense pour les grandes occasions.', 'مكياج كثيف للمناسبات الكبرى.', 100, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 2
FROM `category`
WHERE `slug` = 'maquillage'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- maquillage / maqui-cils — Pose de cils
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'maqui-cils', `id`, 'Pose de cils', 'تركيب الرموش', 'Pose de cils pour un regard intense.', 'تركيب رموش لإطلالة جذابة.', 50, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 3
FROM `category`
WHERE `slug` = 'maquillage'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- massage / massage-nuque — Massage nuque, épaules et tête (15 min)
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'massage-nuque', `id`, 'Massage nuque, épaules et tête (15 min)', 'مساج الرقبة والكتفين والرأس (15 دقيقة)', 'Massage court pour détendre nuque, épaules et tête.', 'مساج قصير لإرخاء الرقبة والكتفين والرأس.', 60, NULL, 0, 'DH', '15 min', 0, NULL, 1, 1, 1
FROM `category`
WHERE `slug` = 'massage'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- massage / massage-dos — Massage dos et épaules (30 min)
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'massage-dos', `id`, 'Massage dos et épaules (30 min)', 'مساج الظهر والكتفين (30 دقيقة)', 'Massage ciblé du dos et des épaules pendant 30 minutes.', 'مساج للظهر والكتفين لمدة 30 دقيقة.', 120, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 2
FROM `category`
WHERE `slug` = 'massage'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- massage / massage-relax-45 — Relaxation corps entier (45 min)
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'massage-relax-45', `id`, 'Relaxation corps entier (45 min)', 'استرخاء الجسم كامل (45 دقيقة)', 'Détente complète du corps pendant 45 minutes.', 'استرخاء كامل للجسم لمدة 45 دقيقة.', 180, NULL, 0, 'DH', '45 min', 0, NULL, 1, 1, 3
FROM `category`
WHERE `slug` = 'massage'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- massage / massage-huiles — Massage corps entier aux huiles aromatiques (60 min)
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'massage-huiles', `id`, 'Massage corps entier aux huiles aromatiques (60 min)', 'مساج الجسم كامل بالزيوت العطرية (60 دقيقة)', 'Massage du corps aux huiles aromatiques pendant 60 minutes.', 'مساج للجسم بالزيوت العطرية لمدة 60 دقيقة.', 250, NULL, 0, 'DH', '60 min', 0, NULL, 1, 1, 4
FROM `category`
WHERE `slug` = 'massage'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- massage / massage-relax-90 — Relaxation corps entier (90 min)
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'massage-relax-90', `id`, 'Relaxation corps entier (90 min)', 'استرخاء الجسم كامل (90 دقيقة)', 'Relaxation profonde du corps pendant 90 minutes.', 'استرخاء عميق للجسم لمدة 90 دقيقة.', 350, NULL, 0, 'DH', '90 min', 0, NULL, 1, 1, 5
FROM `category`
WHERE `slug` = 'massage'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- packs-mariee / pack-mariee-jour — Maquillage + coiffure mariée (1 jour)
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pack-mariee-jour', `id`, 'Maquillage + coiffure mariée (1 jour)', 'مكياج + تسريحة العروس (يوم واحد)', 'Maquillage et coiffure de mariée pour le grand jour.', 'مكياج وتسريحة العروس ليوم الزفاف.', 1000, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 1
FROM `category`
WHERE `slug` = 'packs-mariee'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

-- packs-mariee / pack-mariee-complet — Pack mariée complet (4 jours)
INSERT INTO `service`
  (`slug`, `categoryId`, `nameFr`, `nameAr`, `descriptionFr`, `descriptionAr`, `price`, `priceMax`, `priceFrom`, `priceNote`, `duration`, `popular`, `badge`, `available`, `active`, `order`)
SELECT
  'pack-mariee-complet', `id`, 'Pack mariée complet (4 jours)', 'باقة العروس الكاملة (4 أيام)', 'Nettoyage de visage, soins du corps complets et autres prestations de la mariée.', 'تنظيف الوجه، عناية كاملة بالجسم وباقي خدمات العروس.', 2000, NULL, 0, 'DH', '30 min', 0, NULL, 1, 1, 2
FROM `category`
WHERE `slug` = 'packs-mariee'
ON DUPLICATE KEY UPDATE
  `categoryId` = VALUES(`categoryId`),
  `nameFr` = VALUES(`nameFr`),
  `nameAr` = VALUES(`nameAr`),
  `descriptionFr` = VALUES(`descriptionFr`),
  `descriptionAr` = VALUES(`descriptionAr`),
  `price` = VALUES(`price`),
  `priceMax` = VALUES(`priceMax`),
  `priceFrom` = VALUES(`priceFrom`),
  `priceNote` = VALUES(`priceNote`),
  `duration` = VALUES(`duration`),
  `popular` = VALUES(`popular`),
  `badge` = VALUES(`badge`),
  `available` = VALUES(`available`),
  `active` = VALUES(`active`),
  `order` = VALUES(`order`);

COMMIT;

-- ============================================================================
-- Fin du script. Vérifications conseillées après import :
--   SELECT COUNT(*) FROM `category`;                    -- 8 attendues
--   SELECT COUNT(*) FROM `service` WHERE `active` = 1;   -- 52 attendues
--   SELECT * FROM `service` WHERE `active` = 0;          -- anciennes conservées
--   Les tables booking, bookingitem et admin n'ont pas été modifiées.
-- ============================================================================
