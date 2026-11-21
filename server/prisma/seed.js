/**
 * Seed Prisma — Centre de Beauté Loudaya
 *
 * Regroupe l'intégralité des catégories et des prestations/prix affichés sur le
 * site, puis crée le compte administrateur à partir de ADMIN_EMAIL et
 * ADMIN_PASSWORD (server/.env).
 *
 * Le seed est idempotent : il peut être relancé sans dupliquer les données.
 *   npx prisma db seed
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

/* ------------------------------------------------------------------ */
/* Données de référence                                                */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  {
    slug: 'epilation',
    nameFr: 'Épilation',
    nameAr: 'إزالة الشعر',
    icon: 'Sparkles',
    descriptionFr:
      'Une peau douce et soyeuse grâce à nos techniques de cire tiède et épilation au fil précise.',
    descriptionAr:
      'بشرة ناعمة كالحرير بأحدث تقنيات الشمع الدافئ والخيط الدقيق للحفاظ على نعومة ونضارة بشرتكِ.'
  },
  {
    slug: 'manucure',
    nameFr: 'Manucure & Onglerie',
    nameAr: 'العناية باليدين والأظافر',
    icon: 'Hand',
    descriptionFr:
      'Sublimez vos mains avec nos soins de manucure spa, renforcement Semilac et poses tendance.',
    descriptionAr:
      'تألقي بأظافر راقية وجذابة مع جلسات المانيكير سبا وتقوية الأظافر الطبيعية بأرقى الماركات.'
  },
  {
    slug: 'pedicure',
    nameFr: 'Pédicure & Pieds',
    nameAr: 'العناية بالقدمين',
    icon: 'Footprints',
    descriptionFr:
      'Détente et beauté des pieds : Pédicure spa, soins médicaux, Gel X, et The Gel Bottle (BIAB).',
    descriptionAr:
      'راحة وانتعاش لقدميكِ مع الباديكير سبا والعناية الطبية وتركيب الجيل إكس و BIAB لتغذية الأظافر.'
  },
  {
    slug: 'coiffure',
    nameFr: 'Coiffure & Soins Cheveux',
    nameAr: 'الشعر والحواجب والرموش',
    icon: 'Scissors',
    descriptionFr:
      'Coupes modernes, brushings soyeux, soins de protéine lissante et colorations sur-mesure.',
    descriptionAr:
      'قصات عصرية، تسريحات براقة، بروتين معالج للشعر، وتلوين شعر محترف يمنحكِ إطلالة ملكية.'
  },
  {
    slug: 'massage',
    nameFr: 'Massage & Relaxation',
    nameAr: 'التدليك والاسترخاء',
    icon: 'HeartHandshake',
    descriptionFr:
      "Un pur moment d'évasion pour libérer les tensions musculaires et apaiser le corps et l'esprit.",
    descriptionAr:
      'جلسة تدليك متكاملة تمنحكِ الاسترخاء التام وتجدد طاقتكِ وحيويتكِ بعيداً عن صخب الحياة اليومية.'
  }
];

