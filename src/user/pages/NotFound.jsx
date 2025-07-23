// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 text-center">
      <h1 className="text-8xl font-bold text-amber-600 mb-4">404</h1>
      <p className="text-2xl text-gray-700 mb-6">Page Not Found</p>
      <Link
        to="/dashboard"
        className="bg-amber-500 text-white px-6 py-2 rounded hover:bg-amber-600 transition"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
