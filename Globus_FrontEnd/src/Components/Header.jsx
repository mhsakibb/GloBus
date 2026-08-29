import React, { useState, useEffect, useRef } from "react";
import {
  faLocationDot,
  faSearch,
  faCartShopping,
  faUser,
  faChevronDown,
  faHeart,
  faMoon,
  faSun,
  faCreditCard,
  faBars,
  faTimes,
  faCamera,
  faMicrophone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase.config";
import { useTheme } from "../Contexts/ThemeContext";
import { useLanguage } from "../Contexts/LanguageContext";

// Backend Api
const API_URL = import.meta.env.VITE_API_URL;

const cats = [
  "All",
  "Food",
  "Kitchen Utils",
  "Fashion",
  "Skin Care",
  "Electronics",
  "Stationary",
  "Toys",
];

const Header = () => {
  const { lang, setLang, langs, t, tCategory } = useLanguage();
  const [cat, setCat] = useState(cats[0]);
  const [openLang, setOpenLang] = useState(false);
  const [openCat, setOpenCat] = useState(false);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loc, setLoc] = useState(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const [openProfile, setOpenProfile] = useState(false);
  const [wishlistHover, setWishlistHover] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisionSearching, setIsVisionSearching] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const fileInputRef = useRef(null);
  const [wishlistCount, setWishlistCount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wishlist") || "[]").length;
    } catch (e) {
      return 0;
    }
  });

  useEffect(() => {
    const updateCount = () => {
      try {
        setWishlistCount(JSON.parse(localStorage.getItem("wishlist") || "[]").length);
      } catch (e) {
        setWishlistCount(0);
      }
    };
    window.addEventListener("wishlist-updated", updateCount);
    return () => window.removeEventListener("wishlist-updated", updateCount);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  const langRef = useRef(null);
  const catRef = useRef(null);
  const profRef = useRef(null);

  const navigate = useNavigate();

  // Visual Search handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsVisionSearching(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiUrl}/api/vision-search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Data })
        });
        const data = await response.json();
        setIsVisionSearching(false);
        if (response.ok) {
          navigate(
            `/search?q=${encodeURIComponent(data.query)}`,
            { state: { searchResults: data.products, searchQuery: data.query, category: "All" } }
          );
        } else {
          alert("Failed to search by image: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
        setIsVisionSearching(false);
        alert("Network error during visual search");
      }
    };
  };

  // Voice Search Handler
  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support voice search.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = lang.code === 'bd' ? 'bn-BD' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };
    recognition.onerror = (event) => console.error(event.error);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Fetch all products
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/browseProduct`);
        if (!res.ok) return;
        const data = await res.json();
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch all products error:", err);
      }
    };
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser((prev) => ({
          ...prev,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        }));
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    setOpenProfile(false);
    setUser(null);
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const res = await fetch("https://ipwho.is/");
        const data = await res.json();
        if (data && data.city && data.country) {
          setLoc({ city: data.city, country: data.country });
        }
      } catch (err) {
        console.error("Location fetch error:", err);
      }
    };
    fetchLocation();
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (langRef.current && !langRef.current.contains(e.target))
        setOpenLang(false);
      if (catRef.current && !catRef.current.contains(e.target))
        setOpenCat(false);
      if (profRef.current && !profRef.current.contains(e.target))
        setOpenProfile(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const matchField = (field, query) => {
    if (!field) return false;
    if (typeof field === "string") return field.toLowerCase().includes(query);
    if (Array.isArray(field)) {
      return field.some((item) => typeof item === "string" && item.toLowerCase().includes(query));
    }
    return String(field).toLowerCase().includes(query);
  };

  // Filter Search suggestions
  useEffect(() => {
    if (!searchQuery) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const filtered = allProducts.filter((p) => {
      const query = searchQuery.toLowerCase();
      const matchesText =
        matchField(p.name, query) ||
        matchField(p.subCategory, query) ||
        matchField(p.brand, query) ||
        matchField(p.tags, query);
      const matchesCategory = cat === "All" || p.category === cat;
      return matchesText && matchesCategory;
    });

    setSuggestions(filtered.slice(0, 10));
    setActiveIndex(-1);
  }, [searchQuery, allProducts, cat]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const filtered = allProducts.filter((p) => {
        const query = searchQuery.toLowerCase();
        const matchesText =
          matchField(p.name, query) ||
          matchField(p.subCategory, query) ||
          matchField(p.brand, query) ||
          matchField(p.tags, query);
        const matchesCategory = cat === "All" || p.category === cat;
        return matchesText && matchesCategory;
      });

      navigate(
        `/search?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(cat)}`,
        {
          state: { searchResults: filtered, searchQuery, category: cat },
        },
      );
      setSearchQuery("");
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions.length > 0) {
        const selected = suggestions[activeIndex];
        navigate(`/productDetail/${selected._id}`, {
          state: { product: selected },
        });
        setSearchQuery("");
        setSuggestions([]);
      } else {
        handleSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(
        (prev) => (prev - 1 + suggestions.length) % suggestions.length,
      );
    }
  };

  const firstName =
    user?.name?.split(" ")[0] || user?.displayName?.split(" ")[0] || "";

  return (
    <>
      <header className="bg-gray-900 sticky z-50 top-0 shadow-lg border-b border-gray-700 w-full">
        <div className="flex flex-wrap md:flex-nowrap items-center justify-between mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-14 2xl:mx-20 px-2 sm:px-3 md:px-4 lg:px-6 py-2.5 lg:py-3 gap-3 md:gap-4">
          
          {/* Left: Logo & Location */}
          <div className="flex items-center justify-between w-full md:w-auto flex-shrink-0 gap-3 lg:gap-5">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate("/")}
            >
              <h1 className="font-bold text-2xl lg:text-3xl text-green-600">
                Glo<span className="text-white">Bus</span>
              </h1>
            </div>

            {/* Location */}
            <div className="hidden sm:flex text-white items-center flex-shrink-0">
              <FontAwesomeIcon icon={faLocationDot} className="text-base lg:text-lg mr-1.5 lg:mr-2 text-gray-300" />
              <div className="font-semibold leading-tight">
                <h1 className="text-[11px] text-gray-400 font-normal">{t("deliverTo")}</h1>
                <h1 className="text-xs lg:text-sm font-bold truncate max-w-[130px] lg:max-w-[160px]">
                  {loc ? `${loc.city}, ${loc.country}` : "Dhaka, Bangladesh"}
                </h1>
              </div>
            </div>

            <button
              className="md:hidden text-white text-2xl"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
            </button>
          </div>

          {/* Center: Fluid Search Bar that fills available space evenly */}
          <div className={`w-full md:flex md:flex-1 min-w-0 max-w-full md:max-w-xl lg:max-w-2xl 2xl:max-w-3xl mx-0 md:mx-2 lg:mx-4 ${mobileMenuOpen ? "flex" : "hidden"}`}>
            <div className="flex w-full relative">
              {/* Category Button */}
              <div className="relative flex-shrink-0" ref={catRef}>
                <button
                  onClick={() => setOpenCat(!openCat)}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 lg:px-3.5 h-9 lg:h-10 rounded-l-md border-r border-gray-300 dark:border-gray-600 text-xs lg:text-sm font-medium flex items-center hover:bg-gray-200 dark:hover:bg-gray-600 transition whitespace-nowrap"
                >
                  <span className="truncate max-w-[65px] lg:max-w-[85px]">{tCategory(cat)}</span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`ml-1.5 text-[10px] transition-transform ${openCat ? "rotate-180" : ""}`}
                  />
                </button>

                {openCat && (
                  <div className="absolute top-full left-0 mt-1 w-44 lg:w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50">
                    {cats.map((c) => (
                      <button
                        key={c}
                        className={`w-full px-4 py-2 text-xs lg:text-sm text-left hover:bg-blue-50 ${cat === c ? "bg-blue-100 text-blue-800" : "text-gray-800 dark:text-gray-200"}`}
                        onClick={() => {
                          setCat(c);
                          setOpenCat(false);
                        }}
                      >
                        {tCategory(c)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Input */}
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center bg-white dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-600 h-9 lg:h-10 w-full">
                  <input
                    type="text"
                    placeholder={`${t("searchPlaceholder")}...`}
                    className="flex-1 min-w-0 px-2.5 lg:px-3 h-full text-black dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 outline-none bg-transparent w-full text-xs lg:text-sm"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setActiveIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                  />

                  {/* Voice Search Button */}
                  <button
                    className={`px-1.5 lg:px-2.5 h-full flex items-center justify-center transition ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-orange-500'}`}
                    onClick={startVoiceSearch}
                    title="Search by Voice"
                  >
                    <FontAwesomeIcon icon={faMicrophone} className="text-xs lg:text-sm" />
                  </button>

                  {/* Visual Search Button */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    className="px-1.5 lg:px-2.5 h-full flex items-center justify-center text-gray-500 hover:text-orange-500 transition"
                    onClick={() => fileInputRef.current?.click()}
                    title="Search by Image"
                    disabled={isVisionSearching}
                  >
                    {isVisionSearching ? (
                      <div className="w-3.5 h-3.5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FontAwesomeIcon icon={faCamera} className="text-sm lg:text-base" />
                    )}
                  </button>
                </div>

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 z-50 max-h-60 overflow-auto shadow-lg rounded-b-md">
                    {suggestions.map((s, idx) => (
                      <div
                        key={s._id}
                        onClick={() => {
                          navigate(`/productDetail/${s._id}`, {
                            state: { product: s },
                          });
                          setSearchQuery("");
                          setSuggestions([]);
                        }}
                        className={`flex items-center px-3 py-2 cursor-pointer ${activeIndex === idx ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                      >
                        <img
                          src={s?.images[0] ? s?.images[0] : "/placeholder.png"}
                          alt={s.name}
                          className="w-7 h-7 lg:w-9 lg:h-9 object-cover rounded mr-2.5"
                        />
                        <span className="text-gray-800 dark:text-gray-200 text-xs lg:text-sm truncate">
                          {s.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className="bg-orange-500 px-3.5 lg:px-4.5 h-9 lg:h-10 rounded-r-md flex items-center justify-center hover:bg-orange-600 transition flex-shrink-0"
                onClick={handleSearch}
              >
                <FontAwesomeIcon icon={faSearch} className="text-white text-xs lg:text-sm" />
              </button>
            </div>
          </div>

          {/* Right Section: Evenly distributed navigation items + separated profile on far right */}
          <div className={`w-full md:w-auto flex-col md:flex-row items-center md:space-x-2 lg:space-x-3 xl:space-x-4 2xl:space-x-5 space-y-3 md:space-y-0 mt-3 md:mt-0 pb-3 md:pb-0 ${mobileMenuOpen ? "flex" : "hidden"} md:flex flex-shrink-0`}>
            
            {/* Evenly distributed Nav Actions */}
            <div className="flex items-center space-x-2 lg:space-x-3.5 xl:space-x-4 2xl:space-x-5">
              {/* Language */}
              <div className="relative" ref={langRef}>
                <button
                  className="flex items-center text-white px-1.5 lg:px-2 py-1 rounded hover:bg-gray-800 transition"
                  onClick={() => setOpenLang(!openLang)}
                >
                  <span className="font-medium flex items-center text-xs lg:text-sm">
                    <img
                      src={`https://flagcdn.com/${lang.code}.svg`}
                      alt={lang.name}
                      className="w-4 h-3 lg:w-5 lg:h-3.5 mr-1.5 object-cover rounded-[1px]"
                    />
                    <span className="hidden xl:inline">{lang.name}</span>
                  </span>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`ml-1 text-[10px] transition-transform ${openLang ? "rotate-180" : ""}`}
                  />
                </button>

                {openLang && (
                  <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50">
                    {langs.map((l) => (
                      <button
                        key={l.code}
                        className={`flex items-center w-full px-3 py-1.5 text-xs lg:text-sm text-left hover:bg-blue-50 ${lang.code === l.code ? "bg-blue-100 text-blue-800" : "text-gray-800 dark:text-gray-200"}`}
                        onClick={() => {
                          setLang(l);
                          setOpenLang(false);
                        }}
                      >
                        <img
                          src={`https://flagcdn.com/${l.code}.svg`}
                          alt={l.name}
                          className="w-4 h-3 mr-2 object-cover rounded-[1px]"
                        />
                        <span>{l.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Orders & Payments*/}
              <div
                className="text-white cursor-pointer flex items-center hover:text-gray-300 transition px-1.5 lg:px-2 py-1 rounded"
                onClick={() => navigate("/orderHistory")}
                title="Orders & Payments"
              >
                <FontAwesomeIcon icon={faCreditCard} className="text-sm lg:text-base" />
                <h1 className="ml-1.5 font-medium text-xs lg:text-sm whitespace-nowrap">
                  <span className="hidden 2xl:inline">{t("ordersPayments")}</span>
                  <span className="2xl:hidden">{t("orders")}</span>
                </h1>
              </div>

              {/* Cart */}
              <div
                className="text-white cursor-pointer flex items-center hover:text-gray-300 transition px-1.5 lg:px-2 py-1 rounded"
                onClick={() => navigate("/cart")}
                title="Cart"
              >
                <FontAwesomeIcon icon={faCartShopping} className="text-sm lg:text-base" />
                <h1 className="ml-1 font-medium text-xs lg:text-sm">{t("cart")}</h1>
              </div>

              {/* Wishlist */}
              <div
                className="text-white cursor-pointer flex items-center hover:text-gray-300 transition relative px-1.5 lg:px-2 py-1 rounded"
                onClick={() => navigate("/wishlist")}
                onMouseEnter={() => setWishlistHover(true)}
                onMouseLeave={() => setWishlistHover(false)}
                title="Wishlist"
              >
                <div className="relative flex items-center">
                  <FontAwesomeIcon
                    icon={faHeart}
                    className="text-red-500 font-bold text-sm lg:text-base"
                  />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white font-bold text-[8px] lg:text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-gray-900">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <h1 className="ml-1 font-medium text-xs lg:text-sm">{t("wishlist")}</h1>
              </div>

              {/* Dark/Light Mode Toggle */}
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-5 lg:h-6 w-10 lg:w-12 items-center rounded-full transition duration-200 ease-in-out ${isDarkMode ? "bg-gray-700 border border-gray-500" : "bg-gray-600"}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 lg:h-4 lg:w-4 transform rounded-full bg-white dark:bg-gray-800 transition-transform duration-200 ${isDarkMode ? "translate-x-5 lg:translate-x-7" : "translate-x-0.5 lg:translate-x-1"
                    }`}
                />
                <FontAwesomeIcon
                  icon={isDarkMode ? faMoon : faSun}
                  className={`absolute text-[10px] lg:text-xs ${isDarkMode ? "left-1 text-gray-300" : "right-1 text-yellow-400"
                    }`}
                />
              </button>
            </div>

            {/* Separate Profile / Sign In on Far Right with a subtle vertical divider */}
            <div className="pl-2 lg:pl-3 border-l border-gray-700 flex items-center">
              {user ? (
                <div ref={profRef} className="relative">
                  <div
                    className="flex items-center space-x-1.5 cursor-pointer hover:bg-gray-800 px-2 py-1 rounded transition"
                    onClick={() => setOpenProfile(!openProfile)}
                  >
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden border border-white flex-shrink-0">
                      <img
                        src={user?.photoURL ? user.photoURL : "/placeholder.png"}
                        alt={firstName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-white font-medium text-xs lg:text-sm truncate max-w-[70px] lg:max-w-[95px]">
                      {firstName}
                    </span>
                  </div>

                  {openProfile && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-2 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs lg:text-sm font-medium text-gray-900 dark:text-gray-100">
                          {t("hello")}, {firstName}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs lg:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      >
                        {t("logout")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/SignIn">
                  <div className="text-white cursor-pointer flex items-center hover:text-gray-300 transition px-2 py-1">
                    <FontAwesomeIcon icon={faUser} className="text-sm lg:text-base" />
                    <h1 className="ml-1.5 font-medium text-xs lg:text-sm">{t("signIn")}</h1>
                  </div>
                </Link>
              )}
            </div>

          </div>
        </div>
      </header>

      <section className="bg-orange-100 dark:bg-orange-900 border-b border-orange-200 dark:border-orange-800">
        <div className="mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-14 2xl:mx-20 px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 lg:py-2">
          <marquee
            behavior="scroll"
            direction="left"
            scrollamount="6"
            className="text-xs lg:text-sm xl:text-base text-gray-800 dark:text-gray-200 dark:text-orange-50"
          >
            {t("marqueeNotice")}
          </marquee>
        </div>
      </section>
    </>
  );
};

export default Header;
