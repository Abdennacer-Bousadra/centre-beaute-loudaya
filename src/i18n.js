import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      brand: {
        name: "Centre de Beauté Loudaya",
        nameAr: "مركز التجميل الوداية",
        tagline: "Prenez soin de vous ♡",
        subtagline: "L'art de sublimer votre beauté naturelle",
        description: "Votre destination de beauté et de détente exclusive pour femmes à Loudaya. Épilation douce, onglerie haut de gamme, soins capillaires experts et massages relaxants."
      },
      nav: {
        home: "Accueil",
        services: "Catégories & Tarifs",
        booking: "Réservation en Ligne",
        about: "À Propos",
        experience: "Pourquoi Nous",
        contact: "Contact",
        admin: "Administration",
        bookNow: "Prendre RDV",
        whatsapp: "WhatsApp Direct",
        openHours: "Lun - Sam : 10h00 - 20h00",
        sundayClosed: "Dimanche : Fermé"
      },
      hero: {
        badge: "✨ Salon Exclusif & Raffiné pour Femmes",
        title: "Révélez Votre Éclat & Prenez Soin de Vous",
        subtitle: "Plongez dans un havre de paix et d'élégance à Loudaya. Des soins personnalisés, une hygiène irréprochable et un savoir-faire dédié à votre bien-être.",
        ctaBook: "Réserver un rendez-vous",
        ctaServices: "Explorer nos tarifs",
        statClients: "1500+ Clientes Ravies",
        statHygien: "100% Stérilisation Médicale",
        statProducts: "Produits de Prestige",
        guarantee: "Sans attente inutile • Accueil chaleureux • Écoute attentive"
      },
      services: {
        title: "Nos Services & Tarifs",
        currency: "DH",
        bookThisService: "Réserver ce soin",
        viewOptions: "Options & Soins Extra",
        optionsIncluded: "Options disponibles :",
        startingFrom: "À partir de",
        categoriesTitle: "Explorez nos univers beauté",
        categoriesSubtitle: "Huit expertises dédiées à votre beauté, chacune avec ses soins et ses tarifs transparents.",
        openCategory: "Découvrir",
        viewAllCategories: "Voir toutes les catégories",

        backToServices: "Retour aux services",
        categoryServicesTitle: "Nos prestations",
        categoryNotFound: "Catégorie introuvable",
        categoryNotFoundDesc: "Cette catégorie n'existe pas ou n'est plus disponible. Retrouvez tous nos univers depuis la page services.",
        loading: "Chargement des prestations...",
        categories: {
          coiffure: "Coiffure & Traitements",
          manucure: "Manucure & Onglerie",
          pedicure: "Pédicure",
          epilation: "Épilation",
          'soin-visage': "Soin Visage",
          maquillage: "Maquillage & Esthétique",
          massage: "Massage & Relaxation",
          'packs-mariee': "Packs Mariée"
        }
      },
      booking: {
        badge: "📅 Réservation Simple & Rapide",
        title: "Réservez Votre Moment de Douceur",
        subtitle: "Choisissez votre prestation, votre créneau horaire, et recevez votre confirmation instantanée sur WhatsApp.",
        step1: "1. Choisir le Soin",
        step2: "2. Date & Heure",
        step3: "3. Vos Coordonnées",
        step4: "4. Confirmation",
        selectCategory: "Sélectionnez une catégorie :",
        selectService: "Sélectionnez votre prestation :",
        noServiceSelected: "Veuillez choisir un soin pour continuer.",
        dateLabel: "Date du rendez-vous :",
        timeLabel: "Heure souhaitée :",
        sundayWarning: "⚠️ Le salon est fermé le dimanche. Veuillez sélectionner un jour du lundi au samedi.",
        pastDateWarning: "⚠️ Veuillez choisir une date future ou aujourd'hui.",
        operatingHoursNote: "Nos horaires d'ouverture : 10h00 à 20h00 (Dernier créneau à 19h00).",
        availableSlots: "Créneaux disponibles :",
        nameLabel: "Nom et Prénom :",
        namePlaceholder: "ex: Fatima-Zahra Benali",
        phoneLabel: "Numéro de Téléphone (WhatsApp) :",
        phonePlaceholder: "ex: 06 66 92 39 10",
        notesLabel: "Remarques ou demandes particulières (optionnel) :",
        notesPlaceholder: "Précisions sur vos ongles, allergies, ou longueur de cheveux...",
        summaryTitle: "Récapitulatif de votre rendez-vous",
        serviceSelected: "Prestation choisie :",
        categorySelected: "Catégorie :",
        priceSelected: "Tarif estimé :",
        indicativePrice: "prix indicatif",
        dateTime: "Date & Heure :",
        clientInfo: "Cliente :",
        confirmBtn: "Confirmer & Envoyer via WhatsApp",
        whatsappRedirectNotice: "En cliquant sur ce bouton, vous serez redirigée vers WhatsApp avec votre récapitulatif prérempli.",
        successTitle: "Rendez-vous Pré-réservé avec Succès !",
        successSubtitle: "Votre demande a été préparée. Notre équipe à Loudaya vous attend avec impatience !",
        openWhatsAppNow: "Ouvrir WhatsApp pour valider",
        newBooking: "Faire une autre réservation"
      },
      whyUs: {
        badge: "L'Excellence Loudaya",
        title: "Pourquoi Choisir Notre Centre de Beauté ?",
        subtitle: "Un cadre serein, une écoute bienveillante et des normes de qualité strictes pour sublimer chaque femme.",
        item1Title: "Hygiène & Stérilisation 100%",
        item1Desc: "Instruments scellés et stérilisés aux normes médicales avant chaque cliente pour votre sécurité absolue.",
        item2Title: "Produits de Haute Qualité",
        item2Desc: "Vernis The Gel Bottle (BIAB), soins Semilac, protéines et cosmétiques renommés pour un résultat durable.",
        item3Title: "Espace 100% Féminin & Intime",
        item3Desc: "Un environnement pensé pour votre confort, votre intimité et une relaxation totale sans regards indiscrets.",
        item4Title: "Équipe Experte & Attentionnée",
        item4Desc: "Des professionnelles passionnées, à l'écoute de vos désirs capillaires, ongulaires et corporels."
      },
      atmosphere: {
        badge: "Notre Ambiance",
        title: "Un Sanctuaire d'Élégance à Loudaya",
        subtitle: "Découvrez notre univers aux tons rose poudré et dorés conçu pour votre détente."
      },
      reviews: {
        badge: "Témoignages",
        title: "Ce Que Disent Nos Clientes",
        subtitle: "Leur satisfaction et leurs sourires sont notre plus belle réussite."
      },
      faq: {
        badge: "Questions Fréquentes",
        title: "Tout ce que vous devez savoir",
        subtitle: "Des réponses transparentes pour préparer sereinement votre visite."
      },
      contact: {
        badge: "Contact & Localisation",
        title: "Venez Nous Rendre Visite",
        subtitle: "Nous sommes ravies de vous accueillir au Centre Beauté Loudaya.",
        addressTitle: "Adresse",
        addressText: "Centre Beauté Loudaya, Loudaya, Région de Marrakech",
        phoneTitle: "Téléphone & WhatsApp",
        hoursTitle: "Horaires de Réception",
        hoursMonSat: "Lundi au Samedi : 10h00 - 20h00",
        hoursSun: "Dimanche : FERMÉ",
        instagramTitle: "Instagram Officiel",
        btnCall: "Appeler le 0666923910",
        btnWhatsApp: "Écrire sur WhatsApp"
      },
      admin: {
        loginTitle: "Connexion Espace Salon",
        loginSubtitle: "Accès réservé à l'équipe de gestion du Centre Beauté Loudaya",
        passwordLabel: "Mot de passe d'administration :",
        passwordPlaceholder: "Entrez le code d'accès...",
        loginBtn: "Accéder au tableau de bord",
        invalidPass: "Mot de passe incorrect.",
        dashboardTitle: "Tableau de Bord - Centre Beauté Loudaya",
        logout: "Se déconnecter",
        tabs: {
          services: "Gestion des Soins",
          bookings: "Demandes de RDV",
          settings: "Paramètres Salon"
        },
        servicesTab: {
          addNew: "Ajouter un nouveau soin",
          nameFr: "Nom du soin (Français)",
          nameAr: "Nom du soin (Arabe)",
          category: "Catégorie",
          price: "Prix (DH)",
          availability: "Disponibilité",
          active: "Disponible",
          inactive: "Indisponible",
          edit: "Modifier",
          delete: "Supprimer",
          save: "Enregistrer",
          cancel: "Annuler",
          addSuccess: "Prestation ajoutée avec succès !",
          updateSuccess: "Prestation mise à jour !",
          deleteConfirm: "Êtes-vous sûre de vouloir supprimer ce soin ?"
        },
        bookingsTab: {
          totalBookings: "Total des demandes :",
          filterAll: "Toutes",
          filterPending: "En attente",
          filterConfirmed: "Confirmées",
          filterCompleted: "Terminées",
          filterCancelled: "Annulées",
          statusUpdated: "Statut mis à jour",
          contactClient: "Contacter sur WhatsApp",
          noBookings: "Aucune demande de rendez-vous enregistrée pour le moment."
        },
        settingsTab: {
          phone: "Numéro de contact WhatsApp",
          instagram: "Compte Instagram",
          hours: "Horaires du Salon",
          sundayStatus: "Statut du Dimanche",
          sundayClosedAlways: "Toujours Fermé (Recommandé)",
          sundayOpenSpecial: "Ouverture exceptionnelle autorisée",
          saveSettings: "Enregistrer les paramètres"
        }
      },
      footer: {
        quickLinks: "Accès Rapide",
        categories: "Catégories",
        rights: "Tous droits réservés.",
        heartText: "Prenez soin de vous ♡"
      }
    }
  },
  ar: {
    translation: {
      brand: {
        name: "مركز التجميل الوداية",
        nameAr: "مركز التجميل الوداية",
        tagline: "أبرزي جمالكِ الطبيعي ودللي نفسكِ ♡",
        subtagline: "فن إبراز جمالكِ الطبيعي في أجواء راقية",
        description: "وجهتكِ الحصرية للجمال والراحة والاسترخاء في الوداية. إزالة الشعر بلطف، عناية متكاملة بالأظافر، علاجات الشعر والبروتين، وتدليك مريح يجدد نشاطكِ."
      },
      nav: {
        home: "الرئيسية",
        services: "الأقسام والأسعار",
        booking: "حجز موعد أونلاين",
        about: "عن المركز",
        experience: "لماذا مركزنا",
        contact: "اتصلي بنا",
        admin: "لوحة الإدارة",
        bookNow: "احجزي موعدكِ",
        whatsapp: "واتساب مباشر",
        openHours: "الإثنين - السبت : 10:00 - 20:00",
        sundayClosed: "الأحد : مغلق"
      },
      hero: {
        badge: "✨ صالون نسائي حصري وراقٍ بمدينة الوداية",
        title: "أبرزي جمالكِ الطبيعي ودللي نفسكِ",
        subtitle: "انغمسي في عالمكِ الخاص للراحة والتجميل بأجواء فاخرة ومعاملة راقية: إزالة الشعر، أظافر فاخرة، بروتين وعناية متقدمة بالشعر، وتدليك مهدئ للأعصاب.",
        ctaBook: "احجزي موعدكِ الآن",
        ctaServices: "استكشفي خدماتنا والأسعار",
        statClients: "+1500 زبونة راضية",
        statHygien: "تعقيم طبي 100%",
        statProducts: "منتجات عالمية أصلية",
        guarantee: "بدون انتظار • خصوصية تامة للنساء • اهتمام بأدق التفاصيل"
      },
      services: {
        title: "قائمة الخدمات والأسعار",
        currency: "درهم",
        bookThisService: "حجز هذه الخدمة",
        viewOptions: "إضافات وعناية إضافية",
        optionsIncluded: "خيارات إضافية متاحة :",
        startingFrom: "ابتداءً من",
        categoriesTitle: "استكشفي أقسام الجمال",
        categoriesSubtitle: "ثماني خبرات مخصصة لجمالكِ، كل قسم يضم خدماته وأسعاره بوضوح.",
        openCategory: "اكتشفي",
        viewAllCategories: "عرض جميع الأقسام",

        backToServices: "العودة إلى الخدمات",
        categoryServicesTitle: "خدمات هذا القسم",
        categoryNotFound: "القسم غير موجود",
        categoryNotFoundDesc: "هذا القسم غير متوفر حالياً. يمكنكِ تصفح جميع الأقسام من صفحة الخدمات.",
        loading: "جارٍ تحميل الخدمات...",
        categories: {
          coiffure: "العناية بالشعر",
          manucure: "العناية باليدين والأظافر",
          pedicure: "العناية بالقدمين",
          epilation: "إزالة الشعر",
          'soin-visage': "العناية بالبشرة والوجه",
          maquillage: "المكياج والتجميل",
          massage: "المساج والاسترخاء",
          'packs-mariee': "باقات العرائس"
        }
      },
      booking: {
        badge: "📅 حجز موعد سهل وسريع",
        title: "احجزي لحظتكِ الخاصة للجمال والراحة",
        subtitle: "اختاري الخدمة التي تناسبكِ، وحددي التاريخ والوقت، وتواصلي معنا مباشرة عبر واتساب لتأكيد موعدكِ فوراً.",
        step1: "1. اختيار الخدمة",
        step2: "2. التاريخ والوقت",
        step3: "3. بياناتكِ الشخصية",
        step4: "4. التأكيد والإرسال",
        selectCategory: "اختاري القسم :",
        selectService: "اختاري الخدمة المطلوبة :",
        noServiceSelected: "يرجى اختيار خدمة للمتابعة.",
        dateLabel: "تاريخ الموعد :",
        timeLabel: "الوقت المناسب :",
        sundayWarning: "⚠️ نعتذر، المركز مغلق يوم الأحد للراحة الأسبوعية. يرجى اختيار يوم من الإثنين إلى السبت.",
        pastDateWarning: "⚠️ يرجى اختيار تاريخ حالي أو مستقبلي.",
        operatingHoursNote: "ساعات العمل الرسمية: من 10:00 صباحاً إلى 08:00 مساءً (آخر موعد الساعة 19:00).",
        availableSlots: "الأوقات المتاحة :",
        nameLabel: "الاسم الكامل :",
        namePlaceholder: "مثال: فاطمة الزهراء بنعلي",
        phoneLabel: "رقم الهاتف (واتساب) :",
        phonePlaceholder: "مثال: 06 66 92 39 10",
        notesLabel: "ملاحظات أو تفاصيل إضافية (اختياري) :",
        notesPlaceholder: "أي تفاصيل خاصة بطول الشعر، نوع الأظافر، حساسية...",
        summaryTitle: "ملخص طلب الموعد",
        serviceSelected: "الخدمة المختارة :",
        categorySelected: "القسم :",
        priceSelected: "السعر التقديري :",
        indicativePrice: "سعر تقديري",
        dateTime: "الموعد :",
        clientInfo: "الزبونة :",
        confirmBtn: "تأكيد وإرسال عبر واتساب",
        whatsappRedirectNotice: "بالضغط على هذا الزر، سيتم توجيهكِ لتطبيق واتساب مع تفاصيل الحجز جاهزة للإرسال مباشرة إلى المركز.",
        successTitle: "تم تسجيل حجزكِ بنجاح !",
        successSubtitle: "تم تجهيز رسالتكِ. فريق مركز التجميل الوداية يسعد باستقبالكِ والاهتمام بجمالكِ !",
        openWhatsAppNow: "فتح واتساب لتأكيد الحجز",
        newBooking: "حجز موعد آخر"
      },
      whyUs: {
        badge: "تميز مركز الوداية",
        title: "لماذا تختارين مركز التجميل الوداية؟",
        subtitle: "مكانكِ الآمن الذي يجمع بين الراحة النفسية، النظافة الفائقة والمهارة العالية في كل لمسة.",
        item1Title: "تعقيم ونظافة بنسبة 100%",
        item1Desc: "أدوات معقمة طبياً ومغلفة بعناية لكل زبونة على حدة حرصاً منا على صحتكِ وسلامتكِ.",
        item2Title: "ماركات ومنتجات راقية",
        item2Desc: "نستخدم أفضل أنواع الجل والبروتين والمستحضرات المعتمدة عالمياً للحفاظ على نضارة شعركِ وصحة أظافركِ.",
        item3Title: "خصوصية وهدوء تام للنساء",
        item3Desc: "صالون مغلق مخصص للنساء فقط لتستمتعي بلحظاتكِ الخاصة في راحة وأمان واسترخاء تام.",
        item4Title: "فريق محترف وبشوش",
        item4Desc: "خبيرات ذوات كفاءة عالية يحرصن على الاستماع لاحتياجاتكِ وتقديم النصيحة الأنسب لجمالكِ."
      },
      atmosphere: {
        badge: "أجواء الصالون",
        title: "عالم من الرقي والأناقة بانتظاركِ",
        subtitle: "تصميم أنثوي دافئ بألوان الورد والذهب لتشعرين وكأنكِ في واحة هادئة للاستجمام."
      },
      reviews: {
        badge: "آراء زبوناتنا",
        title: "ماذا تقول سيدات الوداية عنا؟",
        subtitle: "ثقة زبوناتنا وابتساماتهن هي فخرنا ومحركنا الدائم للتألق."
      },
      faq: {
        badge: "الأسئلة الشائعة",
        title: "كل ما يهمكِ معرفته قبل زيارتنا",
        subtitle: "إجابات واضحة لتسهيل تجربتكِ والتخطيط لزيارتكِ القادمة."
      },
      contact: {
        badge: "الموقع ومعلومات التواصل",
        title: "يسعدنا جداً استقبالكِ",
        subtitle: "نحن في انتظار زيارتكِ لتجربة جمال واستجمام لا تُنسى في مركز التجميل الوداية.",
        addressTitle: "العنوان",
        addressText: "مركز التجميل الوداية، الوداية، جهة مراكش",
        phoneTitle: "الهاتف وواتساب",
        hoursTitle: "أوقات العمل والاستقبال",
        hoursMonSat: "من الإثنين إلى السبت : 10:00 صباحاً - 20:00 مساءً",
        hoursSun: "الأحد : مغلق (عطلة أسبوعية)",
        instagramTitle: "حساب الإنستغرام الرسمي",
        btnCall: "اتصلي على 0666923910",
        btnWhatsApp: "تحدثي معنا عبر واتساب"
      },
      admin: {
        loginTitle: "تسجيل الدخول لإدارة المركز",
        loginSubtitle: "خاص بإدارة مركز التجميل الوداية لمتابعة الحجوزات والخدمات",
        passwordLabel: "كلمة مرور الإدارة :",
        passwordPlaceholder: "أدخلي كلمة السر...",
        loginBtn: "دخول لوحة التحكم",
        invalidPass: "كلمة المرور غير صحيحة.",
        dashboardTitle: "لوحة تحكم مركز التجميل الوداية",
        logout: "تسجيل الخروج",
        tabs: {
          services: "إدارة الخدمات والأسعار",
          bookings: "طلبات الحجز",
          settings: "إعدادات المركز"
        },
        servicesTab: {
          addNew: "إضافة خدمة جديدة",
          nameFr: "اسم الخدمة (فرنسي)",
          nameAr: "اسم الخدمة (عربي)",
          category: "القسم",
          price: "السعر (درهم)",
          availability: "الحالة",
          active: "متوفرة",
          inactive: "غير متوفرة حالياً",
          edit: "تعديل",
          delete: "حذف",
          save: "حفظ",
          cancel: "إلغاء",
          addSuccess: "تمت إضافة الخدمة بنجاح !",
          updateSuccess: "تم تحديث الخدمة بنجاح !",
          deleteConfirm: "هل أنتِ متأكدة من رغبتكِ في حذف هذه الخدمة؟"
        },
        bookingsTab: {
          totalBookings: "إجمالي طلبات الحجز :",
          filterAll: "الكل",
          filterPending: "قيد الانتظار",
          filterConfirmed: "تم التأكيد",
          filterCompleted: "تم الإنجاز",
          filterCancelled: "ملغاة",
          statusUpdated: "تم تحديث حالة الحجز",
          contactClient: "مراسلة الزبونة عبر واتساب",
          noBookings: "لا توجد طلبات حجز مسجلة حتى الآن."
        },
        settingsTab: {
          phone: "رقم الواتساب الرسمي",
          instagram: "حساب الإنستغرام",
          hours: "ساعات العمل الرسمية",
          sundayStatus: "حالة يوم الأحد",
          sundayClosedAlways: "مغلق دائماً (المعتمد)",
          sundayOpenSpecial: "فتح استثنائي (مناسبات)",
          saveSettings: "حفظ الإعدادات"
        }
      },
      footer: {
        quickLinks: "روابط سريعة",
        categories: "أقسام الجمال",
        rights: "جميع الحقوق محفوظة.",
        heartText: "Prenez soin de vous ♡"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // default language
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false
    }
  });

// Handle document direction when language changes
i18n.on('languageChanged', (lng) => {
  const dir = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

export default i18n;
