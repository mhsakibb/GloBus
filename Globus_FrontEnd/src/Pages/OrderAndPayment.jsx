import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faBox,
  faShippingFast,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faUndo,
  faReceipt,
  faEye,
  faDownload,
  faStar,
  faCalendarAlt,
  faMoneyBillWave,
  faCreditCard,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { generateInvoicePDF } from "../utils/generateInvoicePDF";

// Backend Api
const API_URL = import.meta.env.VITE_API_URL;

const OrderAndPayment = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/signin", { replace: true });
      return;
    }
    fetchUserOrders();
    fetchAllProducts();
  }, [navigate]);

  const fetchAllProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/browseProduct`);
      if (res.ok) {
        const data = await res.json();
        setAllProducts(data);
      }
    } catch (err) {
      console.error("Error fetching all products:", err);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        navigate("/signin", { replace: true });
        return;
      }

      const response = await fetch(
        `${API_URL}/api/orders?userEmail=${user.email}`,
      );
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "processing":
        return faClock;
      case "shipped":
        return faShippingFast;
      case "delivered":
        return faCheckCircle;
      case "cancelled":
        return faTimesCircle;
      default:
        return faBox;
    }
  };

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

  // Improved image URL getter function
  const getImageUrl = (item) => {
    // 1. Check direct item properties first
    const directUrl = 
      extractUrl(item?.image) ||
      extractUrl(item?.images) ||
      extractUrl(item?.productImage) ||
      extractUrl(item?.img) ||
      extractUrl(item?.photo) ||
      extractUrl(item?.picture);
    
    if (directUrl) return directUrl;

    // 2. Lookup in allProducts if direct property is missing or invalid
    if (allProducts && allProducts.length > 0) {
      // 2a. By ID
      const targetId = item?.productId || item?._id || item?.id;
      if (targetId) {
        const foundById = allProducts.find((p) => 
          String(p._id) === String(targetId) || String(p.id) === String(targetId) || p._id === targetId
        );
        if (foundById) {
          const foundUrl = extractUrl(foundById.images) || extractUrl(foundById.image) || extractUrl(foundById.img);
          if (foundUrl) return foundUrl;
        }
      }

      // 2b. Exact or Substring Name
      const targetName = (item?.name || item?.productName || item?.title || "").trim().toLowerCase();
      if (targetName) {
        const foundByName = allProducts.find((p) => {
          const pName = (p.name || p.productName || p.title || "").trim().toLowerCase();
          return pName && (pName === targetName || pName.includes(targetName) || targetName.includes(pName));
        });
        if (foundByName) {
          const foundUrl = extractUrl(foundByName.images) || extractUrl(foundByName.image) || extractUrl(foundByName.img);
          if (foundUrl) return foundUrl;
        }

        // 2c. Token / Keyword fuzzy matching
        const tokens = targetName
          .replace(/[^\w\s]/g, "")
          .split(/\s+/)
          .filter((w) => w.length > 2 && !["the", "and", "for", "with", "item", "product"].includes(w));
        
        if (tokens.length > 0) {
          let bestMatch = null;
          let maxScore = 0;
          for (const p of allProducts) {
            const pName = (p.name || p.productName || p.title || "").toLowerCase();
            let score = 0;
            for (const t of tokens) {
              if (pName.includes(t)) score++;
            }
            if (score > maxScore) {
              maxScore = score;
              bestMatch = p;
            }
          }
          if (bestMatch && maxScore >= 1) {
            const foundUrl = extractUrl(bestMatch.images) || extractUrl(bestMatch.image) || extractUrl(bestMatch.img);
            if (foundUrl) return foundUrl;
          }
        }
      }
    }

    return "/Images/logo.png";
  };

  // Improved product name getter function
  const getProductName = (item) => {
    return item.name || item.productName || "Product";
  };

  const handleStartShopping = () => {
    navigate("/products");
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    console.log("View details for order:", order);
  };

  const handleDownloadInvoice = (order) => {
    try {
      generateInvoicePDF(order);
    } catch (err) {
      console.error("Error generating PDF invoice:", err);
      alert("Failed to generate PDF invoice. Please try again.");
    }
  };

  const handleRateReview = (order) => {
    console.log("Rate and review order:", order);
  };

  const handleTrackOrder = (order) => {
    console.log("Track order:", order);
  };

  const handleNeedHelp = (order) => {
    console.log("Need help with order:", order);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.orderStatus === activeTab;
  });

  const stats = {
    total: orders.length,
    processing: orders.filter((o) => o.orderStatus === "processing").length,
    shipped: orders.filter((o) => o.orderStatus === "shipped").length,
    delivered: orders.filter((o) => o.orderStatus === "delivered").length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 dark:from-gray-900 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon
              icon={faShoppingBag}
              className="text-white text-3xl"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Order History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Track your orders, view order details, and manage your purchases all
            in one place.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Total Orders
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {stats.total}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faShoppingBag}
                className="text-blue-500 text-2xl"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Processing
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {stats.processing}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faClock}
                className="text-yellow-500 text-2xl"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Shipped
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {stats.shipped}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faShippingFast}
                className="text-purple-500 text-2xl"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Delivered
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {stats.delivered}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faCheckCircle}
                className="text-green-500 text-2xl"
              />
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-orange-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("processing")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "processing"
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
              }`}
            >
              Processing ({stats.processing})
            </button>
            <button
              onClick={() => setActiveTab("shipped")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "shipped"
                  ? "bg-purple-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
              }`}
            >
              Shipped ({stats.shipped})
            </button>
            <button
              onClick={() => setActiveTab("delivered")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "delivered"
                  ? "bg-green-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
              }`}
            >
              Delivered ({stats.delivered})
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FontAwesomeIcon
                  icon={faBox}
                  className="text-gray-400 text-3xl"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                No orders found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You haven't placed any orders yet.
              </p>
              <button
                onClick={handleStartShopping}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-semibold"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-gray-50 dark:from-gray-900 to-blue-50 p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                        Order #{order.orderNumber}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.orderStatus)}`}
                        >
                          <FontAwesomeIcon
                            icon={getStatusIcon(order.orderStatus)}
                            className="mr-2"
                          />
                          {order.orderStatus?.charAt(0).toUpperCase() +
                            order.orderStatus?.slice(1)}
                        </span>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <FontAwesomeIcon icon={faCalendarAlt} />
                        Ordered on{" "}
                        {new Date(order.timestamps?.created).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                        ৳{order.orderSummary?.totalAmount}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {order.orderSummary?.itemsCount} items
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Products */}
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                        <FontAwesomeIcon
                          icon={faBox}
                          className="text-blue-500"
                        />
                        Order Items
                      </h4>
                      <div className="space-y-4">
                        {order.items?.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 dark:bg-gray-900 rounded-xl"
                          >
                            <img
                              src={getImageUrl(item)}
                              alt={getProductName(item)}
                              className="w-16 h-16 object-cover rounded-lg bg-white border border-gray-200 dark:border-gray-700"
                              onError={(e) => {
                                e.target.src = "/Images/logo.png";
                              }}
                            />
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-800 dark:text-gray-200">
                                {getProductName(item)}
                              </h5>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Qty: {item.quantity}
                              </p>
                              {item.variant && (
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                  {item.variant.color} • {item.variant.size}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800 dark:text-gray-200">
                                ৳{(item.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                ৳{item.price} each
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Shipping & Actions */}
                    <div>
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                          <FontAwesomeIcon
                            icon={faMapMarkerAlt}
                            className="text-green-500"
                          />
                          Shipping Address
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-800 dark:bg-gray-900 rounded-xl p-4">
                          <p className="font-semibold">
                            {order.shippingInfo?.fullName}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {order.shippingInfo?.address}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {order.shippingInfo?.city},{" "}
                            {order.shippingInfo?.state}{" "}
                            {order.shippingInfo?.zipCode}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {order.shippingInfo?.country}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                              <FontAwesomeIcon icon={faPhone} />
                              {order.shippingInfo?.phone}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
                              <FontAwesomeIcon icon={faEnvelope} />
                              {order.shippingInfo?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="flex-1 bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faEye} />
                          View Details
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                        >
                          <FontAwesomeIcon icon={faReceipt} />
                          Invoice
                        </button>
                        {order.orderStatus === "delivered" && (
                          <button
                            onClick={() => handleRateReview(order)}
                            className="flex-1 bg-orange-500 text-white px-4 py-3 rounded-xl hover:bg-orange-600 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                          >
                            <FontAwesomeIcon icon={faStar} />
                            Rate & Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Footer */}
                <div className="bg-gray-50 dark:bg-gray-800 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faCreditCard} />
                        Paid with SSL Commerz
                      </span>
                      <span className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faMoneyBillWave} />
                        Total: ৳{order.orderSummary?.totalAmount}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleTrackOrder(order)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:border-gray-400 transition-all duration-300 font-semibold text-sm"
                      >
                        Track Order
                      </button>
                      <button
                        onClick={() => handleNeedHelp(order)}
                        className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-black transition-all duration-300 font-semibold text-sm"
                      >
                        Need Help?
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 rounded-t-3xl">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    Order #{selectedOrder.orderNumber || String(selectedOrder._id).slice(-8).toUpperCase()}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        selectedOrder.orderStatus
                      )}`}
                    >
                      {selectedOrder.orderStatus?.charAt(0).toUpperCase() +
                        selectedOrder.orderStatus?.slice(1)}
                    </span>
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Placed on{" "}
                    {new Date(
                      selectedOrder.timestamps?.created ||
                        selectedOrder.createdAt ||
                        Date.now()
                    ).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faTimesCircle} className="text-xl" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Items */}
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faBox} className="text-orange-500" />
                    Items Ordered ({selectedOrder.items?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-800"
                      >
                        <img
                          src={getImageUrl(item)}
                          alt={getProductName(item)}
                          className="w-14 h-14 object-cover rounded-xl border border-gray-200 dark:border-gray-700 bg-white"
                          onError={(e) => {
                            e.target.src = "/Images/logo.png";
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {getProductName(item)}
                          </h5>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Quantity: {item.quantity || 1}
                            {item.variant &&
                              ` • ${
                                typeof item.variant === "string"
                                  ? item.variant
                                  : [item.variant.color, item.variant.size]
                                      .filter(Boolean)
                                      .join(", ")
                              }`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800 dark:text-gray-200">
                            ৳{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ৳{item.price} each
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Payment Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <h5 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm">
                      <FontAwesomeIcon
                        icon={faMapMarkerAlt}
                        className="text-green-500"
                      />
                      Shipping Address
                    </h5>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                      {selectedOrder.shippingInfo?.fullName || "N/A"}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {selectedOrder.shippingInfo?.address}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {[
                        selectedOrder.shippingInfo?.city,
                        selectedOrder.shippingInfo?.state,
                        selectedOrder.shippingInfo?.zipCode,
                        selectedOrder.shippingInfo?.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Phone: {selectedOrder.shippingInfo?.phone || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <h5 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm">
                      <FontAwesomeIcon
                        icon={faReceipt}
                        className="text-blue-500"
                      />
                      Summary & Payment
                    </h5>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Subtotal:</span>
                      <span>৳{selectedOrder.orderSummary?.subtotal || selectedOrder.orderSummary?.totalAmount}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Shipping:</span>
                      <span>
                        {selectedOrder.orderSummary?.shipping
                          ? `৳${selectedOrder.orderSummary.shipping}`
                          : "FREE"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700 pt-2">
                      <span>Total Amount:</span>
                      <span className="text-orange-500">
                        ৳{selectedOrder.orderSummary?.totalAmount}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 pt-1">
                      Payment Method: {selectedOrder.paymentMethod || "SSL Commerz"}
                    </div>
                  </div>
                </div>

                {/* Download PDF Action in Modal */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => handleDownloadInvoice(selectedOrder)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <FontAwesomeIcon icon={faFilePdf} className="text-lg" />
                    Download PDF Invoice
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-6 py-3.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderAndPayment;
