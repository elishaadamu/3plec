import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

// Import config
import { config } from "../config/config.jsx";

const InputOTP = ({ onSubmit }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false); // <-- Add loading state
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      navigate("/login");
    }
  }, [navigate]);

  const handleChange = (e, idx) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (!value) return;
    const newOtp = [...otp];
    newOtp[idx] = value[0];
    setOtp(newOtp);
    setInvalid(false);

    // Move to next input
    if (idx < 5 && value) {
      inputsRef.current[idx + 1].focus();
    }

    // If last digit is filled, trigger submit
    if (idx === 5 && value && newOtp.every((d) => d !== "")) {
      setTimeout(() => {
        document.getElementById("otp-form").requestSubmit();
      }, 100); // slight delay to ensure state updates
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        // Clear current
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      } else if (idx > 0) {
        // Move to previous
        inputsRef.current[idx - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (paste.length === 6) {
      setOtp(paste.split("").slice(0, 6));
      inputsRef.current[5].focus();
      setInvalid(false);
    }
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.join("").length !== 6) {
      setInvalid(true);
      toast.error("Please fill all 6 digits of the OTP.");
      return;
    }

    const email = localStorage.getItem("email");
    if (!email) {
      toast.error("No email found for verification.");
      return;
    }

    const formData = {
      email: email,
      code: otp.join(""),
    };

    setLoading(true); // Start loading

    try {
      const response = await axios.post(
        `${config.apiBaseUrl}${config.endpoints.verifyCode}`,
        formData,
        {
          withCredentials: true,
        }
      );

      // Just log the response
      console.log("Backend response:", response.data);

      toast.success("OTP verified! Redirecting...");
      setTimeout(() => {
        setLoading(false); // Stop loading before navigating
        navigate("/resetpassword");
      }, 1200);
    } catch (err) {
      setInvalid(true);
      setLoading(false); // Stop loading on error
      toast.error("Incorrect OTP or verification failed.");
      console.error(
        "OTP verification error:",
        err.response ? err.response.data : err.message
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <ToastContainer />
      <form
        id="otp-form"
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-8 max-w-sm w-full flex flex-col items-center"
      >
        <h2 className="text-2xl font-bold mb-2 text-amber-700">Enter OTP</h2>
        <p className="mb-6 text-gray-600 text-center">
          Please enter the 6-digit code sent to your email.
        </p>
        <div className="flex gap-2 mb-6">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputsRef.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              className={`w-12 h-12 text-center border rounded text-xl focus:outline-none transition
                ${
                  invalid && otp[idx] === ""
                    ? "border-red-500"
                    : "border-gray-300"
                }
                focus:border-amber-500`}
              value={digit}
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              onPaste={handlePaste}
              autoFocus={idx === 0}
              disabled={loading}
            />
          ))}
        </div>
        <button
          type="submit"
          className="cursor-pointer bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded transition w-full"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default InputOTP;
