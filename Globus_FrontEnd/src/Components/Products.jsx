import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faFire,
  faRocket,
  faAppleAlt,
  faMobile,
  faEye,
  faHeart,
  faShirt,
  faUtensils,
  faSpa,
  faBookOpen,
  faGamepad,
  faPlus,
  faMinus,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import AddToCartButton from "./AddToCartButton";

// Backend Api
const API_URL = import.meta.env.VITE_API_URL;
const CACHE_KEY = "globus_products_cache";
const CACHE_TIME_KEY = "globus_products_cache_time";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache TTL

const Products = ({ visibleSectionCount = 4 }) => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [visibleCountMap, setVisibleCountMap] = useState({});
  const navigate = useNavigate();

  // Optimized Fetch & Cache Strategy (0 unnecessary API requests)
  useEffect(() => {
    const processProductData = (data) => {
      if (!Array.isArray(data)) {
        console.warn("Expected array of products, got:", data);
        setProducts([]);
        setFeaturedProducts([]);
        setTopDeals([]);
        setLoading(false);
        return;
      }

      setProducts(data);

      // Featured products
      const featured = data
        .filter((product) => product && product.isFeatured)
        .slice(0, 4);
      setFeaturedProducts(featured);

      // Top deals
      const deals = data
        .filter((product) => product && product.discountPrice)
        .sort((a, b) => {
          const discountA = ((a.price - a.discountPrice) / a.price) * 100;
          const discountB = ((b.price - b.discountPrice) / b.price) * 100;
          return discountB - discountA;
        })
        .slice(0, 6);
      setTopDeals(deals);
      setLoading(false);
    };

    // Check Session Storage Cache
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      const cacheTime = sessionStorage.getItem(CACHE_TIME_KEY);

      if (cached && cacheTime && Date.now() - Number(cacheTime) < CACHE_TTL_MS) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          processProductData(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn("Session cache read warning:", e);
    }

    // Single Network Fetch when cache is empty or expired
    fetch(`${API_URL}/browseProduct`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
            sessionStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
          } catch (e) {
            console.warn("Session cache write warning:", e);
          }
          processProductData(data);
        } else {
          console.warn("Non-array response from browseProduct:", data);
          processProductData([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // Slider for featured products
  useEffect(() => {
    if (featuredProducts.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [featuredProducts.length]);

  // View detail button
  const handleViewDetail = (product) => {
    navigate("/productDetail", { state: { product } });
  };

  const nextSlide = () => {
    if (featuredProducts.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % featuredProducts.length);
    }
  };

  const prevSlide = () => {
    if (featuredProducts.length > 0) {
      setCurrentSlide(
        (prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length
      );
    }
  };

  // Filter products by category
  const getProductsByCategory = (category) => {
    if (!Array.isArray(products)) return [];
    return products.filter((product) => product && product.category === category);
  };

  const getNewArrivals = () => {
    if (!Array.isArray(products)) return [];
    return products;
  };

  const handleAddToWishlist = (e, product) => {
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
      if (!saved.some((item) => item._id === product._id)) {
        saved.push(product);
        localStorage.setItem("wishlist", JSON.stringify(saved));
        window.dispatchEvent(new Event("wishlist-updated"));
      }
      alert(`${product.name || "Product"} added to wishlist!`);
    } catch (err) {
      console.error("Wishlist save error:", err);
    }
  };

  const handleShowMore = (key, total) => {
    setVisibleCountMap((prev) => {
      const current = prev[key] || 12;
      const next = current + 12;
      return { ...prev, [key]: next >= total ? total : next };
    });
  };

  const handleShowLess = (key) => {
    setVisibleCountMap((prev) => {
      const current = prev[key] || 12;
      const next = current - 12;
      return { ...prev, [key]: next <= 12 ? 12 : next };
    });
  };

  // Original ProductCard
  const ProductCard = ({ product }) => (
    <div
      key={product._id}
      onClick={() => handleViewDetail(product)}
      className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 cursor-pointer flex flex-col h-full transition-all duration-300"
    >
      <div className="relative overflow-hidden rounded-t-xl">
        <img
          src={product.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"}
          alt={product.name}
          className="w-full h-36 sm:h-40 md:h-44 xl:h-48 object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80";
          }}
        />
        <button
          onClick={(e) => handleAddToWishlist(e, product)}
          className="absolute top-2 right-2 text-gray-300 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 drop-shadow-md hover:scale-110 transition-all z-10 p-1"
          title="Add to Wishlist"
        >
          <FontAwesomeIcon icon={faHeart} className="text-sm sm:text-base" />
        </button>
        {product.discountPrice && (
          <div
            className="absolute top-0 left-2.5 bg-[#e60000] text-white w-10 pt-1.5 pb-2 flex flex-col items-center justify-start z-10 drop-shadow-md rounded-t-md"
            style={{
              clipPath:
                "polygon(0 0, 100% 0, 100% 100%, 83% 85%, 66% 100%, 50% 85%, 33% 100%, 16% 85%, 0 100%)",
            }}
          >
            <span className="text-[11px] font-extrabold leading-none">
              {Math.round(
                ((product.price - product.discountPrice) / product.price) * 100
              )}
              %
            </span>
            <span className="text-[8px] font-bold leading-none mt-0.5">OFF</span>
          </div>
        )}
      </div>
      <div className="p-2.5 sm:p-3 xl:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-xs sm:text-sm leading-snug line-clamp-2 min-h-[32px] sm:min-h-[36px]">
            {product.name}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-[11px] sm:text-xs mt-0.5 min-h-[16px] truncate">
            {product.brand}
          </p>
        </div>

        <div className="flex items-end justify-between pt-2.5 sm:pt-3">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs sm:text-sm xl:text-base font-bold text-blue-600 dark:text-blue-400">
                ৳{product.discountPrice || product.price}
              </p>
              {product.discountPrice && (
                <p className="text-[10px] sm:text-xs text-gray-400 line-through">
                  ৳{product.price}
                </p>
              )}
            </div>
            {product.ratings && (
              <div className="flex items-center gap-1 mt-0.5">
                <FontAwesomeIcon
                  icon={faStar}
                  className="text-yellow-400 text-[10px] sm:text-xs"
                />
                <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-300">
                  {product.ratings.average}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 pb-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetail(product);
              }}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition"
              title="Details"
            >
              <FontAwesomeIcon icon={faEye} className="text-sm" />
            </button>
            <AddToCartButton
              product={product}
              showText={false}
              className="!bg-transparent !text-orange-500 !p-0 !m-0 hover:!text-orange-600 hover:!bg-transparent transition shadow-none text-base sm:text-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // All available store sections in order
  const allSections = [
    {
      title: "Top Deals",
      key: "top-deals",
      icon: faFire,
      products: topDeals,
      color: "text-red-600",
    },
    {
      title: "New Arrivals",
      key: "new-arrivals",
      icon: faRocket,
      products: getNewArrivals(),
      color: "text-green-600",
    },
    {
      title: "Vegetables & Fresh Foods",
      key: "fruits",
      icon: faAppleAlt,
      products: getProductsByCategory("Food"),
      color: "text-green-600",
    },
    {
      title: "Electronics",
      key: "electronics",
      icon: faMobile,
      products: getProductsByCategory("Electronics"),
      color: "text-blue-600",
    },
    {
      title: "Fashion",
      key: "fashion",
      icon: faShirt,
      products: getProductsByCategory("Fashion"),
      color: "text-purple-600",
    },
    {
      title: "Kitchen Utils",
      key: "kitchen",
      icon: faUtensils,
      products: getProductsByCategory("Kitchen Utils"),
      color: "text-amber-600",
    },
    {
      title: "Skin Care",
      key: "skincare",
      icon: faSpa,
      products: getProductsByCategory("Skin Care"),
      color: "text-rose-600",
    },
    {
      title: "Stationary",
      key: "stationary",
      icon: faBookOpen,
      products: getProductsByCategory("Stationary"),
      color: "text-indigo-600",
    },
    {
      title: "Toys",
      key: "toys",
      icon: faGamepad,
      products: getProductsByCategory("Toys"),
      color: "text-orange-600",
    },
  ];

  const renderedSections = allSections.slice(0, visibleSectionCount);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500 border-solid border-gray-200 dark:border-gray-700"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen space-y-8 md:space-y-12 xl:space-y-16 mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-14 2xl:mx-20 transition-colors duration-300">
      {/* Featured Products Carousel */}
      {featuredProducts.length > 0 && (
        <section className="relative">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 lg:gap-3 text-gray-900 dark:text-gray-100">
              <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
              Featured Products
            </h2>
            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="bg-gray-800 text-white p-2 rounded-lg hover:bg-black transition"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                className="bg-gray-800 text-white p-2 rounded-lg hover:bg-black transition"
              >
                ›
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-4 shadow-md dark:shadow-none border border-gray-200 dark:border-gray-700">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {featuredProducts.map((product) => (
                <div key={product._id} className="w-full flex-shrink-0">
                  <div className="flex flex-col md:flex-row items-center gap-4 lg:gap-6 p-2 sm:p-4">
                    <div className="flex-1 w-full">
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-full h-48 sm:h-56 md:h-64 lg:h-72 object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <h3 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base mb-3 lg:mb-4 line-clamp-3">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                        <p className="text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400">
                          ৳{product.discountPrice || product.price}
                        </p>
                        {product.discountPrice && (
                          <p className="text-base lg:text-xl text-gray-500 line-through">
                            ৳{product.price}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2.5 lg:gap-3">
                        <AddToCartButton
                          product={product}
                          className="px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-lg"
                        />
                        <button
                          onClick={() => handleViewDetail(product)}
                          className="bg-gray-800 text-white px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base rounded-lg hover:bg-black transition flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faEye} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {featuredProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? "bg-blue-600" : "bg-gray-300"
                    }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Sections (Up to Kitchen Utils on initial render) */}
      {renderedSections.map((section) => {
        const allSectionProducts = section.products;
        if (!allSectionProducts.length) return null;

        const limit = visibleCountMap[section.key] || 12;
        const displayed = section.key === "top-deals" ? allSectionProducts : allSectionProducts.slice(0, limit);
        const hasMore = allSectionProducts.length > limit;
        const canShowLess = limit > 12;

        return (
          <section key={section.key} className="mb-8 lg:mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center gap-2 lg:gap-3 text-gray-900 dark:text-gray-100">
                <FontAwesomeIcon icon={section.icon} className={section.color} />
                {section.title}
              </h2>
            </div>

            {section.key === "fruits" ? (
              <div className="flex flex-col">
                {/* Horizontal Promo Banner */}
                <div className="w-full h-36 sm:h-48 md:h-60 lg:h-72 overflow-hidden rounded-xl mb-4 lg:mb-6">
                  <img
                    src="/Images/Banner/food_banner.png"
                    alt="Vegetables & Fresh Foods Banner"
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1498837167386-84fae9f506b3?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />
                </div>

                {/* Product Grid (Green Theme) */}
                <div className="bg-gradient-to-br from-green-900 to-green-950 p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-[2rem] shadow-2xl relative overflow-hidden border border-green-800">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6 relative z-10">
                    {displayed.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </div>
              </div>
            ) : section.key === "electronics" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {/* 2-Row Side Promo Banner on Grid */}
                <div className="col-span-2 row-span-2 min-h-[380px] sm:min-h-[420px] lg:min-h-full relative overflow-hidden rounded-xl shadow-lg bg-gray-900 flex flex-col justify-end p-4 lg:p-5 border border-gray-200 dark:border-gray-700 group">
                  <img
                    src="/Images/Banner/electronics_banner.jpg"
                    alt="Electronics Banner"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src =
                        "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=800&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  <div className="relative z-10 w-full">
                    <span className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-yellow-400 bg-black/50 backdrop-blur-md px-2 py-0.5 lg:px-2.5 lg:py-1 rounded-md">
                      Featured Tech
                    </span>
                    <h3 className="text-lg lg:text-xl font-extrabold text-white mt-1.5 lg:mt-2 mb-1">
                      Latest Flagship Gadgets
                    </h3>
                    <p className="text-[11px] lg:text-xs text-gray-200 mb-2.5 lg:mb-3">
                      Smartphones, Laptops, Audio & Premium Drones
                    </p>
                    <div className="bg-white text-gray-900 font-bold py-2 lg:py-2.5 px-3 lg:px-4 rounded-xl text-center text-xs lg:text-sm shadow-md cursor-pointer hover:bg-gray-100 transition-all duration-300">
                      EXPLORE GADGETS
                    </div>
                  </div>
                </div>

                {/* Products */}
                {displayed.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
                {displayed.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Show More (+) and Show Less (-) buttons side-by-side per category */}
            {section.key !== "top-deals" && allSectionProducts.length > 12 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                {hasMore && (
                  <button
                    onClick={() => handleShowMore(section.key, allSectionProducts.length)}
                    className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold px-4 lg:px-5 py-2 text-xs lg:text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition flex items-center gap-2"
                    title="Show More Products"
                  >
                    <FontAwesomeIcon icon={faPlus} className="text-xs text-blue-600 dark:text-blue-400" />
                    <span>Show More ({allSectionProducts.length - limit} more)</span>
                  </button>
                )}

                {canShowLess && (
                  <button
                    onClick={() => handleShowLess(section.key)}
                    className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold px-4 lg:px-5 py-2 text-xs lg:text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition flex items-center gap-2"
                    title="Show Less Products"
                  >
                    <FontAwesomeIcon icon={faMinus} className="text-xs text-red-500" />
                    <span>Show Less</span>
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default Products;
