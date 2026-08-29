import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faTrash,
  faCartShopping,
  faArrowLeft,
  faEye,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const navigate = useNavigate();

  // Load wishlist from localStorage
  const loadWishlist = () => {
    try {
      const saved = localStorage.getItem("wishlist");
      if (saved) {
        setWishlistItems(JSON.parse(saved));
      } else {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error("Error loading wishlist:", error);
      setWishlistItems([]);
    }
  };

  useEffect(() => {
    loadWishlist();

    const handleWishlistUpdate = () => {
      loadWishlist();
    };

    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    return () => {
      window.removeEventListener("wishlist-updated", handleWishlistUpdate);
    };
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Safe image extraction utility matching OrderAndPayment theme
  const getImageUrl = (item) => {
    const extractUrl = (val) => {
      if (!val) return null;
      if (typeof val === "string") {
        const clean = val.trim();
        if (clean !== "" && clean !== "undefined" && clean !== "null" && !clean.includes("placeholder")) {
          return clean;
        }
        return null;
      }
      if (Array.isArray(val)) {
        for (const el of val) {
          const u = extractUrl(el);
          if (u) return u;
        }
      }
      return null;
    };

    const url =
      extractUrl(item?.image) ||
      extractUrl(item?.images) ||
      extractUrl(item?.productImage) ||
      extractUrl(item?.img) ||
      extractUrl(item?.photo);

    return url || "/Images/logo.png";
  };

  // Remove single item from wishlist
  const removeItem = (idOrProductId) => {
    const updated = wishlistItems.filter((item) => {
      const itemId = String(item._id || item.productId || item.id);
      return itemId !== String(idOrProductId);
    });
    setWishlistItems(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlist-updated"));
    showToast("Item removed from wishlist");
  };

  // Clear entire wishlist
  const clearWishlist = () => {
    setWishlistItems([]);
    localStorage.removeItem("wishlist");
    window.dispatchEvent(new Event("wishlist-updated"));
    showToast("Wishlist cleared");
  };

  // Move item to cart
  const moveToCart = (item) => {
    try {
      // Get existing cart
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      const targetId = String(item._id || item.productId || item.id);

      const existingIndex = savedCart.findIndex(
        (cartItem) => String(cartItem._id || cartItem.productId || cartItem.id) === targetId
      );

      if (existingIndex !== -1) {
        savedCart[existingIndex].quantity = (savedCart[existingIndex].quantity || 1) + 1;
      } else {
        savedCart.push({
          ...item,
          quantity: 1,
        });
      }

      localStorage.setItem("cart", JSON.stringify(savedCart));
      window.dispatchEvent(new Event("cart-updated"));

      // Also sync to backend if user is logged in
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.email && item._id) {
        const API_URL = import.meta.env.VITE_API_URL;
        fetch(`${API_URL}/cart/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userEmail: user.email,
            productId: item._id || item.productId,
            name: item.name || item.productName,
            price: item.price || item.discountPrice,
            discountPrice: item.discountPrice || item.price,
            image: getImageUrl(item),
            quantity: 1,
            variant: item.variant || {},
          }),
        }).catch((err) => console.error("Backend cart add error:", err));
      }

      // Remove from wishlist
      removeItem(targetId);
      showToast(`${item.name || item.productName || "Product"} moved to cart!`);
    } catch (error) {
      console.error("Error moving item to cart:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 to-blue-50 py-6 md:py-12 relative">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-24 right-6 bg-gray-900 text-white dark:bg-white dark:text-gray-900 px-3 md:px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 z-50 animate-fade-in-down border border-gray-700 dark:border-gray-300">
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 text-lg" />
          <span className="font-semibold text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FontAwesomeIcon icon={faHeart} className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-3">
            My Wishlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Keep your favorite products saved in one convenient place until you're ready to order.
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-12 text-center max-w-2xl mx-auto border border-gray-200 dark:border-gray-700 transition-all duration-300">
            <div className="w-28 h-28 bg-gradient-to-br from-red-100 to-pink-200 dark:from-red-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <FontAwesomeIcon
                icon={faHeart}
                className="text-red-500 text-5xl animate-pulse"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3">
              Your wishlist is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              You haven't saved any items yet. Explore our latest products and click the heart icon to save what you love!
            </p>
            <button
              onClick={() => navigate("/")}
              className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 md:px-8 py-3.5 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Explore Products
            </button>
          </div>
        ) : (
          /* Wishlist Grid Section */
          <div>
            {/* Top Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 mb-8 border border-gray-200 dark:border-gray-700 gap-4">
              <div className="flex items-center gap-3">
                <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 font-bold px-3 py-1 rounded-full text-sm">
                  {wishlistItems.length} {wishlistItems.length === 1 ? "Item" : "Items"}
                </span>
                <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">
                  Saved for later
                </span>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold text-sm flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Continue Shopping
                </button>
                <button
                  onClick={clearWishlist}
                  className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition font-semibold text-sm flex items-center gap-2"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Clear Wishlist
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item, index) => {
                const itemId = item._id || item.productId || item.id || index;
                const price = item.discountPrice || item.price || 0;
                const origPrice = item.discountPrice ? item.price : null;
                const isStocked = item.stock !== 0 && item.stock !== "0";

                return (
                  <div
                    key={itemId}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col justify-between transform hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {/* Image & Remove Btn */}
                    <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-900 h-56">
                      <img
                        src={getImageUrl(item)}
                        alt={item.name || item.productName || "Product"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = "/Images/logo.png";
                        }}
                      />
                      <button
                        onClick={() => removeItem(itemId)}
                        className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 rounded-full w-9 h-9 flex items-center justify-center shadow-md transition-all transform hover:scale-110"
                        title="Remove from wishlist"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {item.category && (
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-500 dark:text-orange-400 block mb-1">
                            {item.category}
                          </span>
                        )}
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 line-clamp-1 mb-2">
                          {item.name || item.productName || "Product"}
                        </h3>
                        {item.description && (
                          <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            ৳{Number(price).toFixed(2)}
                          </span>
                          {origPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              ৳{Number(origPrice).toFixed(2)}
                            </span>
                          )}
                        </div>

                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            isStocked
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={isStocked ? faCheckCircle : faTimesCircle}
                            className="text-xs"
                          />
                          {isStocked ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="bg-gray-50 dark:bg-gray-800/60 p-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
                      <button
                        onClick={() => navigate(`/productDetail/${itemId}`)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold text-sm flex items-center justify-center gap-2"
                      >
                        <FontAwesomeIcon icon={faEye} />
                        Details
                      </button>
                      <button
                        onClick={() => moveToCart(item)}
                        disabled={!isStocked}
                        className={`flex-1 px-4 py-2.5 rounded-xl transition font-semibold text-sm flex items-center justify-center gap-2 ${
                          isStocked
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg"
                            : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        <FontAwesomeIcon icon={faCartShopping} />
                        Move to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