const SERVICES = [
  /* --------------------- 1. Épilation (15) --------------------- */
  {
    slug: 'epil-complete', category: 'epilation',
    nameFr: 'Épilation Complète',
    nameAr: 'إزالة الشعر كاملة (باقة شاملة)',
    descriptionFr: 'Maillot Intégral + Jambes Complètes + Bras Complets + Aisselles',
    descriptionAr: 'تشمل: بيكيني كامل + أرجل كاملة + أذرع كاملة + تحت الإبطين',
    price: 350, priceNote: 'DH', duration: '60 min', popular: true, badge: 'Pack Vedette ⭐'
  },
  {
    slug: 'epil-sourcil', category: 'epilation',
    nameFr: 'Sourcil',
    nameAr: 'تنظيف وتحديد الحواجب',
    descriptionFr: 'Redessinez harmonieusement votre ligne de sourcils avec précision.',
    descriptionAr: 'رسم وتحديد الحواجب بدقة عالية بما يناسب ملامح وجهكِ الجميلة.',
    price: 50, priceNote: 'DH', duration: '15 min'
  },
  {
    slug: 'epil-duvet', category: 'epilation',
    nameFr: 'Duvet (Lèvre Supérieure)',
    nameAr: 'إزالة شعر الشارب (فوق الشفاه)',
    descriptionFr: 'Épilation nette et douce au fil ou à la cire délicate.',
    descriptionAr: 'إزالة شعر الشفاه العلوية بلطف ودقة بالخيط أو الشمع.',
    price: 30, priceNote: 'DH', duration: '10 min'
  },
  {
    slug: 'epil-visage-fil', category: 'epilation',
    nameFr: 'Visage au Fil',
    nameAr: 'إزالة شعر الوجه بالخيط',
    descriptionFr: 'Technique orientale précise qui laisse le teint lumineux et lisse.',
    descriptionAr: 'تقنية الخيط الشرقية الدقيقة لبشرة صافية خالية من الشوائب ومشرقة.',
    price: 130, priceNote: 'DH', duration: '30 min', popular: true
  },
  {
    slug: 'epil-visage-cire', category: 'epilation',
    nameFr: 'Visage à la Cire',
    nameAr: 'إزالة شعر الوجه بالشمع',
    descriptionFr: 'Cire hypoallergénique spéciale peaux sensibles pour un visage ultra doux.',
    descriptionAr: 'شمع خاص للبشرة الحساسة لتقشير لطيف ونعومة تدوم طويلاً.',
    price: 130, priceNote: 'DH', duration: '25 min'
  },
  {
    slug: 'epil-menton', category: 'epilation',
    nameFr: 'Menton',
    nameAr: 'إزالة شعر الذقن',
    descriptionFr: 'Épilation ciblée et rapide du menton.',
    descriptionAr: 'إزالة سريعة ودقيقة لشعر الذقن.',
    price: 40, priceNote: 'DH', duration: '10 min'
  },
  {
    slug: 'epil-aisselles', category: 'epilation',
    nameFr: 'Aisselles',
    nameAr: 'إزالة شعر الإبطين',
    descriptionFr: 'Cire tiède apaisante pour une repousse ralentie et peau douce.',
    descriptionAr: 'شمع مهدئ لتأخير نمو الشعر والحفاظ على نظافة وانتعاش دائم.',
    price: 50, priceNote: 'DH', duration: '15 min', popular: true
  },
  {
    slug: 'epil-bras-entier', category: 'epilation',
    nameFr: 'Bras Entier',
    nameAr: 'إزالة شعر الذراعين كاملين',
    descriptionFr: "Épilation soignée des bras complets jusqu'aux épaules.",
    descriptionAr: 'إزالة شعر الذراعين بالكامل من الأصابع إلى الكتفين.',
    price: 100, priceNote: 'DH', duration: '30 min'
  },
  {
    slug: 'epil-demi-bras', category: 'epilation',
    nameFr: 'Demi-Bras',
    nameAr: 'إزالة شعر نصف الذراعين',
    descriptionFr: 'Épilation des avant-bras.',
    descriptionAr: 'إزالة شعر الساعدين حتى الكوع.',
    price: 50, priceNote: 'DH', duration: '20 min'
  },
  {
    slug: 'epil-jambe-entiere', category: 'epilation',
    nameFr: 'Jambe Entière',
    nameAr: 'إزالة شعر الأرجل كاملة',
    descriptionFr: 'Jambes douces, lisses et sublimées.',
    descriptionAr: 'أرجل فائقة النعومة ومظهر حريري خالي من الشعر.',
    price: 150, priceNote: 'DH', duration: '40 min', popular: true
  },
  {
    slug: 'epil-demi-jambe', category: 'epilation',
    nameFr: 'Demi-Jambe',
    nameAr: 'إزالة شعر نصف الأرجل',
    descriptionFr: 'Mollets et genoux impeccablement lisses.',
    descriptionAr: 'إزالة شعر أسفل الركبة لنعومة سريعة وجذابة.',
    price: 75, priceNote: 'DH', duration: '25 min'
  },
  {
    slug: 'epil-maillot-integral', category: 'epilation',
    nameFr: 'Maillot Intégral',
    nameAr: 'إزالة شعر البيكيني بالكامل',
    descriptionFr: "Soin intime réalisé dans le plus grand respect de l'hygiène et du confort.",
    descriptionAr: 'عناية خاصة ونظافة تامة مع مراعاة أعلى معايير الخصوصية والراحة.',
    price: 150, priceNote: 'DH', duration: '30 min'
  },
  {
    slug: 'epil-fesses', category: 'epilation',
    nameFr: 'Fesses',
    nameAr: 'إزالة شعر المؤخرة',
    descriptionFr: 'Épilation délicate pour une peau impeccable.',
    descriptionAr: 'عناية لطيفة ودقيقة لنعومة فائقة.',
    price: 70, priceNote: 'DH', duration: '15 min'
  },
  {
    slug: 'epil-ventre', category: 'epilation',
    nameFr: 'Ventre',
    nameAr: 'إزالة شعر البطن',
    descriptionFr: 'Épilation douce de la zone abdominale.',
    descriptionAr: 'إزالة شعر منطقة البطن بلطف.',
    price: 80, priceNote: 'DH', duration: '20 min'
  },
  {
    slug: 'epil-dos', category: 'epilation',
    nameFr: 'Dos',
    nameAr: 'إزالة شعر الظهر',
    descriptionFr: 'Épilation complète du dos pour un rendu net et propre.',
    descriptionAr: 'إزالة شعر الظهر بالكامل لملمس حريري ونظيف.',
    price: 100, priceNote: 'DH', duration: '25 min'
  },

  /* ------------------ 2. Manucure & Ongles (8) ------------------ */
  {
    slug: 'manu-normal', category: 'manucure',
    nameFr: 'Manucure Vernis Normal',
    nameAr: 'مانيكير كلاسيكي مع طلاء عادي',
    descriptionFr: "Limage, cuticules, gommage et application d'un vernis classique éclatant.",
    descriptionAr: 'برد الأظافر، إزالة الجلد الزائد، تقشير، وطلاء كلاسيكي جذاب.',
    price: 90, priceNote: 'DH', duration: '35 min'
  },
  {
    slug: 'manu-spa-normal', category: 'manucure',
    nameFr: 'Manucure Spa Vernis Normal',
    nameAr: 'مانيكير سبا مع طلاء عادي',
    descriptionFr: 'Soin spa complet : bain aromatique, gommage doux, masque hydratant et vernis.',
    descriptionAr: 'حمام عطري فاخر، تقشير ناعم، ماسك ترطيب عميق مع طلاء أظافر.',
    price: 140, priceNote: 'DH', duration: '50 min', popular: true
  },
  {
    slug: 'manu-renf-permanent', category: 'manucure',
    nameFr: 'Manucure Renforcement Vernis Permanent',
    nameAr: 'مانيكير تقوية مع طلاء دائم',
    descriptionFr: "Renforcement protecteur de l'ongle naturel avec vernis semi-permanent ultra brillant.",
    descriptionAr: 'تقوية للأظافر الطبيعية بطبقة حماية ولمعان دائم يدوم لأسابيع.',
    price: 250, priceNote: 'DH', duration: '60 min', popular: true, badge: 'Coup de Cœur ❤️'
  },
  {
    slug: 'manu-spa-semi-perm', category: 'manucure',
    nameFr: 'Manucure Spa Semi-Permanent',
    nameAr: 'مانيكير سبا مع طلاء دائم (سيمي بيرمانون)',
    descriptionFr: 'Le luxe absolu du soin spa combiné à la tenue longue durée du vernis permanent.',
    descriptionAr: 'فخامة علاج السبا الكامل مدمجة مع الطلاء الدائم فائق اللمعان.',
    price: 280, priceNote: 'DH', duration: '70 min'
  },
  {
    slug: 'manu-faux-ongles-perm', category: 'manucure',
    nameFr: 'Manucure + Faux Ongles Permanent',
    nameAr: 'مانيكير + تركيب أظافر مع طلاء دائم',
    descriptionFr: 'Pose d\'ongles soignée pour une longueur élégante et une finition permanente parfaite.',
    descriptionAr: 'تركيب أظافر بتثبيت قوي وشكل انسيابي متناسق مع طلاء دائم.',
    price: 300, priceNote: 'DH', duration: '75 min'
  },
  {
    slug: 'manu-capsule-perm', category: 'manucure',
    nameFr: 'Manucure + Capsule Permanent',
    nameAr: 'مانيكير + كبسول دائم',
    descriptionFr: 'Pose capsules avec finition vernis permanent de prestige.',
    descriptionAr: 'تركيب كبسول لإطالة الأظافر مع طلاء دائم وألوان ساحرة.',
    price: 300, priceNote: 'DH', duration: '75 min'
  },
  {
    slug: 'manu-semilac-bombe', category: 'manucure',
    nameFr: 'Renforcement Semilac Main, Bombé',
    nameAr: 'تقوية سيميلاك لليدين بتقنية البومبيه (Bombé)',
    descriptionFr: 'Technique experte de galbe parfait et renforcement résistant signé Semilac.',
    descriptionAr: 'تقنية احترافية لتقويس وحماية الأظافر بمظهر ممتلئ وجذاب يدوم طويلاً.',
    price: 300, priceNote: 'DH', duration: '80 min', popular: true
  },
  {
    slug: 'manu-pose-renf-manu', category: 'manucure',
    nameFr: 'Pose Permanent Renforcement Manu',
    nameAr: 'وضع طلاء دائم مع تقوية اليدين',
    descriptionFr: 'Application soignée pour consolider et sublimer vos ongles naturels.',
    descriptionAr: 'حماية متطورة للأظافر الطبيعية الضعيفة ومنحها مظهراً أنثوياً متألقاً.',
    price: 250, priceNote: 'DH', duration: '60 min'
  },

  /* ------------------ 3. Pédicure & Pieds (10) ------------------- */
  {
    slug: 'pedi-spa-normal', category: 'pedicure',
    nameFr: 'Pédicure Spa Vernis Normal',
    nameAr: 'باديكير سبا مع طلاء عادي',
    descriptionFr: 'Bain hydromassant, élimination des callosités, gommage velouté et vernis.',
    descriptionAr: 'حمام تدليك للأقدام، إزالة الجلد الميت، تقشير، وترطيب مع طلاء كلاسيكي.',
    price: 190, priceNote: 'DH', duration: '50 min', popular: true
  },
  {
    slug: 'pedi-medical', category: 'pedicure',
    nameFr: 'Pédicure Médicale',
    nameAr: 'باديكير طبي عناية فائقة',
    descriptionFr: 'Traitement en profondeur des cors, ongles incarnés et callosités sévères.',
    descriptionAr: 'عناية متقدمة لتخليص القدمين من التشققات والأظافر الغارزة والخشونة.',
    price: 250, priceNote: 'DH (à partir de)', duration: '60 min', badge: 'Soin Thérapeutique 🩺'
  },
  {
    slug: 'pedi-medical-perm', category: 'pedicure',
    nameFr: 'Pédicure Médicale Permanent',
    nameAr: 'باديكير طبي مع طلاء دائم',
    descriptionFr: "Le soin médical complet associé à la splendeur d'un vernis permanent longue durée.",
    descriptionAr: 'علاج طبي متكامل للأقدام يتبعه طلاء دائم مقاوم للماء والخدوش.',
    price: 400, priceNote: 'DH', duration: '80 min'
  },
  {
    slug: 'pedi-spa-capsule-perm', category: 'pedicure',
    nameFr: 'Pédicure Spa Capsule Permanente',
    nameAr: 'باديكير سبا كبسول دائم',
    descriptionFr: 'Pédicure spa luxueuse avec extension capsules et vernis semi-permanent.',
    descriptionAr: 'جلسة سبا فاخرة للقدمين مع كبسول وتنسيق جذاب مع طلاء دائم.',
    price: 380, priceNote: 'DH', duration: '85 min'
  },
  {
    slug: 'pedi-spa-faux-ongles-perm', category: 'pedicure',
    nameFr: 'Pédicure Spa Faux Ongles Permanent',
    nameAr: 'باديكير سبا مع تركيب أظافر دائم',
    descriptionFr: 'Transformation complète et élégante de vos pieds pour toutes les occasions.',
    descriptionAr: 'تجميل شامل للأقدام مع أظافر مثالية وطلاء يدوم طويلاً للمناسبات.',
    price: 350, priceNote: 'DH', duration: '75 min'
  },
  {
    slug: 'pedi-gel-x', category: 'pedicure',
    nameFr: 'Gel X Pieds',
    nameAr: 'جيل إكس للقدمين (Gel X)',
    descriptionFr: 'Technique révolutionnaire de capsules 100% gel souple, légère et résistante.',
    descriptionAr: 'تقنية الجيل إكس العصرية المصنوعة من الجل المرن لراحة تدوم وثبات خارق.',
    price: 400, priceNote: 'DH', duration: '80 min', popular: true, badge: 'Tendance 2026 ✨'
  },
  {
    slug: 'pedi-renforcement', category: 'pedicure',
    nameFr: 'Renforcement Pieds',
    nameAr: 'تقوية أظافر القدمين',
    descriptionFr: 'Consolidation de la plaque unguéale pour éviter la casse et renforcer la brillance.',
    descriptionAr: 'تقوية أظافر القدمين الضعيفة بطبقة جل علاجية تمنع التكسر.',
    price: 350, priceNote: 'DH', duration: '60 min'
  },
  {
    slug: 'pedi-biab', category: 'pedicure',
    nameFr: 'BIAB (The Gel Bottle)',
    nameAr: 'بياب - The Gel Bottle (BIAB)',
    descriptionFr: 'Le soin premium Builder In A Bottle de la marque britannique The Gel Bottle.',
    descriptionAr: 'تقنية BIAB العالمية الشهيرة لتغذية وبناء الأظافر بمظهر طبيعي وأنيق.',
    price: 400, priceNote: 'DH', duration: '75 min', popular: true, badge: 'Premium UK 💎'
  },
  {
    slug: 'pedi-depose-perm', category: 'pedicure',
    nameFr: 'Dépose Permanent',
    nameAr: 'إزالة الطلاء الدائم',
    descriptionFr: 'Retrait doux et sans danger pour vos ongles naturels.',
    descriptionAr: 'إزالة آمنة للطلاء الدائم دون الإضرار بطبقة الظفر الطبيعية.',
    price: 50, priceNote: 'DH', duration: '20 min'
  },
  {
    slug: 'pedi-depose-gel-biab', category: 'pedicure',
    nameFr: 'Dépose Gel / BIAB',
    nameAr: 'إزالة الجيل / البياب (Gel / BIAB)',
    descriptionFr: "Dépose minutieuse avec soin nourrissant à l'huile d'argan.",
    descriptionAr: 'إزالة دقيقة لمادة الجل أو البياب مع ترطيب مغذي.',
    price: 100, priceNote: 'DH', duration: '35 min'
  },

  /* ------------- 4. Coiffure / Cils & Sourcils (11) -------------- */
  {
    slug: 'coif-cils-normal', category: 'coiffure',
    nameFr: 'Cils Normal',
    nameAr: 'تركيب رموش طبيعية (Cils Normal)',
    descriptionFr: 'Pose de cils raffinée pour un regard captivant et naturel.',
    descriptionAr: 'تركيب رموش أنيقة ومميزة لإبراز جاذبية عينيكِ بمظهر طبيعي وساحر.',
    price: 100, priceNote: 'DH', duration: '30 min', popular: true
  },
  {
    slug: 'coif-sourcils-teinture', category: 'coiffure',
    nameFr: 'Sourcils et Teinture',
    nameAr: 'تحديد الحواجب مع الصباغة',
    descriptionFr: 'Restructuration de la ligne avec teinture semi-permanente harmonieuse.',
    descriptionAr: 'تنسيق متناسق لشكل الحواجب مع صباغة طبيعية تملأ الفراغات بدقة.',
    price: 130, priceNote: 'DH', duration: '35 min', popular: true
  },
  {
    slug: 'coif-coupe', category: 'coiffure',
    nameFr: 'Coupe Cheveux',
    nameAr: 'قص الشعر وتصفيفه',
    descriptionFr: "Création ou rafraîchissement d'une coupe sur-mesure adaptée à votre morphologie.",
    descriptionAr: 'قصة شعر أنيقة وعصرية تناسب تقاسيم وجهكِ وتمنح شعركِ حيوية وكثافة.',
    price: 200, priceNote: 'DH', duration: '45 min', popular: true
  },
  {
    slug: 'coif-pointes', category: 'coiffure',
    nameFr: 'Pointes Cheveux',
    nameAr: 'قص أطراف الشعر المتقصفة',
    descriptionFr: 'Élimination des pointes fourchues pour stimuler la repousse saine.',
    descriptionAr: 'إزالة وتعديل الأطراف المتقصفة لإعادة الحيوية والنضارة لطول شعركِ.',
    price: 100, priceNote: 'DH', duration: '25 min'
  },
  {
    slug: 'coif-brushing', category: 'coiffure',
    nameFr: 'Brushing Lisse',
    nameAr: 'سشوار أملس وناعم (Brushing)',
    descriptionFr: 'Lissage brillant et soyeux avec protection thermique.',
    descriptionAr: 'تصفيف احترافي ناعم ولامع يحمي خصلات شعركِ من الحرارة.',
    price: 70, priceNote: 'DH (à partir de)', duration: '35 min', popular: true
  },
  {
    slug: 'coif-brushing-boucle', category: 'coiffure',
    nameFr: 'Brushing Bouclé / Wavy',
    nameAr: 'سشوار مموج / كيرلي ويفي (Brushing Bouclé)',
    descriptionFr: 'Ondulations élégantes ou boucles glamour au volume aérien.',
    descriptionAr: 'تمويج أنثوي فخم للشعر يمنحكِ إطلالة نجمات السينما في كل مناسبة.',
    price: 80, priceNote: 'DH (à partir de)', duration: '45 min'
  },
  {
    slug: 'coif-prot-courts', category: 'coiffure',
    nameFr: 'Protéine Cheveux Courts',
    nameAr: 'علاج البروتين للشعر القصير',
    descriptionFr: 'Soin lissant à la protéine pour un cheveu soyeux, détendu et réparé.',
    descriptionAr: 'بروتين معالج ومغذي للشعر القصير يزيل الهيشان ويمنحكِ لمعاناً حريرياً.',
    price: 900, priceNote: 'DH', duration: '120 min', badge: 'Soin Miracle ✨'
  },
  {
    slug: 'coif-prot-demi-long', category: 'coiffure',
    nameFr: 'Protéine Cheveux Demi-Longs',
    nameAr: 'علاج البروتين للشعر المتوسط',
    descriptionFr: 'Formule riche en acides aminés pour un lissage souple sans frisottis.',
    descriptionAr: 'علاج مكثف بالأحماض الأمينية للشعر متوسط الطول لفك التشابك ونعومة فائقة.',
    price: 1200, priceNote: 'DH', duration: '150 min', popular: true
  },
  {
    slug: 'coif-prot-longs', category: 'coiffure',
    nameFr: 'Protéine Cheveux Longs',
    nameAr: 'علاج البروتين للشعر الطويل',
    descriptionFr: "Traitement d'excellence pour longueurs de rêve, lisses et éclatantes.",
    descriptionAr: 'عناية فائقة للشعر الطويل لإعادة ترميم الألياف وجعله ناعماً وسهل التصفيف.',
    price: 1300, priceNote: 'DH (à partir de)', duration: '180 min'
  },
  {
    slug: 'coif-color-produit', category: 'coiffure',
    nameFr: 'Coloration (Produit Fourni par le Salon)',
    nameAr: 'صباغة الشعر (بمنتجات الصالون الفاخرة)',
    descriptionFr: 'Couleur intense, uniforme et lumineuse avec nos marques partenaires de prestige.',
    descriptionAr: 'تلوين كامل للشعر بصبغات احترافية مغذية توفر تغطية تامة ولمعاناً لا يقاوم.',
    price: 350, priceNote: 'DH', duration: '90 min', popular: true
  },
  {
    slug: 'coif-color-sans-produit', category: 'coiffure',
    nameFr: 'Coloration (Sans Produit)',
    nameAr: 'تطبيق صباغة الشعر (المنتج من عند الزبونة)',
    descriptionFr: 'Application professionnelle soignée avec le produit de votre choix.',
    descriptionAr: 'خدمة خبيرة لوضع صبغتكِ المفضلة وتوزيعها باحترافية على كامل الشعر.',
    price: 150, priceNote: 'DH', duration: '60 min'
  },

  /* ---------------- 5. Massage & Relaxation (1) ------------------ */
  {
    slug: 'massage-relax-tonique', category: 'massage',
    nameFr: 'Massage Relaxant et Tonique',
    nameAr: 'تدليك استرخائي ومنشط للجسم',
    descriptionFr:
      "Le parfait équilibre entre manœuvres décontractantes et pressions tonifiantes aux huiles précieuses. Évacue la fatigue et libère les tensions.",
    descriptionAr:
      'مزيج استثنائي بين حركات الاسترخاء الناعمة والضغط المنشط للدورة الدموية بزيوت طبيعية عطرة. يزيل التعب والتوتر تماماً.',
    price: 400, priceNote: 'DH', duration: '60 min', popular: true, badge: 'Pure Détente 🌿'
  }
];

