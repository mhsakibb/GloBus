import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HeaderFooterWrap from "../Components/HeaderFooterWrap";
import ErrorBoundary from "../Components/ErrorBoundary";

// Code-Splitting: Lazy load all routes on-demand for maximum page speed & low bundle size
const Home = lazy(() => import("../Pages/Home"));
const SignIn = lazy(() => import("../Pages/SignIn"));
const SignUp = lazy(() => import("../Pages/SignUp"));
const Error = lazy(() => import("../Pages/Error"));
const ProductsDetail = lazy(() => import("../Pages/ProductsDetail"));
const Checkout = lazy(() => import("../Pages/Checkout"));
const SearchResults = lazy(() => import("../Pages/SearchResults"));
const Cart = lazy(() => import("../Pages/Cart"));
const OrderAndPayment = lazy(() => import("../Pages/OrderAndPayment"));
const Wishlist = lazy(() => import("../Pages/Wishlist"));

// Lazy load Admin panel pages
const AdminLayout = lazy(() => import("../Admin/AdminLayout"));
const AdminDashboard = lazy(() => import("../Admin/AdminDashboard"));
const AdminUser = lazy(() => import("../Admin/AdminUser"));
const AdminProducts = lazy(() => import("../Admin/AdminProducts"));
const AdminOrder = lazy(() => import("../Admin/AdminOrder"));
const PrivateRoute = lazy(() => import("../Admin/PrivateRoute"));

// Page Transition Skeleton / Loader
const RouteLoadingFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Loading GloBus...</span>
    </div>
  </div>
);

const AllRoutes = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          {/* Signin/Signup Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* General Storefront Routes */}
          <Route element={<HeaderFooterWrap />}>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/productDetail" element={<ProductsDetail />} />
            <Route path="/productDetail/:id" element={<ProductsDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orderHistory" element={<OrderAndPayment />} />
            <Route path="/search" element={<SearchResults />} />
          </Route>

          {/* Private Admin Routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute role="admin">
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrder />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="customers" element={<AdminUser />} />
          </Route>

          {/* 404 Catch-All Route */}
          <Route path="*" element={<Error />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};

export default AllRoutes;