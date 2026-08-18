import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faEye, faSearch, faTag } from "@fortawesome/free-solid-svg-icons";
import AddToCartButton from "../Components/AddToCartButton";

const API_URL = import.meta.env.VITE_API_URL;

const SearchResults = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(!state?.searchResults);

  const urlQuery = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "All";

  const searchQuery = state?.searchQuery !== undefined ? state.searchQuery : urlQuery;
  const category = state?.category || urlCategory;

  useEffect(() => {
    if (!state?.searchResults) {
      fetch(`${API_URL}/browseProduct`)
        .then((res) => res.json())
        .then((data) => {
          setAllProducts(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching products:", err);
          setLoading(false);
        });
    }
  }, [state]);

  const matchField = (field, query) => {
    if (!field) return false;
    if (typeof field === "string") return field.toLowerCase().includes(query);
    if (Array.isArray(field)) {
      return field.some((item) => typeof item === "string" && item.toLowerCase().includes(query));
    }
    return String(field).toLowerCase().includes(query);
  };

  const searchResults = state?.searchResults || allProducts.filter((p) => {
    if (category !== "All" && p.category !== category) return false;
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      matchField(p.name, query) ||
      matchField(p.subCategory, query) ||
      matchField(p.brand, query) ||
      matchField(p.tags, query)
    );
  });

  const handleViewDetail = (product) => {
    navigate(`/productDetail/${product._id}`, { state: { product } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 lg:py-10 transition-colors duration-200">
      <div className="mx-2 sm:mx-4 md:mx-6 lg:mx-8 xl:mx-14 2xl:mx-20 px-2 sm:px-3 md:px-4 lg:px-6">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center gap-2.5 lg:gap-3 mb-2">
            <FontAwesomeIcon icon={faSearch} className="text-gray-600 dark:text-gray-300 text-lg lg:text-xl" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : `Browse: ${category}`}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <FontAwesomeIcon icon={faTag} />
            <span>Category: <span className="font-semibold text-gray-700 dark:text-gray-300">{category}</span></span>
            <span className="mx-1.5 sm:mx-2">·</span>
            <span>{searchResults.length} product{searchResults.length !== 1 ? "s" : ""} found</span>
          </div>
        </div>

        {/* Results Grid */}
        {searchResults.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
            <FontAwesomeIcon icon={faSearch} className="text-5xl lg:text-6xl mb-4 opacity-30" />
            <p className="text-lg sm:text-xl font-medium">No products found</p>
            <p className="text-xs sm:text-sm mt-1">Try a different search term or category</p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 bg-gray-800 dark:bg-gray-700 text-white px-5 py-2 text-sm rounded-lg hover:bg-black dark:hover:bg-gray-600 transition"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4 md:gap-5 lg:gap-6">
            {searchResults.map((product) => (
              <div
                key={product._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col justify-between"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-36 sm:h-44 md:h-48 object-cover rounded-t-xl"
                  />
                  {product.discountPrice && (
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold">
                      {Math.round(
                        ((product.price - product.discountPrice) / product.price) * 100
                      )}% OFF
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-xs sm:text-sm leading-tight line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                      {product.name}
                    </h3>
                    <p className="text-gray-400 dark:text-gray-500 text-[11px] sm:text-xs mt-1 truncate">{product.brand}</p>
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
                        <div className="flex items-center gap-1">
                          <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                          <span className="text-[11px] text-gray-600 dark:text-gray-400">{product.ratings.average}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center gap-2 mt-2">
                      <div className="flex-1">
                        <AddToCartButton product={product} />
                      </div>
                      <button
                        onClick={() => handleViewDetail(product)}
                        className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-2.5 py-2 rounded-lg transition flex items-center gap-1 text-xs"
                      >
                        <FontAwesomeIcon icon={faEye} />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
