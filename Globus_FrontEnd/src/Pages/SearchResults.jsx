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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-8 py-10 transition-colors duration-200">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FontAwesomeIcon icon={faSearch} className="text-gray-600 dark:text-gray-300 text-xl" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : `Browse: ${category}`}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <FontAwesomeIcon icon={faTag} />
          <span>Category: <span className="font-semibold text-gray-700 dark:text-gray-300">{category}</span></span>
          <span className="mx-2">·</span>
          <span>{searchResults.length} product{searchResults.length !== 1 ? "s" : ""} found</span>
        </div>
      </div>

      {/* Results Grid */}
      {searchResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 dark:text-gray-500">
          <FontAwesomeIcon icon={faSearch} className="text-6xl mb-4 opacity-30" />
          <p className="text-xl font-medium">No products found</p>
          <p className="text-sm mt-1">Try a different search term or category</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 bg-gray-800 dark:bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-black dark:hover:bg-gray-600 transition"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {searchResults.map((product) => (
            <div
              key={product._id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={product.images?.[0] || "/placeholder.png"}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                {product.discountPrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                    {Math.round(
                      ((product.price - product.discountPrice) / product.price) * 100
                    )}% OFF
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-tight line-clamp-2 min-h-[40px]">
                  {product.name}
                </h3>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">{product.brand}</p>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                      ৳{product.discountPrice || product.price}
                    </p>
                    {product.discountPrice && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 line-through">
                        ৳{product.price}
                      </p>
                    )}
                  </div>
                  {product.ratings && (
                    <div className="flex items-center gap-1">
                      <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                      <span className="text-xs text-gray-600 dark:text-gray-400">{product.ratings.average}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between gap-2 mt-3">
                  <AddToCartButton product={product} />
                  <button
                    onClick={() => handleViewDetail(product)}
                    className="bg-gray-800 dark:bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-black dark:hover:bg-gray-600 transition flex items-center gap-1 text-sm"
                  >
                    <FontAwesomeIcon icon={faEye} />
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
