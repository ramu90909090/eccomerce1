import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";

// Public Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import AboutUs from "./pages/user/AboutUs";
import ContactUs from "./pages/user/ContactUs";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Admin CMS & CRM Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AboutPageCms from "./pages/admin/AboutPageCms";
import ContactPageCms from "./pages/admin/ContactPageCms";
import ContactInquiries from "./pages/admin/ContactInquiries";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* 1. Admin Control Hub (With Left Sidebar Menu Layout) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="about-cms" element={<AboutPageCms />} />
              <Route path="contact-cms" element={<ContactPageCms />} />
              <Route path="contact-inquiries" element={<ContactInquiries />} />
             
            </Route>

            {/* 2. Public Storefront Layout */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
                  <Navbar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/payment" element={<Payment />} />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/contact" element={<ContactUs />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route
                        path="*"
                        element={
                          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
                            <h2 className="text-4xl font-black text-slate-800 mb-2">404</h2>
                            <p className="text-sm font-semibold text-slate-500">Page Not Found</p>
                          </div>
                        }
                      />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}