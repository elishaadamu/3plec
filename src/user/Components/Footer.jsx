import React from "react";
import { NavLink } from "react-router-dom";

function Footer() {
  return (
    <div className=" ml-5 mt-auto">
      <p className="flex items-center gap-3">
        <span className="text-[16px] text-gray-400">© 2025,</span>{" "}
        <NavLink
          to="/"
          className="text-[16px] text-gray-500 hover:text-amber-600"
        >
          3PLEC
        </NavLink>
      </p>
    </div>
  );
}

export default Footer;
