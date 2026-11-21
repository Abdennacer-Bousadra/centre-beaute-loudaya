export const initialCategories = [
  {
    id: 'coiffure',
    nameFr: 'Coiffure & Traitements',
    nameAr: 'العناية بالشعر',
    icon: 'Scissors',
    descriptionFr: 'Coupes, brushings, protéine et colorations sur-mesure pour sublimer votre chevelure.',
    descriptionAr: 'قصات، بروشينغ، بروتين وصباغة مخصصة لإبراز جمال شعركِ.'
  },
  {
    id: 'manucure',
    nameFr: 'Manucure & Onglerie',
    nameAr: 'العناية باليدين والأظافر',
    icon: 'Hand',
    descriptionFr: 'Manucure, vernis permanent et finitions élégantes pour des mains impeccables.',
    descriptionAr: 'مانيكير، فيرنيس برماننت ولمسات أنيقة ليدين مثاليتين.'
  },
  {
    id: 'pedicure',
    nameFr: 'Pédicure',
    nameAr: 'العناية بالقدمين',
    icon: 'Footprints',
    descriptionFr: 'Soins complets des pieds, paraffine et vernis pour un confort absolu.',
    descriptionAr: 'عناية كاملة بالقدمين، بارافين وطلاء لراحة تامة.'
  },
  {
    id: 'epilation',
    nameFr: 'Épilation',
    nameAr: 'إزالة الشعر',
    icon: 'Sparkles',
    descriptionFr: 'Épilation douce et précise pour une peau nette et soyeuse.',
    descriptionAr: 'إزالة شعر لطيفة ودقيقة لبشرة ناعمة ونظيفة.'
  },
  {
    id: 'soin-visage',
    nameFr: 'Soin Visage',
    nameAr: 'العناية بالبشرة والوجه',
    icon: 'Droplets',
    descriptionFr: 'Nettoyage, hydratation et soins professionnels pour une peau éclatante.',
    descriptionAr: 'تنظيف، ترطيب وعنايات احترافية لبشرة مشرقة.'
  },
  {
    id: 'maquillage',
    nameFr: 'Maquillage & Esthétique',
    nameAr: 'المكياج والتجميل',
    icon: 'Palette',
    descriptionFr: 'Maquillage léger ou soirée et pose de cils pour un regard sublime.',
    descriptionAr: 'مكياج خفيف أو سهرة وتركيب رموش لإطلالة ساحرة.'
  },
  {
    id: 'massage',
    nameFr: 'Massage & Relaxation',
    nameAr: 'المساج والاسترخاء',
    icon: 'HeartHandshake',
    descriptionFr: 'Massages relaxants aux huiles pour libérer les tensions et retrouver l\'équilibre.',
    descriptionAr: 'مساج استرخائي بالزيوت لتحرير التوتر واستعادة التوازن.'
  },
  {
    id: 'packs-mariee',
    nameFr: 'Packs Mariée',
    nameAr: 'باقات العرائس',
    icon: 'Crown',
    descriptionFr: 'Des formules complètes pour accompagner la mariée avant et pendant son grand jour.',
    descriptionAr: 'باقات متكاملة لمرافقة العروس قبل يومها الكبير وأثناءه.'
  }
];

