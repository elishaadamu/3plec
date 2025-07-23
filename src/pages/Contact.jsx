// src/pages/Home.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/images/logo-3plec.png";
import Svg from "../assets/images/bg.svg";

const Contact = () => {
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center relative bg-gray-100  px-4"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-form-1 z-2 absolute">
        <img src={Svg} alt="Bg" />
      </div>
      <div className="bg-white my-8 z-10 p-8  rounded shadow-md w-full max-w-md">
        <div className=" my-5 mx-auto w-40 max-w-full">
          <NavLink
            exact="true"
            to="/"
            className="text-black font-bold text-4xl"
          >
            <img src={Logo} alt="Logo" />
          </NavLink>
        </div>
        <div>
          <h3 className="text-gray-500 mb-4 text-xl font-semibold">
            Welcome to 3PLEC
          </h3>
          <p className="mb-5 text-gray-500">Contact Us for enquries</p>
        </div>
        <form
          action="https://formspree.io/f/xgvkranr"
          method="POST"
          className="w-full"
        >
          <div className="relative mb-4"></div>
          <p className="mt-5 mb-3">
            <label htmlFor="Name" className="text-gray-500  text-[12px]  ">
              NAME
            </label>
          </p>

          <input
            type="text"
            className="pl-5 py-2 border border-gray-500 rounded w-full h-[50px]"
            placeholder="Name"
            required
            name="name"
            id="Name"
          />

          <p className="mt-5 mb-3">
            <label htmlFor="Email" className="text-gray-500  text-[12px]  ">
              EMAIL
            </label>
          </p>

          <input
            type="email"
            className="pl-5 py-2 border border-gray-500 rounded w-full h-[50px]"
            placeholder="Email Address"
            required
            name="email"
            id="Email"
          />

          <p className="mt-5 mb-3 flex justify-between items-center">
            <label htmlFor="message" className="text-gray-500  text-[12px]  ">
              MESSAGE
            </label>
          </p>
          <div className="relative">
            <textarea
              placeholder="Message Us"
              name="message"
              className="pl-5 py-2  border border-gray-500 rounded w-full h-[100px]"
              id="message"
            ></textarea>
          </div>

          <input
            type="submit"
            value="Send Message"
            className="submit bg-amber-600 h-[50px] text-white py-2 mt-5 rounded w-full cursor-pointer "
          />
        </form>
      </div>
      <div className="bg-form-2 absolute">
        <img src={Svg} alt="Bg" className="w-full" />
      </div>
    </motion.div>
  );
};

export default Contact;
