import React from "react";
import "../assets/css/Footer.css";
import { NavLink } from "react-router-dom";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { MdOutlineMarkEmailRead } from "react-icons/md";
import Logo from "../assets/images/logo-3plec.png";

const Footer = () => {
  return (
    <footer>
      <div className="max-w-[1500px]  pl-10 md:pl-10  mx-auto flex justify-center flex-col md:flex-row  md:justify-between">
        <div className="flex-1/4">
          <h2 className="text-7xl font-bold">What We do</h2>
          <ul className="">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                NIN Verification
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                BVN Verification
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                CAC Verification
              </a>
            </li>
          </ul>
        </div>
        <div className="flex-[35%] mt-5 md:mt-0">
          <h2 className="text-7xl font-bold">What We do</h2>
          <ul className="">
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                Voters Card Verification
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                Driver Lincense Verification
              </a>
            </li>
            <li>
              <a href="#" target="_blank" rel="noopener noreferrer">
                International Passport Verification
              </a>
            </li>
          </ul>
        </div>
        <div className="flex-1/4 mt-5 md:mt-0">
          <h2 className="text-7xl font-bold">Quick Links</h2>
          <ul className="">
            <li>
              {" "}
              <NavLink className to="/">
                Home
              </NavLink>
            </li>

            <li>
              <NavLink to="/services">Services</NavLink>
            </li>
            <li>
              <NavLink to="/signup">Signup</NavLink>
            </li>
            <li>
              <NavLink to="/login">Login</NavLink>
            </li>
          </ul>
        </div>
        <div className="flex-[25%] mt-10 md:mt-0">
          <div>
            <NavLink exact="true" to="/">
              <img src={Logo} alt="Logo" className="nav-logo" />
            </NavLink>
          </div>
          <p className="text-gray-500 mt-5 mr-1">
            Trusted platform providing secure verification including Nin,Bvn and
            documents modification, Our mission is to offer reliable,fast, and
            accurate verification solutions to help you with your personal and
            business needs.
          </p>
          <div className="flex justify-start mt-5 items-center gap-1">
            <MdOutlineMarkEmailRead />
            <span>
              <a href="mailto:aycreativetechnology@gmail.com">
                aycreativetechnology@gmail.com
              </a>
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-center items-center">
        Social Media Links:
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
      </div>
      <hr className="my-10 border " />
      <p className="text-center text-gray-500">
        © 2025 @ AY Creative Technologies. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
