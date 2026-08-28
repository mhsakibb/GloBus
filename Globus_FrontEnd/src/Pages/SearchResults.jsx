import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStar,
  faEye,
  faSearch,
  faTag,
  faFire,
  faArrowLeft,
  faBagShopping,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";
import AddToCartButton from "../Components/AddToCartButton";

const API_URL = import.meta.env.VITE_API_URL;

const SearchResults = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const urlQuery = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "All";

  const searchQuery = state?.searchQuery !== undefined ? state.searchQuery : urlQuery;
  const category = state?.category || urlCategory;

  // Always fetch allProducts to support intelligent recommendations and fallback
  useEffect(() => {
    fetch(`${API_URL}/browseProduct`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        setAllProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  const matchField = (field, query) => {
    if (!field) return false;
    if (typeof field === "string") return field.toLowerCase().includes(query);
    if (Array.isArray(field)) {
      return field.some((item) => typeof item === "string" && item.toLowerCase().includes(query));
    }
    return String(field).toLowerCase().includes(query);
  };

  const searchResults = useMemo(() => {
    if (state?.searchResults && state.searchResults.length > 0) {
      return state.searchResults;
    }
    return allProducts.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase().trim();
      return (
        matchField(p.name, query) ||
        matchField(p.subCategory, query) ||
        matchField(p.brand, query) ||
        matchField(p.tags, query)
      );
    });
  }, [state, allProducts, category, searchQuery]);

  // Intelligent Recommended Products when 0 exact search results are found
  const recommendedProducts = useMemo(() => {
    if (searchResults.length > 0 || allProducts.length === 0) return [];

    const queryTokens = (searchQuery || "")
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 1);

    let related = [];

    // 1. Partial Category match
    if (category && category !== "All") {
      related = allProducts.filter((p) => p.category === category);
    }

    // 2. Token / keyword matches in name, tags, or brand
    if (related.length < 6 && queryTokens.length > 0) {
      const keywordMatches = allProducts.filter((p) => {
        if (related.some((r) => r._id === p._id)) return false;
        return queryTokens.some(
          (token) =>
            p.name?.toLowerCase().includes(token) ||
            p.category?.toLowerCase().includes(token) ||
            p.subCategory?.toLowerCase().includes(token) ||
            p.brand?.toLowerCase().includes(token) ||
            (Array.isArray(p.tags) && p.tags.some((t) => typeof t === "string" && t.toLowerCase().includes(token)))
        );
      });
      related = [...related, ...keywordMatches];
    }

    // 3. Fill remaining slots with high-rated / popular / discounted products
    if (related.length < 12) {
      const popular = [...allProducts]
        .filter((p) => !related.some((r) => r._id === p._id))
        .sort((a, b) => {
          const ratingA = a.ratings?.average || 0;
          const ratingB = b.ratings?.average || 0;
          if (ratingB !== ratingA) return ratingB - ratingA;
          return (b.discountPrice ? 1 : 0) - (a.discountPrice ? 1 : 0);
        });
      related = [...related, ...popular];
    }

    return related.slice(0, 12);
  }, [searchResults.length, allProducts, searchQuery, category]);

  const handleViewDetail = (product) => {
    navigate(`/productDetail/${product._id}`, { state: { product } });
  };

  const renderProductCard = (product) => (
    <div
      key={product._id}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col justify-between group overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gray-100 dark:bg-gray-700/50">
        <img
          src={product.images?.[0] || "/placeholder.png"}
          alt={product.name}
          className="w-full h-28 sm:h-32 md:h-36 xl:h-38 2xl:h-44 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";
          }}
        />
        {product.discountPrice && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-600 to-rose-500 text-white px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold shadow-sm">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-xs sm:text-sm leading-snug line-clamp-2 min-h-[32px] sm:min-h-[38px] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-400 dark:text-gray-500 text-[11px] sm:text-xs mt-1 truncate">
            {product.brand || product.category}
          </p>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-baseline gap-1.5">
              <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
                ৳{product.discountPrice || product.price}
              </p>
              {product.discountPrice && (
                <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 line-through">
                  ৳{product.price}
                </p>
              )}
            </div>
            {product.ratings && (
              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                <FontAwesomeIcon icon={faStar} className="text-amber-500 text-[10px]" />
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  {product.ratings.average || 5.0}
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center gap-2 mt-2">
            <div className="flex-1">
              <AddToCartButton product={product} />
            </div>
            <button
              onClick={() => handleViewDetail(product)}
              className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-2.5 py-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
            >
              <FontAwesomeIcon icon={faEye} />
              <span className="hidden sm:inline">Details</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 lg:py-10 transition-colors duration-200">
      <div className="mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-14 2xl:mx-20 px-2 sm:px-3 md:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2.5 lg:gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <FontAwesomeIcon icon={faSearch} className="text-base" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
              {searchQuery ? `Search Results for "${searchQuery}"` : `Browse: ${category}`}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <FontAwesomeIcon icon={faTag} className="text-gray-400" />
            <span>
              Category: <span className="font-semibold text-gray-700 dark:text-gray-300">{category}</span>
            </span>
            <span className="mx-1 sm:mx-2">·</span>
            <span>
              {searchResults.length} product{searchResults.length !== 1 ? "s" : ""} found
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Finding products...</p>
          </div>
        ) : searchResults.length > 0 ? (
          /* Main Search Results Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-6 gap-2.5 sm:gap-3 lg:gap-3.5">
            {searchResults.map((product) => renderProductCard(product))}
          </div>
        ) : (
          /* Empty Search Results + Recommendations Flow */
          <div className="space-y-10">
            {/* Empty State Banner */}
            <div className="bg-white dark:bg-gray-800/90 rounded-2xl border border-gray-200 dark:border-gray-700/80 p-8 sm:p-10 text-center max-w-2xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-500 flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faSearch} className="text-2xl" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                No direct matches found {searchQuery && <span>for "{searchQuery}"</span>}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                We couldn't find any exact products matching your search. Please check your spelling or explore our popular recommended products below!
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-sm hover:shadow cursor-pointer"
                >
                  <FontAwesomeIcon icon={faBagShopping} />
                  <span>Explore Home Page</span>
                </button>
              </div>
            </div>

            {/* Recommended Products Section */}
            {recommendedProducts.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700/80">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
                      <FontAwesomeIcon icon={faFire} className="text-base animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider">You May Also Like</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      Recommended Products
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Popular items and top-rated choices from our store
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 2xl:grid-cols-6 gap-2.5 sm:gap-3 lg:gap-3.5">
                  {recommendedProducts.map((product) => renderProductCard(product))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

