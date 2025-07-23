import "./style.css";
import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import NavBar from "./components/Nav";
import Backtotop from "./components/Backtotop";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Contact from "./pages/Contact";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
import Dashboard from "./user/dashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import ForgottenPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import InputOTP from "./pages/InputOTP";
import { BVNSlipProvider } from "./context/BVNSlipContext";

const App = () => {
  const location = useLocation();
  const showLayout =
    location.pathname === "/" || location.pathname === "/contact";
  const isDashboard = location.pathname.startsWith("/dashboard");

  // Loading spinner state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading (replace with actual loading logic if needed)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // 1.2 seconds, adjust as needed

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <svg
          className="animate-spin h-16 w-16 text-amber-500 drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 50 50"
        >
          <circle
            className="opacity-25"
            cx="25"
            cy="25"
            r="20"
            stroke="currentColor"
            strokeWidth="6"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M25 5a20 20 0 0 1 20 20h-6a14 14 0 0 0-14-14V5z"
          ></path>
        </svg>
      </div>
    );
  }

  return (
    <BVNSlipProvider>
      <div className="flex flex-col min-h-screen">
        {showLayout && <NavBar />}
        <div className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
              <Route
                path="/forgottenpassword"
                element={<ForgottenPassword />}
              />
              <Route path="/resetpassword" element={<ResetPassword />} />
              <Route path="/otp" element={<InputOTP />} />

              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
        {showLayout && <Footer />}
        {!isDashboard && <Backtotop />}
      </div>
    </BVNSlipProvider>
  );
};

export default App;
