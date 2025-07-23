// src/pages/Home.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../assets/images/logo-3plec.png";
import Svg from "../assets/images/bg.svg";
import { TbEye, TbEyeOff } from "react-icons/tb";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";

// Import config
import { config } from "../config/config.jsx";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    Firstname: "",
    Lastname: "",
    email: "",
    phone_num: "",
    NIN: "",
    password: "",
    terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [invalidFields, setInvalidFields] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setInvalidFields((prev) => ({ ...prev, [name]: false }));
  };

  // Validation for each step
  const validateStep1 = () => {
    const newInvalid = {};
    if (!form.Firstname) newInvalid.Firstname = true;
    if (!form.Lastname) newInvalid.Lastname = true;
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))
      newInvalid.email = true;
    setInvalidFields(newInvalid);
    return Object.keys(newInvalid).length === 0;
  };

  const validateStep2 = () => {
    const newInvalid = {};
    if (!form.phone_num || form.phone_num.length < 7)
      newInvalid.phone_num = true;
    if (!form.NIN || form.NIN.length < 8) newInvalid.NIN = true;
    if (!form.password || form.password.length < 8) newInvalid.password = true;
    if (!form.terms) newInvalid.terms = true;
    setInvalidFields(newInvalid);
    return Object.keys(newInvalid).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    setError("");
    if (validateStep1()) {
      setStep(2);
    } else {
      setError("Please correct the highlighted fields.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!validateStep2()) {
      setError("Please correct the highlighted fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${config.apiBaseUrl}${config.endpoints.register}`,
        {
          firstName: form.Firstname,
          lastName: form.Lastname,
          email: form.email,
          phone: form.phone_num,
          nin: form.NIN,
          password: form.password,
        }
      );
      setSuccess("Signup successful!");
      setForm({
        Firstname: "",
        Lastname: "",
        email: "",
        phone_num: "",
        NIN: "",
        password: "",
        terms: false,
      });
      setInvalidFields({});
      setStep(1);

      Swal.fire({
        icon: "success",
        title: "Signup Successful!",
        text: "You will be redirected to login.",
        timer: 2000,
        showConfirmButton: false,
      });

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      const message =
        err.response?.data?.message || "Signup failed. Please try again.";
      setError(message);
      setLoading(false);

      // Show toast if user exists
      if (message === "User already exists") {
        toast.error("User already exists. Please login.");
      }
    }
    setLoading(false);
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
          <p className="mb-5 text-gray-500">Create a new account</p>

          {error && (
            <div className="border border-red-400 bg-red-50 rounded p-5 text-red-500 text-sm mt-2 mb-4">
              {error}
              {error === "User already exists" && (
                <span>
                  {" "}
                  <NavLink
                    to="/login"
                    className="text-blue-400 underline font-bold"
                  >
                    Sign in
                  </NavLink>
                </span>
              )}
            </div>
          )}
        </div>
        <form
          onSubmit={step === 1 ? handleNext : handleSubmit}
          className="w-full"
        >
          {step === 1 && (
            <>
              <div className="relative mb-4">
                <p className="mb-3">
                  <label
                    htmlFor="Firstname"
                    className="text-gray-500  text-[13px] my-10 "
                  >
                    FIRST NAME
                  </label>
                </p>
                <input
                  type="text"
                  className={`pl-5 py-2 border rounded w-full h-[50px] ${
                    invalidFields.Firstname
                      ? "border-red-500"
                      : form.Firstname
                      ? "border-green-500"
                      : "border-gray-500"
                  }`}
                  placeholder="First Name"
                  required
                  name="Firstname"
                  id="Firstname"
                  value={form.Firstname}
                  onChange={handleChange}
                />
              </div>
              <p className=" mt-5 mb-3">
                <label
                  htmlFor="Lastname"
                  className="text-gray-500 text-[13px] "
                >
                  LAST NAME
                </label>
              </p>
              <input
                type="text"
                className={`pl-5 py-2 border rounded w-full h-[50px] ${
                  invalidFields.Lastname
                    ? "border-red-500"
                    : form.Lastname
                    ? "border-green-500"
                    : "border-gray-500"
                }`}
                placeholder="Last Name"
                required
                name="Lastname"
                id="Lastname"
                value={form.Lastname}
                onChange={handleChange}
              />
              <p className="mt-5 mb-3">
                <label
                  htmlFor="Email"
                  className="text-gray-500  text-[13px] my-10 "
                >
                  EMAIL
                </label>
              </p>
              <input
                type="email"
                className={`input validator pl-5 py-2 border rounded w-full h-[50px] ${
                  invalidFields.email
                    ? "border-red-500"
                    : form.email
                    ? "border-green-500"
                    : "border-gray-500"
                }`}
                placeholder="Email Address"
                required
                name="email"
                id="Email"
                value={form.email}
                onChange={handleChange}
              />
              <button
                type="submit"
                className="submit bg-amber-600 text-xl h-[50px] text-white py-2 mt-5 rounded w-full cursor-pointer flex items-center justify-center"
              >
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <p className="mt-5 mb-3">
                <label
                  htmlFor="Phone_Num"
                  className="text-gray-500  text-[13px] my-10 "
                >
                  PHONE NUMBER
                </label>
              </p>
              <input
                type="tel"
                className={`text-black pl-5 py-2 border rounded w-full h-[50px] ${
                  invalidFields.phone_num
                    ? "border-red-500"
                    : form.phone_num
                    ? "border-green-500"
                    : "border-gray-500"
                }`}
                placeholder="Phone Number"
                required
                name="phone_num"
                id="Phone_Num"
                value={form.phone_num}
                onChange={handleChange}
              />
              <p className="mt-5 mb-3">
                <label
                  htmlFor="NIN"
                  className="text-gray-500  text-[13px] my-10 "
                >
                  NIN NUMBER
                </label>
              </p>
              <input
                type="number"
                className={`pl-5 py-2 border rounded w-full h-[50px] ${
                  invalidFields.NIN
                    ? "border-red-500"
                    : form.NIN
                    ? "border-green-500"
                    : "border-gray-500"
                }`}
                placeholder="NIN Number"
                required
                name="NIN"
                id="NIN"
                value={form.NIN}
                onChange={handleChange}
              />
              <p className="mt-5 mb-3">
                <label
                  htmlFor="Password"
                  className="text-black   text-[13px] my-10 "
                >
                  PASSWORD
                </label>
              </p>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`pl-5 py-2 border  rounded w-full h-[50px] ${
                    invalidFields.password
                      ? "border-red-500"
                      : form.password
                      ? "border-green-500"
                      : "border-gray-500"
                  }`}
                  placeholder="Password"
                  required
                  name="password"
                  id="Password"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-4 cursor-pointer text-gray-500 "
                  tabIndex={-1}
                >
                  {showPassword ? <TbEyeOff size={20} /> : <TbEye size={20} />}
                </button>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  checked={form.terms}
                  onChange={handleChange}
                  className={`checkbox validator w-4 h-4 cursor-pointer ${
                    invalidFields.terms ? "border-red-500" : ""
                  }`}
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-700">
                  <a href="#" className="text-amber-600">
                    Accept terms and condition
                  </a>
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="submit bg-amber-600 text-xl h-[50px] text-white py-2 mt-5 rounded w-full cursor-pointer flex items-center justify-center"
              >
                {loading ? "Signing up..." : "Signup"}
              </button>
              <button
                type="button"
                className="mt-3 text-amber-600 underline"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </button>
            </>
          )}

          {success && (
            <div className="text-green-600 text-sm mt-2">
              {success}{" "}
              <NavLink
                to="/login"
                className="text-blue-400 underline font-bold"
              >
                Sign in
              </NavLink>
            </div>
          )}
        </form>
        <p className="mt-5 text-center">
          <span className="text-gray-400 text-[16px]">
            Already have an account?
          </span>{" "}
          <NavLink to="/login" className="text-amber-600 text-[16px] font-bold">
            Log In to your Account
          </NavLink>
        </p>
      </div>
      <div className="bg-form-2 absolute">
        <img src={Svg} alt="Bg" className="w-full" />
      </div>
      <ToastContainer />
    </motion.div>
  );
};

export default Signup;