export const initialServices = [
  // 1. Coiffure & Traitements
  {
    id: 'coif-coupe',
    categoryId: 'coiffure',
    nameFr: 'Coupe de cheveux',
    nameAr: 'قص الشعر',
    descriptionFr: 'Coupe personnalisée adaptée à votre style et à votre visage.',
    descriptionAr: 'قصة مخصصة تناسب أسلوبكِ وملامح وجهكِ.',
    price: 50,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'coif-pointes',
    categoryId: 'coiffure',
    nameFr: 'Coupe des pointes',
    nameAr: 'قص أطراف الشعر',
    descriptionFr: 'Rafraîchit les pointes et favorise une repousse saine.',
    descriptionAr: 'تجديد أطراف الشعر وتعزيز نمو صحي.',
    price: 20,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'coif-brushing',
    categoryId: 'coiffure',
    nameFr: 'Brushing (selon longueur et type)',
    nameAr: 'بروشينغ',
    descriptionFr: 'Brushing soigné selon la longueur et le type de cheveux.',
    descriptionAr: 'بروشينغ أنيق حسب طول ونوع الشعر.',
    price: 100,
    priceMax: 250,
    priceFrom: false,
    active: true
  },
  {
    id: 'coif-proteine',
    categoryId: 'coiffure',
    nameFr: 'Protéine / Kératine',
    nameAr: 'بروتين / كيراتين',
    descriptionFr: 'Lissage profond et réparation de la fibre capillaire.',
    descriptionAr: 'تمليس عميق وإصلاح ألياف الشعر.',
    price: 500,
    priceMax: 800,
    priceFrom: false,
    active: true
  },
  {
    id: 'coif-hydratation',
    categoryId: 'coiffure',
    nameFr: 'Hydratation',
    nameAr: 'ترطيبة',
    descriptionFr: 'Soin hydratant intense pour des cheveux souples et brillants.',
    descriptionAr: 'عناية مرطبة مكثفة لشعر ناعم ولامع.',
    price: 300,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'coif-coloration',
    categoryId: 'coiffure',
    nameFr: 'Coloration',
    nameAr: 'صباغة الشعر',
    descriptionFr: 'Coloration professionnelle réalisée sur-mesure.',
    descriptionAr: 'صباغة احترافية حسب اختياركِ.',
    price: 250,
    priceMax: null,
    priceFrom: true,
    active: true
  },
  {
    id: 'coif-meches',
    categoryId: 'coiffure',
    nameFr: 'Mèches sans coloration',
    nameAr: 'لي ميش بدون صباغة',
    descriptionFr: 'Mèches lumineuses sans coloration complète.',
    descriptionAr: 'خصلات مضيئة دون صباغة كاملة.',
    price: 300,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'coif-meches-coloration',
    categoryId: 'coiffure',
    nameFr: 'Mèches + coloration',
    nameAr: 'لي ميش + صباغة',
    descriptionFr: 'Mèches et coloration pour un résultat lumineux et nuancé.',
    descriptionAr: 'خصلات مع صباغة لنتيجة مشرقة ومتناسقة.',
    price: 600,
    priceMax: null,
    priceFrom: false,
    active: true
  },

  // 2. Manucure & Onglerie
  {
    id: 'manu-classique',
    categoryId: 'manucure',
    nameFr: 'Manucure classique',
    nameAr: 'مانيكير كلاسيك',
    descriptionFr: 'Mise en forme des ongles et soin des cuticules.',
    descriptionAr: 'تشكيل الأظافر والعناية بالجلد المحيط.',
    price: 30,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-spa',
    categoryId: 'manucure',
    nameFr: 'Manucure SPA',
    nameAr: 'مانيكير سبا',
    descriptionFr: 'Soin complet des mains avec gommage et masque hydratant.',
    descriptionAr: 'عناية كاملة باليدين مع تقشير وماسك مرطب.',
    price: 70,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-vernis-classique',
    categoryId: 'manucure',
    nameFr: 'Vernis classique',
    nameAr: 'فيرنيس كلاسيك',
    descriptionFr: 'Application soignée d\'un vernis classique.',
    descriptionAr: 'وضع أنيق لطلاء أظافر كلاسيكي.',
    price: 20,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-vernis-permanent',
    categoryId: 'manucure',
    nameFr: 'Vernis permanent classique',
    nameAr: 'فيرنيس برماننت كلاسيك',
    descriptionFr: 'Vernis permanent longue tenue et brillance durable.',
    descriptionAr: 'طلاء برماننت يدوم طويلاً بلمعان دائم.',
    price: 50,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-manucure-vernis-permanent',
    categoryId: 'manucure',
    nameFr: 'Manucure + vernis permanent',
    nameAr: 'مانيكير + فيرنيس برماننت',
    descriptionFr: 'Manucure complète avec finition vernis permanent.',
    descriptionAr: 'مانيكير كامل مع لمسة فيرنيس برماننت.',
    price: 80,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-french-smile',
    categoryId: 'manucure',
    nameFr: 'French smile',
    nameAr: 'فرنش سمايل',
    descriptionFr: 'French smile réalisé avec précision.',
    descriptionAr: 'فرنش سمايل منفذ بدقة.',
    price: 30,
    priceMax: 40,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-french-carre',
    categoryId: 'manucure',
    nameFr: 'French carré',
    nameAr: 'فرنش كاريه',
    descriptionFr: 'French carré net et élégant.',
    descriptionAr: 'فرنش كاريه أنيق ومرتب.',
    price: 40,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-french-gel',
    categoryId: 'manucure',
    nameFr: 'French gel',
    nameAr: 'فرنش جل',
    descriptionFr: 'French en gel pour une tenue renforcée.',
    descriptionAr: 'فرنش بالجل لثبات أقوى.',
    price: 60,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-pose-french',
    categoryId: 'manucure',
    nameFr: 'Pose d\'ongles avec french',
    nameAr: 'بوز أظافر مع فرنش',
    descriptionFr: 'Pose d\'ongles avec finition french.',
    descriptionAr: 'تركيب أظافر مع لمسة فرنش.',
    price: 80,
    priceMax: 120,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-design-leger',
    categoryId: 'manucure',
    nameFr: 'Design léger',
    nameAr: 'ديزاين خفيف',
    descriptionFr: 'Décoration discrète et raffinée.',
    descriptionAr: 'تزيين خفيف وراقٍ.',
    price: 25,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-design-charge',
    categoryId: 'manucure',
    nameFr: 'Design chargé',
    nameAr: 'ديزاين محمّل',
    descriptionFr: 'Décoration riche et travaillée.',
    descriptionAr: 'تزيين غني ومتقن.',
    price: 70,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-paraffine-mains',
    categoryId: 'manucure',
    nameFr: 'Paraffine mains',
    nameAr: 'بارافين اليدين',
    descriptionFr: 'Bain de paraffine nourrissant pour les mains.',
    descriptionAr: 'حمام بارافين مغذي لليدين.',
    price: 40,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-depose-gel',
    categoryId: 'manucure',
    nameFr: 'Dépose gel',
    nameAr: 'إزالة الجل',
    descriptionFr: 'Retrait doux et sûr du gel.',
    descriptionAr: 'إزالة آمنة ولطيفة للجل.',
    price: 40,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'manu-depose-permanent',
    categoryId: 'manucure',
    nameFr: 'Dépose permanent',
    nameAr: 'إزالة البرماننت',
    descriptionFr: 'Retrait du vernis permanent sans abîmer l\'ongle.',
    descriptionAr: 'إزالة الفيرنيس برماننت دون إتلاف الظفر.',
    price: 20,
    priceMax: null,
    priceFrom: false,
    active: true
  },

  // 3. Pédicure
  {
    id: 'pedi-simple',
    categoryId: 'pedicure',
    nameFr: 'Pédicure simple',
    nameAr: 'باديكير بسيط',
    descriptionFr: 'Soin essentiel des pieds et des ongles.',
    descriptionAr: 'عناية أساسية بالقدمين والأظافر.',
    price: 50,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'pedi-complete',
    categoryId: 'pedicure',
    nameFr: 'Pédicure complète',
    nameAr: 'باديكير كامل',
    descriptionFr: 'Soin complet avec nettoyage et hydratation.',
    descriptionAr: 'عناية كاملة مع تنظيف وترطيب.',
    price: 80,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'pedi-spa',
    categoryId: 'pedicure',
    nameFr: 'Pédicure SPA',
    nameAr: 'باديكير سبا',
    descriptionFr: 'Rituel spa relaxant pour des pieds doux et reposés.',
    descriptionAr: 'طقس سبا مريح لقدمين ناعمتين.',
    price: 120,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'pedi-permanent',
    categoryId: 'pedicure',
    nameFr: 'Pédicure + permanent',
    nameAr: 'باديكير + برماننت',
    descriptionFr: 'Pédicure complète avec vernis permanent.',
    descriptionAr: 'باديكير كامل مع فيرنيس برماننت.',
    price: 120,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'pedi-paraffine',
    categoryId: 'pedicure',
    nameFr: 'Pédicure avec paraffine',
    nameAr: 'باديكير مع بارافين',
    descriptionFr: 'Pédicure enrichie d\'un soin à la paraffine.',
    descriptionAr: 'باديكير مع عناية بالبارافين.',
    price: 100,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'pedi-paraffine-pieds',
    categoryId: 'pedicure',
    nameFr: 'Paraffine pieds',
    nameAr: 'بارافين القدمين',
    descriptionFr: 'Bain de paraffine hydratant pour les pieds.',
    descriptionAr: 'حمام بارافين مرطب للقدمين.',
    price: 50,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'pedi-pack-paraffine',
    categoryId: 'pedicure',
    nameFr: 'Pack paraffine mains et pieds',
    nameAr: 'باك بارافين اليدين والقدمين',
    descriptionFr: 'Soin paraffine complet pour mains et pieds.',
    descriptionAr: 'عناية بارافين كاملة لليدين والقدمين.',
    price: 80,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'pedi-pose-vernis',
    categoryId: 'pedicure',
    nameFr: 'Pose vernis',
    nameAr: 'وضع الفيرنيس',
    descriptionFr: 'Application de vernis sur les pieds.',
    descriptionAr: 'وضع طلاء على القدمين.',
    price: 60,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'pedi-gommage',
    categoryId: 'pedicure',
    nameFr: 'Gommage des pieds',
    nameAr: 'تقشير القدمين',
    descriptionFr: 'Gommage exfoliant pour une peau lisse.',
    descriptionAr: 'تقشير لإزالة الخشونة ونعومة البشرة.',
    price: 30,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'pedi-massage',
    categoryId: 'pedicure',
    nameFr: 'Massage des pieds (15 min)',
    nameAr: 'مساج القدمين (15 دقيقة)',
    descriptionFr: 'Massage relaxant des pieds pendant 15 minutes.',
    descriptionAr: 'مساج مريح للقدمين لمدة 15 دقيقة.',
    price: 40,
    priceMax: null,
    priceFrom: false,
    duration: '15 min',
    active: true
  },

  // 4. Épilation
  {
    id: 'epil-sourcils',
    categoryId: 'epilation',
    nameFr: 'Sourcils',
    nameAr: 'الحواجب',
    descriptionFr: 'Mise en forme précise des sourcils.',
    descriptionAr: 'تحديد دقيق للحواجب.',
    price: 20,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'epil-menton',
    categoryId: 'epilation',
    nameFr: 'Menton',
    nameAr: 'الذقن',
    descriptionFr: 'Épilation ciblée du menton.',
    descriptionAr: 'إزالة شعر الذقن بدقة.',
    price: 20,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'epil-visage',
    categoryId: 'epilation',
    nameFr: 'Visage complet',
    nameAr: 'الوجه كامل',
    descriptionFr: 'Épilation complète du visage.',
    descriptionAr: 'إزالة كاملة لشعر الوجه.',
    price: 50,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'epil-aisselles',
    categoryId: 'epilation',
    nameFr: 'Aisselles',
    nameAr: 'تحت الإبطين',
    descriptionFr: 'Épilation douce des aisselles.',
    descriptionAr: 'إزالة لطيفة لشعر الإبطين.',
    price: 20,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'epil-bras-coude',
    categoryId: 'epilation',
    nameFr: 'Bras jusqu\'au coude',
    nameAr: 'الذراعين حتى المرفق',
    descriptionFr: 'Épilation des bras jusqu\'au coude.',
    descriptionAr: 'إزالة شعر الذراعين حتى المرفق.',
    price: 40,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'epil-bras-complets',
    categoryId: 'epilation',
    nameFr: 'Bras complets',
    nameAr: 'الذراعين كاملين',
    descriptionFr: 'Épilation complète des bras.',
    descriptionAr: 'إزالة كاملة لشعر الذراعين.',
    price: 60,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'epil-jambes',
    categoryId: 'epilation',
    nameFr: 'Jambes complètes',
    nameAr: 'الساقين كاملين',
    descriptionFr: 'Épilation complète des jambes.',
    descriptionAr: 'إزالة كاملة لشعر الساقين.',
    price: 100,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'epil-corps',
    categoryId: 'epilation',
    nameFr: 'Corps complet',
    nameAr: 'الجسم كامل',
    descriptionFr: 'Épilation du corps entier.',
    descriptionAr: 'إزالة شعر الجسم كامل.',
    price: 350,
    priceMax: null,
    priceFrom: false,
    active: true
  },

  // 5. Soin Visage
  {
    id: 'visage-nettoyage-masque',
    categoryId: 'soin-visage',
    nameFr: 'Nettoyage de visage + masque',
    nameAr: 'تنظيف الوجه + ماسك',
    descriptionFr: 'Nettoyage profond suivi d\'un masque adapté.',
    descriptionAr: 'تنظيف عميق يتبعه ماسك مناسب.',
    price: 120,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'visage-hydrafacial',
    categoryId: 'soin-visage',
    nameFr: 'Hydrafacial',
    nameAr: 'هايدرافيشل',
    descriptionFr: 'Soin hydratant et purifiant professionnel.',
    descriptionAr: 'عناية احترافية مرطبة ومنقية.',
    price: 500,
    priceMax: null,
    priceFrom: false,
    active: true
  },

  // 6. Maquillage & Esthétique
  {
    id: 'maqui-leger',
    categoryId: 'maquillage',
    nameFr: 'Maquillage léger',
    nameAr: 'مكياج خفيف',
    descriptionFr: 'Mise en beauté naturelle et lumineuse.',
    descriptionAr: 'مكياج طبيعي ومشرق.',
    price: 50,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'maqui-soiree',
    categoryId: 'maquillage',
    nameFr: 'Maquillage soirée / lourd',
    nameAr: 'مكياج سهرة / ثقيل',
    descriptionFr: 'Maquillage intense pour les grandes occasions.',
    descriptionAr: 'مكياج كثيف للمناسبات الكبرى.',
    price: 100,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'maqui-cils',
    categoryId: 'maquillage',
    nameFr: 'Pose de cils',
    nameAr: 'تركيب الرموش',
    descriptionFr: 'Pose de cils pour un regard intense.',
    descriptionAr: 'تركيب رموش لإطلالة جذابة.',
    price: 50,
    priceMax: null,
    priceFrom: false,
    active: true
  },

  // 7. Massage & Relaxation
  {
    id: 'massage-nuque',
    categoryId: 'massage',
    nameFr: 'Massage nuque, épaules et tête (15 min)',
    nameAr: 'مساج الرقبة والكتفين والرأس (15 دقيقة)',
    descriptionFr: 'Massage court pour détendre nuque, épaules et tête.',
    descriptionAr: 'مساج قصير لإرخاء الرقبة والكتفين والرأس.',
    price: 60,
    priceMax: null,
    priceFrom: false,
    duration: '15 min',
    active: true
  },
  {
    id: 'massage-dos',
    categoryId: 'massage',
    nameFr: 'Massage dos et épaules (30 min)',
    nameAr: 'مساج الظهر والكتفين (30 دقيقة)',
    descriptionFr: 'Massage ciblé du dos et des épaules pendant 30 minutes.',
    descriptionAr: 'مساج للظهر والكتفين لمدة 30 دقيقة.',
    price: 120,
    priceMax: null,
    priceFrom: false,
    duration: '30 min',
    active: true
  },
  {
    id: 'massage-relax-45',
    categoryId: 'massage',
    nameFr: 'Relaxation corps entier (45 min)',
    nameAr: 'استرخاء الجسم كامل (45 دقيقة)',
    descriptionFr: 'Détente complète du corps pendant 45 minutes.',
    descriptionAr: 'استرخاء كامل للجسم لمدة 45 دقيقة.',
    price: 180,
    priceMax: null,
    priceFrom: false,
    duration: '45 min',
    active: true
  },
  {
    id: 'massage-huiles',
    categoryId: 'massage',
    nameFr: 'Massage corps entier aux huiles aromatiques (60 min)',
    nameAr: 'مساج الجسم كامل بالزيوت العطرية (60 دقيقة)',
    descriptionFr: 'Massage du corps aux huiles aromatiques pendant 60 minutes.',
    descriptionAr: 'مساج للجسم بالزيوت العطرية لمدة 60 دقيقة.',
    price: 250,
    priceMax: null,
    priceFrom: false,
    duration: '60 min',
    active: true
  },
  {
    id: 'massage-relax-90',
    categoryId: 'massage',
    nameFr: 'Relaxation corps entier (90 min)',
    nameAr: 'استرخاء الجسم كامل (90 دقيقة)',
    descriptionFr: 'Relaxation profonde du corps pendant 90 minutes.',
    descriptionAr: 'استرخاء عميق للجسم لمدة 90 دقيقة.',
    price: 350,
    priceMax: null,
    priceFrom: false,
    duration: '90 min',
    active: true
  },

  // 8. Packs Mariée
  {
    id: 'pack-mariee-jour',
    categoryId: 'packs-mariee',
    nameFr: 'Maquillage + coiffure mariée (1 jour)',
    nameAr: 'مكياج + تسريحة العروس (يوم واحد)',
    descriptionFr: 'Maquillage et coiffure de mariée pour le grand jour.',
    descriptionAr: 'مكياج وتسريحة العروس ليوم الزفاف.',
    price: 1000,
    priceMax: null,
    priceFrom: false,
    active: true
  },
  {
    id: 'pack-mariee-complet',
    categoryId: 'packs-mariee',
    nameFr: 'Pack mariée complet (4 jours)',
    nameAr: 'باقة العروس الكاملة (4 أيام)',
    descriptionFr: 'Nettoyage de visage, soins du corps complets et autres prestations de la mariée.',
    descriptionAr: 'تنظيف الوجه، عناية كاملة بالجسم وباقي خدمات العروس.',
    price: 2000,
    priceMax: null,
    priceFrom: false,
    active: true
  }
];

/**
 * Formats a service price according to the current language.
 * - Range: "100 – 250 DH" / "100 – 250 درهم"
 * - From: "À partir de 250 DH" / "ابتداءً من 250 درهم"
 * - Single: "50 DH" / "50 درهم"
 */
export const formatServicePrice = (service, lang = 'fr') => {
  if (!service) return '';
  const currency = lang === 'ar' ? 'درهم' : 'DH';
  const min = Number(service.price) || 0;
  const max = Number(service.priceMax) || 0;

  if (max > min) {
    return `${min} – ${max} ${currency}`;
  }

  if (service.priceFrom) {
    return `${lang === 'ar' ? 'ابتداءً من' : 'À partir de'} ${min} ${currency}`;
  }

  return `${min} ${currency}`;
};

export const getServiceMinPrice = (service) =>
  Number(service?.price) || 0;
