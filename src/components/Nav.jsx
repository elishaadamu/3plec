import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../assets/css/Navbar.css";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdClose } from "react-icons/io";
import { BsMoonStarsFill, BsSunFill } from "react-icons/bs"; // Optional icons for toggle
import Logo from "../assets/images/logo-3plec.png";

function NavBar() {
  const [click, setClick] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const handleClick = () => setClick(!click);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <>
      {/* <div className="flex flex-row justify-end max-w-[1500px] mx-auto bg-black gap-7 px-5 py-4">
        <a href="http://facebook.com" target="_blank" rel="noopener noreferrer">
          <FaFacebookF className="w-10" />
        </a>
        <a
          href="http://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaInstagram />
        </a>
      </div> */}
      <nav className="navbar">
        <div className="nav-container">
          <div>
            <NavLink exact="true" to="/">
              <img src={Logo} alt="Logo" className="nav-logo" />
            </NavLink>
          </div>

          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <NavLink
                exact="true"
                to="/"
                activeclassname="active"
                className="nav-links"
                onClick={handleClick}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact="true"
                to="/contact"
                activeclassname="active"
                className="nav-links"
                onClick={handleClick}
              >
                Contact Us
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact="true"
                to="/login"
                activeclassname="active"
                className="nav-links"
                onClick={handleClick}
              >
                Login
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                exact="true"
                to="/signup"
                activeclassname="active"
                className="nav-links"
                onClick={handleClick}
              >
                Signup
              </NavLink>
            </li>
          </ul>

          {/* Hamburger Menu */}
          <div className="nav-icon mt-[6px] " onClick={handleClick}>
            {click ? (
              <span className="icon">
                <IoMdClose />
              </span>
            ) : (
              <span className="icon">
                <RxHamburgerMenu />
              </span>
            )}
          </div>

          {/* Dark Mode Toggle */}
          <div
            className="dark-toggle mt-[0px] md:r- "
            onClick={toggleDarkMode}
            title="Toggle Dark Mode"
          >
            {darkMode ? (
              <BsSunFill size={20} />
            ) : (
              <BsMoonStarsFill color="white" size={20} />
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default NavBar;