/* ---------------- 6. Options & Soins Extra (add-on only) ------------------ */
const EXTRA_OPTIONS = [
  {
    slug: 'opt-deco', category: 'massage',
    nameFr: 'Option Nail Art & Finitions (French, Chrome, Baby-Boomer, Cat Eye, Ongle 3D)',
    nameAr: 'إضافات نيل آرت وتزيين (فرينش، كروم، بيبي بومر، كات آي، ظفر 3D)',
    descriptionFr: 'Option add-on : ne peut être réservée qu\'en complément d\'un soin principal.',
    descriptionAr: 'خيار إضافي: لا يمكن حجزه إلا كإضافة لخدمة رئيسية.',
    price: 50, priceNote: 'DH', duration: '15 min'
  },
  {
    slug: 'opt-paraffine-jelly', category: 'massage',
    nameFr: 'Option Soins Paraffine / Soins Jelly',
    nameAr: 'عناية إضافية بالبرافين أو الجيلي المرطب (Paraffine / Jelly)',
    descriptionFr: 'Option add-on : soin hydratant intense pour les mains ou les pieds.',
    descriptionAr: 'خيار إضافي: عناية ترطيب عميق لليدين أو القدمين.',
    price: 60, priceNote: 'DH', duration: '20 min'
  }
];

