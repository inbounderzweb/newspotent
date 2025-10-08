import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home/Home";
import Shop from "../pages/Home/shop/Shop";
import ProductDetail from "../pages/Home/productdetail/ProductDetail"; // keep old page (if you still use it)
import CheckoutPage from "../pages/Home/checkout/CheckoutPage";
import ContactPage from "../pages/ContactPage/ContactPage";
import AboutUs from "../pages/AboutPage/AboutUs";
import AppLayout from "../Layout/AppLayout";
import UserProfile from "../pages/userprofile/UserProfile";
import OrderConfirmation from "../pages/OrderConfirmation";
import Orders from "../pages/userprofile/Orders";
import AddresList from "../pages/userprofile/AddresList";
import PaymentLanding from "../pages/Home/checkout/PaymentLanding";
import Quiz from "../pages/quiz/Quiz";
import AllStudents from "../components/students/AllStudents";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />} />
      <Route path="/shop" element={<Shop />} />

      {/* ✅ New shareable route that works anywhere */}
      <Route path="/product/:slugOrId" element={<ProductDetail />} />

      {/* Legacy route (kept for backward compatibility, can delete later) */}
      <Route path="/product-details" element={<ProductDetail />} />

      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/user-profile" element={<UserProfile />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/addresses" element={<AddresList />} />
      <Route path="/payment-landing" element={<PaymentLanding />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="/quizes" element={<Quiz />} />
      <Route path="/quiz-winners" element={<AllStudents />} />

    </Routes>
  );
};

export default AppRoutes;
