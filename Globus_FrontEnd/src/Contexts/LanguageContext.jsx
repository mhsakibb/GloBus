import React, { createContext, useContext, useState, useEffect } from "react";

export const langs = [
  { code: "us", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "bd", name: "Bangla" },
];

export const translations = {
  us: {
    // Header & Navigation
    deliverTo: "Deliver to",
    searchPlaceholder: "Search in",
    cart: "Cart",
    wishlist: "Wishlist",
    ordersPayments: "Orders & Payments",
    orders: "Orders",
    signIn: "Sign In",
    hello: "Hello",
    logout: "Logout",
    marqueeNotice: "Note: Please open the package before receiving to check for any damage. If there is an issue, report immediately to the delivery rider.",

    // Categories
    categories: {
      "All": "All",
      "Food": "Food",
      "Kitchen Utils": "Kitchen Utils",
      "Fashion": "Fashion",
      "Skin Care": "Skin Care",
      "Electronics": "Electronics",
      "Stationary": "Stationary",
      "Toys": "Toys",
    },

    // Subcategories
    subCategories: {
      "Fruits": "Fruits",
      "Vegetables": "Vegetables",
      "Snacks": "Snacks",
      "Beverages": "Beverages",
      "Dairy & Bakery": "Dairy & Bakery",
      "Pots & Pans": "Pots & Pans",
      "Cutlery": "Cutlery",
      "Appliances": "Appliances",
      "Cookware": "Cookware",
      "Storage": "Storage",
      "Men": "Men",
      "Women": "Women",
      "Kids": "Kids",
      "Footwear": "Footwear",
      "Watches & Jewelry": "Watches & Jewelry",
      "Bags": "Bags",
      "Creams": "Creams",
      "Lotions": "Lotions",
      "Oils": "Oils",
      "Cleansers & Serums": "Cleansers & Serums",
      "Sunscreen": "Sunscreen",
      "Mobiles": "Mobiles",
      "Laptops": "Laptops",
      "Audio & Headphones": "Audio & Headphones",
      "Smartwatches & Wearables": "Smartwatches & Wearables",
      "Cameras": "Cameras",
      "Drones": "Drones",
      "Accessories": "Accessories",
      "Pens": "Pens",
      "Notebooks": "Notebooks",
      "Art Supplies": "Art Supplies",
      "Office Supplies": "Office Supplies",
      "Soft Toys": "Soft Toys",
      "Educational": "Educational",
      "Action Figures": "Action Figures",
      "Board Games": "Board Games",
    },

    // Section Titles
    sections: {
      "Featured Products": "Featured Products",
      "Top Deals": "Top Deals",
      "New Arrivals": "New Arrivals",
      "Vegetables & Fresh Foods": "Vegetables & Fresh Foods",
      "Electronics": "Electronics",
      "Fashion": "Fashion",
      "Kitchen Utils": "Kitchen Utils",
      "Skin Care": "Skin Care",
      "Stationary": "Stationary",
      "Toys": "Toys",
    },

    // UI Buttons & Labels
    viewDetails: "View Details",
    showMore: "Show More",
    showLess: "Show Less",
    monthlyDeals: "Monthly Deals",
    monthEndOver: "Month End Deals are over!",
    days: "Days",
    hours: "Hours",
    min: "Min",
    sec: "Sec",
    featuredTech: "Featured Tech",
    latestFlagship: "Latest Flagship Gadgets",
    techSubtitle: "Smartphones, Laptops, Audio & Premium Drones",
    exploreGadgets: "EXPLORE GADGETS",
    newsletterTitle: "Subscribe to our newsletter",
    newsletterPlaceholder: "Enter your email",
    subscribe: "Subscribe",
    subscribing: "Subscribing...",
    privacyNotice: "We respect your privacy. Unsubscribe at any time.",
    backToTop: "Back to top",
    back: "Back",
    off: "OFF",
  },

  es: {
    // Header & Navigation
    deliverTo: "Entregar a",
    searchPlaceholder: "Buscar en",
    cart: "Carrito",
    wishlist: "Lista de deseos",
    ordersPayments: "Pedidos & Pagos",
    orders: "Pedidos",
    signIn: "Iniciar Sesión",
    hello: "Hola",
    logout: "Cerrar Sesión",
    marqueeNotice: "Nota: Abra el paquete antes de recibirlo para verificar si hay daños. Si hay algún problema, infórmelo inmediatamente al repartidor.",

    // Categories
    categories: {
      "All": "Todo",
      "Food": "Comida",
      "Kitchen Utils": "Utensilios de Cocina",
      "Fashion": "Moda",
      "Skin Care": "Cuidado de la Piel",
      "Electronics": "Electrónica",
      "Stationary": "Papelería",
      "Toys": "Juguetes",
    },

    // Subcategories
    subCategories: {
      "Fruits": "Frutas",
      "Vegetables": "Verduras",
      "Snacks": "Aperitivos",
      "Beverages": "Bebidas",
      "Dairy & Bakery": "Lácteos y Panadería",
      "Pots & Pans": "Ollas y Sartenes",
      "Cutlery": "Cubertería",
      "Appliances": "Electrodomésticos",
      "Cookware": "Batería de cocina",
      "Storage": "Almacenamiento",
      "Men": "Hombres",
      "Women": "Mujeres",
      "Kids": "Niños",
      "Footwear": "Calzado",
      "Watches & Jewelry": "Relojes y Joyas",
      "Bags": "Bolsos",
      "Creams": "Cremas",
      "Lotions": "Lociones",
      "Oils": "Aceites",
      "Cleansers & Serums": "Limpiadores y Sueros",
      "Sunscreen": "Protector Solar",
      "Mobiles": "Móviles",
      "Laptops": "Portátiles",
      "Audio & Headphones": "Audio y Auriculares",
      "Smartwatches & Wearables": "Relojes Inteligentes",
      "Cameras": "Cámaras",
      "Drones": "Drones",
      "Accessories": "Accesorios",
      "Pens": "Bolígrafos",
      "Notebooks": "Cuadernos",
      "Art Supplies": "Material de Arte",
      "Office Supplies": "Material de Oficina",
      "Soft Toys": "Peluches",
      "Educational": "Educativo",
      "Action Figures": "Figuras de Acción",
      "Board Games": "Juegos de Mesa",
    },

    // Section Titles
    sections: {
      "Featured Products": "Productos Destacados",
      "Top Deals": "Mejores Ofertas",
      "New Arrivals": "Nuevas Llegadas",
      "Vegetables & Fresh Foods": "Verduras y Alimentos Frescos",
      "Electronics": "Electrónica",
      "Fashion": "Moda",
      "Kitchen Utils": "Utensilios de Cocina",
      "Skin Care": "Cuidado de la Piel",
      "Stationary": "Papelería",
      "Toys": "Juguetes",
    },

    // UI Buttons & Labels
    viewDetails: "Ver Detalles",
    showMore: "Mostrar Más",
    showLess: "Mostrar Menos",
    monthlyDeals: "Ofertas del Mes",
    monthEndOver: "¡Las ofertas de fin de mes han terminado!",
    days: "Días",
    hours: "Horas",
    min: "Min",
    sec: "Seg",
    featuredTech: "Tecnología Destacada",
    latestFlagship: "Últimos Dispositivos Emblemáticos",
    techSubtitle: "Smartphones, Portátiles, Audio y Drones Premium",
    exploreGadgets: "EXPLORAR GADGETS",
    newsletterTitle: "Suscríbete a nuestro boletín",
    newsletterPlaceholder: "Introduce tu correo",
    subscribe: "Suscribirse",
    subscribing: "Suscribiendo...",
    privacyNotice: "Respetamos su privacidad. Darse de baja en cualquier momento.",
    backToTop: "Volver arriba",
    back: "Atrás",
    off: "DESC",
  },

  fr: {
    // Header & Navigation
    deliverTo: "Livrer à",
    searchPlaceholder: "Rechercher dans",
    cart: "Panier",
    wishlist: "Liste de souhaits",
    ordersPayments: "Commandes & Paiements",
    orders: "Commandes",
    signIn: "Se Connecter",
    hello: "Bonjour",
    logout: "Se Déconnecter",
    marqueeNotice: "Remarque : Veuillez ouvrir le colis avant réception pour vérifier les dommages éventuels. En cas de problème, signalez-le immédiatement au livreur.",

    // Categories
    categories: {
      "All": "Tout",
      "Food": "Nourriture",
      "Kitchen Utils": "Ustensiles de Cuisine",
      "Fashion": "Mode",
      "Skin Care": "Soins de la Peau",
      "Electronics": "Électronique",
      "Stationary": "Papeterie",
      "Toys": "Jouets",
    },

    // Subcategories
    subCategories: {
      "Fruits": "Fruits",
      "Vegetables": "Légumes",
      "Snacks": "Collations",
      "Beverages": "Boissons",
      "Dairy & Bakery": "Produits Laitiers et Boulangerie",
      "Pots & Pans": "Casseroles et Poêles",
      "Cutlery": "Coutellerie",
      "Appliances": "Appareils Ménagers",
      "Cookware": "Batterie de Cuisine",
      "Storage": "Rangement",
      "Men": "Hommes",
      "Women": "Femmes",
      "Kids": "Enfants",
      "Footwear": "Chaussures",
      "Watches & Jewelry": "Montres et Bijoux",
      "Bags": "Sacs",
      "Creams": "Crèmes",
      "Lotions": "Lotions",
      "Oils": "Huiles",
      "Cleansers & Serums": "Nettoyants et Sérums",
      "Sunscreen": "Crème Solaire",
      "Mobiles": "Mobiles",
      "Laptops": "Ordinateurs Portables",
      "Audio & Headphones": "Audio et Écouteurs",
      "Smartwatches & Wearables": "Montres Connectées",
      "Cameras": "Appareils Photo",
      "Drones": "Drones",
      "Accessories": "Accessoires",
      "Pens": "Stylos",
      "Notebooks": "Cahiers",
      "Art Supplies": "Fournitures d'Art",
      "Office Supplies": "Fournitures de Bureau",
      "Soft Toys": "Peluches",
      "Educational": "Éducatif",
      "Action Figures": "Figurines",
      "Board Games": "Jeux de Société",
    },

    // Section Titles
    sections: {
      "Featured Products": "Produits en Vedette",
      "Top Deals": "Meilleures Offres",
      "New Arrivals": "Nouveautés",
      "Vegetables & Fresh Foods": "Légumes & Aliments Frais",
      "Electronics": "Électronique",
      "Fashion": "Mode",
      "Kitchen Utils": "Ustensiles de Cuisine",
      "Skin Care": "Soins de la Peau",
      "Stationary": "Papeterie",
      "Toys": "Jouets",
    },

    // UI Buttons & Labels
    viewDetails: "Voir les Détails",
    showMore: "Afficher Plus",
    showLess: "Afficher Moins",
    monthlyDeals: "Offres du Mois",
    monthEndOver: "Les offres de fin de mois sont terminées !",
    days: "Jours",
    hours: "Heures",
    min: "Min",
    sec: "Sec",
    featuredTech: "Tech en Vedette",
    latestFlagship: "Derniers Gadgets Phares",
    techSubtitle: "Smartphones, Ordinateurs Portables, Audio & Drones Premium",
    exploreGadgets: "EXPLORER LES GADGETS",
    newsletterTitle: "Abonnez-vous à notre newsletter",
    newsletterPlaceholder: "Entrez votre email",
    subscribe: "S'abonner",
    subscribing: "Inscription en cours...",
    privacyNotice: "Nous respectons votre vie privée. Désabonnez-vous à tout moment.",
    backToTop: "Retour en haut",
    back: "Retour",
    off: "RÉDUC",
  },

  de: {
    // Header & Navigation
    deliverTo: "Liefern an",
    searchPlaceholder: "Suchen in",
    cart: "Warenkorb",
    wishlist: "Wunschliste",
    ordersPayments: "Bestellungen & Zahlungen",
    orders: "Bestellungen",
    signIn: "Anmelden",
    hello: "Hallo",
    logout: "Abmelden",
    marqueeNotice: "Hinweis: Bitte öffnen Sie das Paket vor der Annahme, um eventuelle Schäden zu überprüfen.",

    // Categories
    categories: {
      "All": "Alle",
      "Food": "Lebensmittel",
      "Kitchen Utils": "Küchenutensilien",
      "Fashion": "Mode",
      "Skin Care": "Hautpflege",
      "Electronics": "Elektronik",
      "Stationary": "Schreibwaren",
      "Toys": "Spielzeug",
    },

    // Subcategories
    subCategories: {
      "Fruits": "Früchte",
      "Vegetables": "Gemüse",
      "Snacks": "Snacks",
      "Beverages": "Getränke",
      "Dairy & Bakery": "Milchprodukte & Bäckerei",
      "Pots & Pans": "Töpfe & Pfannen",
      "Cutlery": "Besteck",
      "Appliances": "Haushaltsgeräte",
      "Cookware": "Kochgeschirr",
      "Storage": "Aufbewahrung",
      "Men": "Herren",
      "Women": "Damen",
      "Kids": "Kinder",
      "Footwear": "Schuhe",
      "Watches & Jewelry": "Uhren & Schmuck",
      "Bags": "Taschen",
      "Creams": "Cremes",
      "Lotions": "Lotionen",
      "Oils": "Öle",
      "Cleansers & Serums": "Reiniger & Seren",
      "Sunscreen": "Sonnencreme",
      "Mobiles": "Handys",
      "Laptops": "Laptops",
      "Audio & Headphones": "Audio & Kopfhörer",
      "Smartwatches & Wearables": "Smartwatches",
      "Cameras": "Kameras",
      "Drones": "Drohnen",
      "Accessories": "Zubehör",
      "Pens": "Stifte",
      "Notebooks": "Notizbücher",
      "Art Supplies": "Künstlerbedarf",
      "Office Supplies": "Bürobedarf",
      "Soft Toys": "Plüschtiere",
      "Educational": "Pädagogisch",
      "Action Figures": "Actionfiguren",
      "Board Games": "Brettspiele",
    },

    // Section Titles
    sections: {
      "Featured Products": "Empfohlene Produkte",
      "Top Deals": "Top-Angebote",
      "New Arrivals": "Neuheiten",
      "Vegetables & Fresh Foods": "Gemüse & Frische Lebensmittel",
      "Electronics": "Elektronik",
      "Fashion": "Mode",
      "Kitchen Utils": "Küchenutensilien",
      "Skin Care": "Hautpflege",
      "Stationary": "Schreibwaren",
      "Toys": "Spielzeug",
    },

    // UI Buttons & Labels
    viewDetails: "Details Anzeigen",
    showMore: "Mehr Anzeigen",
    showLess: "Weniger Anzeigen",
    monthlyDeals: "Monatsangebote",
    monthEndOver: "Die Monatsend-Angebote sind vorbei!",
    days: "Tage",
    hours: "Std",
    min: "Min",
    sec: "Sek",
    featuredTech: "Vorgestellte Technik",
    latestFlagship: "Neueste Flaggschiff-Gadgets",
    techSubtitle: "Smartphones, Laptops, Audio & Premium-Drohnen",
    exploreGadgets: "GADGETS ENTDECKEN",
    newsletterTitle: "Abonnieren Sie unseren Newsletter",
    newsletterPlaceholder: "Geben Sie Ihre E-Mail ein",
    subscribe: "Abonnieren",
    subscribing: "Wird abonniert...",
    privacyNotice: "Wir respektieren Ihre Privatsphäre. Jederzeit abbestellbar.",
    backToTop: "Nach oben",
    back: "Zurück",
    off: "RABATT",
  },

  bd: {
    // Header & Navigation
    deliverTo: "ডেলিভারি করুন",
    searchPlaceholder: "খুঁজুন",
    cart: "কার্ট",
    wishlist: "উইশলিস্ট",
    ordersPayments: "অর্ডার ও পেমেন্ট",
    orders: "অর্ডার",
    signIn: "সাইন ইন",
    hello: "হ্যালো",
    logout: "লগআউট",
    marqueeNotice: "দ্রষ্টব্য: পণ্য গ্রহণ করার আগে প্যাকেট খুলে দেখুন—ড্যামেজ আছে কি না নিশ্চিত করুন। সমস্যা থাকলে অবিলম্বে রাইডারকে দেখান ও গ্রহণ বর্জন/রিপোর্ট করুন।",

    // Categories
    categories: {
      "All": "সব ক্যাটাগরি",
      "Food": "খাবার",
      "Kitchen Utils": "রান্নাঘরের সামগ্রী",
      "Fashion": "ফ্যাশন",
      "Skin Care": "ত্বকের যত্ন",
      "Electronics": "ইলেকট্রনিক্স",
      "Stationary": "স্টেশনারি",
      "Toys": "খেলনা",
    },

    // Subcategories
    subCategories: {
      "Fruits": "ফলমূল",
      "Vegetables": "শাকসবজি",
      "Snacks": "স্ন্যাক্স ও নাস্তা",
      "Beverages": "পানীয়",
      "Dairy & Bakery": "দুগ্ধ ও বেকারি",
      "Pots & Pans": "হাঁড়ি ও কড়াই",
      "Cutlery": "চামচ ও ছুরি",
      "Appliances": "রান্নাঘরের যন্ত্রপাতি",
      "Cookware": "রান্নার তৈজসপত্র",
      "Storage": "সংরক্ষণ পাত্র",
      "Men": "পুরুষদের পোশাক",
      "Women": "মহিলাদের পোশাক",
      "Kids": "বাচ্চাদের পোশাক",
      "Footwear": "জুতো ও স্যান্ডেল",
      "Watches & Jewelry": "ঘড়ি ও গহনা",
      "Bags": "ব্যাগ",
      "Creams": "ক্রিম",
      "Lotions": "লোশন",
      "Oils": "তেল",
      "Cleansers & Serums": "ক্লিনজার ও সিরাম",
      "Sunscreen": "সানস্ক্রিন",
      "Mobiles": "মোবাইল ফোন",
      "Laptops": "ল্যাপটপ",
      "Audio & Headphones": "অডিও ও হেডফোন",
      "Smartwatches & Wearables": "স্মার্টওয়াচ",
      "Cameras": "ক্যামেরা",
      "Drones": "ড্রোন",
      "Accessories": "এক্সেসরিজ",
      "Pens": "কলম",
      "Notebooks": "খাতা ও নোটবুক",
      "Art Supplies": "আর্ট সামগ্রী",
      "Office Supplies": "অফিস সামগ্রী",
      "Soft Toys": "সফট টয়",
      "Educational": "শিক্ষণীয় খেলনা",
      "Action Figures": "অ্যাকশন ফিগার",
      "Board Games": "বোর্ড গেম",
    },

    // Section Titles
    sections: {
      "Featured Products": "সেরা নির্বাচিত পণ্য",
      "Top Deals": "সেরা অফারসমূহ",
      "New Arrivals": "নতুন কালেকশন",
      "Vegetables & Fresh Foods": "তাজা শাকসবজি ও খাবার",
      "Electronics": "ইলেকট্রনিক্স গ্যাজেট",
      "Fashion": "ফ্যাশন ও লাইফস্টাইল",
      "Kitchen Utils": "রান্নাঘরের তৈজসপত্র",
      "Skin Care": "স্কিন কেয়ার পণ্য",
      "Stationary": "স্টেশনারি ও বই",
      "Toys": "খেলনা ও বিনোদন",
    },

    // UI Buttons & Labels
    viewDetails: "বিস্তারিত দেখুন",
    showMore: "আরো দেখুন",
    showLess: "কম দেখুন",
    monthlyDeals: "মাসিক সেরা অফার",
    monthEndOver: "মাস শেষের অফার শেষ হয়ে গেছে!",
    days: "দিন",
    hours: "ঘন্টা",
    min: "মিনিট",
    sec: "সেকেন্ড",
    featuredTech: "ফিচার্ড টেক",
    latestFlagship: "লেটেস্ট ফ্ল্যাগশিপ গ্যাজেট",
    techSubtitle: "স্মার্টফোন, ল্যাপটপ, অডিও ও প্রিমিয়াম ড্রোন",
    exploreGadgets: "গ্যাজেট দেখুন",
    newsletterTitle: "আমাদের নিউজলেটারে যুক্ত হোন",
    newsletterPlaceholder: "আপনার ইমেইল দিন",
    subscribe: "সাবস্ক্রাইব করুন",
    subscribing: "যুক্ত হচ্ছে...",
    privacyNotice: "আমরা আপনার গোপনীয়তাকে সম্মান করি। যেকোনো সময় আনসাবস্ক্রাইব করতে পারেন।",
    backToTop: "উপরে যান",
    back: "উপরে",
    off: "ছাড়",
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    const savedCode = localStorage.getItem("globus_lang");
    const found = langs.find((l) => l.code === savedCode);
    return found || langs[0];
  });

  const setLang = (newLang) => {
    setLangState(newLang);
    localStorage.setItem("globus_lang", newLang.code);
  };

  // Safe dictionary accessor
  const currentTranslations = translations[lang.code] || translations.us;

  // General text lookup helper
  const t = (key, fallback = "") => {
    return currentTranslations[key] ?? translations.us[key] ?? fallback ?? key;
  };

  // Category translation helper
  const tCategory = (categoryName) => {
    if (!categoryName) return "";
    return (
      currentTranslations.categories?.[categoryName] ??
      translations.us.categories?.[categoryName] ??
      categoryName
    );
  };

  // Subcategory translation helper
  const tSubCategory = (subCategoryName) => {
    if (!subCategoryName) return "";
    return (
      currentTranslations.subCategories?.[subCategoryName] ??
      translations.us.subCategories?.[subCategoryName] ??
      subCategoryName
    );
  };

  // Section title translation helper
  const tSection = (sectionTitle) => {
    if (!sectionTitle) return "";
    return (
      currentTranslations.sections?.[sectionTitle] ??
      translations.us.sections?.[sectionTitle] ??
      sectionTitle
    );
  };

  // Free Google Translate API for dynamic arbitrary text (if needed)
  const translateDynamic = async (text, targetLang = lang.code === 'bd' ? 'bn' : lang.code) => {
    if (!text) return "";
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      return data[0][0][0] || text;
    } catch (err) {
      console.error("Translation API error:", err);
      return text;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        langs,
        t,
        tCategory,
        tSubCategory,
        tSection,
        translateDynamic,
        currentTranslations,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