const ALL_SERVICES = [...SERVICES, ...EXTRA_OPTIONS];

/* ------------------------------------------------------------------ */
/* Exécution                                                           */
/* ------------------------------------------------------------------ */

const adminEnvSchema = z.object({
  ADMIN_EMAIL: z.string().email().default('admin@loudaya.ma'),
  ADMIN_PASSWORD: z.string().min(8).default('CentreLoudaya2026')
});

async function main() {
  const adminEnv = adminEnvSchema.parse({
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD
  });

  console.log('\n[seed] Initialisation du catalogue du Centre de Beauté Loudaya...\n');

  // --- Catégories ---
  const categoryIds = new Map();

  for (const [index, category] of CATEGORIES.entries()) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        nameFr: category.nameFr,
        nameAr: category.nameAr,
        icon: category.icon,
        descriptionFr: category.descriptionFr,
        descriptionAr: category.descriptionAr,
        order: index + 1
      },
      create: {
        slug: category.slug,
        nameFr: category.nameFr,
        nameAr: category.nameAr,
        icon: category.icon,
        descriptionFr: category.descriptionFr,
        descriptionAr: category.descriptionAr,
        order: index + 1
      }
    });
    categoryIds.set(category.slug, record.id);
  }
  console.log(`[seed]  ✔ ${CATEGORIES.length} catégories`);

  // --- Prestations (idempotent via slug) ---
  let serviceCount = 0;

  for (const category of CATEGORIES) {
    const categoryServices = ALL_SERVICES.filter((service) => service.category === category.slug);
    const categoryId = categoryIds.get(category.slug);

    for (const [index, service] of categoryServices.entries()) {
      const data = {
        nameFr: service.nameFr,
        nameAr: service.nameAr,
        descriptionFr: service.descriptionFr ?? null,
        descriptionAr: service.descriptionAr ?? null,
        price: service.price,
        priceMax: service.priceMax ?? null,
        priceFrom: service.priceFrom ?? (service.priceNote ?? '').includes('à partir de'),
        priceNote: service.priceNote ?? 'DH',
        duration: service.duration ?? '30 min',
        popular: service.popular ?? false,
        badge: service.badge ?? null,
        available: true,
        active: service.active ?? true,
        order: index + 1
      };

      await prisma.service.upsert({
        where: { slug: service.slug },
        update: { ...data, categoryId },
        create: { slug: service.slug, categoryId, ...data }
      });
      serviceCount += 1;
    }

    console.log(`[seed]  ✔ ${categoryServices.length} prestations — ${category.nameFr}`);
  }
  console.log(`[seed]  ✔ ${serviceCount} prestations au total`);

  // --- Compte administrateur ---
  const passwordHash = await bcrypt.hash(adminEnv.ADMIN_PASSWORD, 12);

  await prisma.admin.upsert({
    where: { email: adminEnv.ADMIN_EMAIL.toLowerCase() },
    update: { passwordHash },
    create: {
      email: adminEnv.ADMIN_EMAIL.toLowerCase(),
      passwordHash
    }
  });

  console.log(`[seed]  ✔ Compte administrateur : ${adminEnv.ADMIN_EMAIL}`);
  console.log('\n[seed] Terminé. Connectez-vous sur /admin avec cet e-mail.\n');
}

main()
  .catch((error) => {
    console.error('\n[seed] Échec :', error.message);
    if (error.code === 'P1001') {
      console.error('       MySQL est-il démarré (XAMPP) et la base "salon" créée ?');
    }
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });