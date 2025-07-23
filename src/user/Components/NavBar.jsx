import React from "react";
import { NavLink } from "react-router-dom";
import Logo from "../assets/images/logo-3plec.png";

function NavBar() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div>
      {/* Toggle button for mobile */}
      <div className="md:hidden flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <NavLink to="/dashboard">
          <img
            src={Logo}
            alt="Logo"
            className="w-[120px] dark:invert-1 invert-0"
          />
        </NavLink>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-700 dark:text-gray-200 focus:outline-none"
        >
          {sidebarOpen ? (
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default NavBar;
