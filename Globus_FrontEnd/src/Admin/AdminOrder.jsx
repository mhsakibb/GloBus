import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faShoppingBag,
  faBox,
  faShippingFast,
  faCheckCircle,
  faClock,
  faTimesCircle,
  faEye,
  faSearch,
  faDownload,
  faUser,
  faEnvelope,
  faPhone,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

// Backend Api
const API_URL = import.meta.env.VITE_API_URL;

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/orders/all?limit=1000&t=${Date.now()}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      if (data.success) {
        if (data.data && Array.isArray(data.data.orders)) {
          setOrders(data.data.orders);
        } else if (Array.isArray(data.data)) {
          setOrders(data.data);
        } else if (Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          console.warn("Unexpected data structure:", data);
          setOrders([]);
        }
      } else {
        setError(data.message || "Failed to fetch orders");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError("Failed to load orders. Please try again.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // Remove Authorization header
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setOrders(
          orders.map((order) =>
            order._id === orderId
              ? { ...order, orderStatus: newStatus }
              : order,
          ),
        );
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
        }
      } else {
        throw new Error("Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return faClock;
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return faSort;
    return sortDirection === "asc" ? faSortUp : faSortDown;
  };

  const filteredOrders = (Array.isArray(orders) ? orders : [])
    .filter((order) => {
      const matchesSearch =
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingInfo?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.shippingInfo?.email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || order.orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "createdAt") {
        aValue = new Date(a.timestamps?.created || a.createdAt);
        bValue = new Date(b.timestamps?.created || b.createdAt);
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder,
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Safe statistics calculation
  const stats = {
    total: Array.isArray(orders) ? orders.length : 0,
    pending: Array.isArray(orders)
      ? orders.filter((o) => o.orderStatus === "pending").length
      : 0,
    processing: Array.isArray(orders)
      ? orders.filter((o) => o.orderStatus === "processing").length
      : 0,
    shipped: Array.isArray(orders)
      ? orders.filter((o) => o.orderStatus === "shipped").length
      : 0,
    delivered: Array.isArray(orders)
      ? orders.filter((o) => o.orderStatus === "delivered").length
      : 0,
    cancelled: Array.isArray(orders)
      ? orders.filter((o) => o.orderStatus === "cancelled").length
      : 0,
  };

  // Mock data
  const loadMockData = () => {
    const mockOrders = [
      {
        _id: "1",
        orderNumber: "ORD-001",
        orderStatus: "pending",
        shippingInfo: {
          fullName: "Kuddus Bayati",
          email: "bayati@example.com",
          phone: "+1234567890",
          address: "123 Main St",
          city: "Khulna",
          state: "NY",
          zipCode: "10001",
          country: "Bangladesh",
        },
        items: [
          {
            name: "Product 1",
            price: 29.99,
            quantity: 2,
            image: "/placeholder.png",
            variant: { color: "Red", size: "M" },
          },
        ],
        orderSummary: {
          itemsCount: 2,
          totalAmount: 59.98,
        },
        timestamps: {
          created: new Date().toISOString(),
        },
      },
      {
        _id: "2",
        orderNumber: "ORD-002",
        orderStatus: "processing",
        shippingInfo: {
          fullName: "Sokina Begum",
          email: "sokina@example.com",
          phone: "+0987654321",
          address: "456 Oak Ave",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90210",
          country: "USA",
        },
        items: [
          {
            name: "Product 2",
            price: 49.99,
            quantity: 1,
            image: "/placeholder.png",
            variant: { color: "Blue", size: "L" },
          },
        ],
        orderSummary: {
          itemsCount: 1,
          totalAmount: 49.99,
        },
        timestamps: {
          created: new Date(Date.now() - 86400000).toISOString(),
        },
      },
    ];
    setOrders(mockOrders);
    setLoading(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon
              icon={faTimesCircle}
              className="text-red-500 text-3xl"
            />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Error Loading Orders
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={fetchAllOrders}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={loadMockData}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Load Mock Data
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FontAwesomeIcon icon={faShoppingBag} className="text-indigo-500" />
              Order Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage, track, and update all customer orders from one place.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2">
              <FontAwesomeIcon icon={faDownload} /> Export
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, icon: faShoppingBag, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100 dark:bg-indigo-500/10' },
            { label: 'Pending', value: stats.pending, icon: faClock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-500/10' },
            { label: 'Processing', value: stats.processing, icon: faBox, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-500/10' },
            { label: 'Shipped', value: stats.shipped, icon: faShippingFast, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-500/10' },
            { label: 'Delivered', value: stats.delivered, icon: faCheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-500/10' },
            { label: 'Cancelled', value: stats.cancelled, icon: faTimesCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-100 dark:bg-rose-500/10' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800/60 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <FontAwesomeIcon icon={stat.icon} className={`text-sm ${stat.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search orders, customers, emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={fetchAllOrders}
                className="bg-slate-800 dark:bg-slate-700 text-white px-5 py-2.5 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors text-sm font-medium shadow-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800/60">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-indigo-500 transition-colors"
                    onClick={() => handleSort("orderNumber")}
                  >
                    <div className="flex items-center gap-2">
                      Order ID
                      <FontAwesomeIcon icon={getSortIcon("orderNumber")} className="opacity-50" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-indigo-500 transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      Date
                      <FontAwesomeIcon icon={getSortIcon("createdAt")} className="opacity-50" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800/60">
                {currentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        #{order.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-100 dark:border-indigo-800/30">
                          <FontAwesomeIcon icon={faUser} className="text-indigo-500" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            {order.shippingInfo?.fullName || "N/A"}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {order.shippingInfo?.email || "N/A"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {order.orderSummary?.itemsCount || 0} items
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        ৳{order.orderSummary?.totalAmount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {order.createdAt || order.timestamps?.created
                          ? new Date(order.createdAt || order.timestamps.created).toLocaleDateString()
                          : "N/A"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {order.createdAt || order.timestamps?.created
                          ? new Date(order.createdAt || order.timestamps.created).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                          : ""}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.orderStatus || "pending"}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border focus:ring-2 focus:ring-indigo-500/50 outline-none transition-colors cursor-pointer
                          ${order.orderStatus === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800/30' : ''}
                          ${order.orderStatus === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800/30' : ''}
                          ${order.orderStatus === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-800/30' : ''}
                          ${order.orderStatus === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-800/30' : ''}
                          ${order.orderStatus === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800/30' : ''}
                        `}
                      >
                        <option value="pending" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Pending</option>
                        <option value="processing" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Processing</option>
                        <option value="shipped" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Shipped</option>
                        <option value="delivered" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Delivered</option>
                        <option value="cancelled" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          title="View Details"
                          className="p-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-colors"
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </button>
                        <button 
                          title="Download Invoice"
                          className="p-2 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-colors"
                        >
                          <FontAwesomeIcon icon={faDownload} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {currentOrders.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faBox} className="text-slate-300 dark:text-slate-600 text-3xl" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                No orders found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                {searchTerm || statusFilter !== "all"
                  ? "We couldn't find any orders matching your current search or filters. Try adjusting them."
                  : "You don't have any orders yet. Once customers place orders, they will appear here."}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium px-5 py-2.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstOrder + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastOrder, filteredOrders.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{filteredOrders.length}</span>{" "}
                  results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Order #{selectedOrder.orderNumber}
                  </h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FontAwesomeIcon
                      icon={faTimesCircle}
                      className="text-2xl"
                    />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Items */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4">Order Items</h4>
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={item.image || "/placeholder.png"}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">
                              {item.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity}
                            </p>
                            {item.variant && (
                              <p className="text-sm text-gray-600">
                                {item.variant.color} • {item.variant.size}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ৳
                              {(
                                (item.price || 0) * (item.quantity || 0)
                              ).toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-600">
                              ৳{item.price} each
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-6">
                    {/* Shipping Info */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3">
                        Shipping Information
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="font-medium">
                          {selectedOrder.shippingInfo?.fullName || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          {selectedOrder.shippingInfo?.address || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          {selectedOrder.shippingInfo?.city || "N/A"},{" "}
                          {selectedOrder.shippingInfo?.state || "N/A"}{" "}
                          {selectedOrder.shippingInfo?.zipCode || "N/A"}
                        </p>
                        <p className="text-gray-600">
                          {selectedOrder.shippingInfo?.country || "N/A"}
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <FontAwesomeIcon icon={faPhone} />
                            {selectedOrder.shippingInfo?.phone || "N/A"}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <FontAwesomeIcon icon={faEnvelope} />
                            {selectedOrder.shippingInfo?.email || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3">
                        Order Summary
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>
                            ৳{selectedOrder.orderSummary?.totalAmount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>৳0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>৳0.00</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total:</span>
                          <span>
                            ৳{selectedOrder.orderSummary?.totalAmount || 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Order Status */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3">
                        Order Status
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <select
                          value={selectedOrder.orderStatus || "pending"}
                          onChange={(e) =>
                            updateOrderStatus(selectedOrder._id, e.target.value)
                          }
                          className={`w-full text-sm font-medium px-3 py-2 rounded-lg border ${getStatusColor(selectedOrder.orderStatus)} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrder;
