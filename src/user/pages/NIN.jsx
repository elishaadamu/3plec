import React, { useState, useEffect } from "react";
import BasicImg from "../assets/images/information.png";
import RegularImg from "../assets/images/regular.png";
import StandardImg from "../assets/images/standard.png";
import PremiumImg from "../assets/images/premium.png";
import { MdOutlineSendToMobile } from "react-icons/md";
import {
  AiOutlineLoading3Quarters,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai"; // Add this import
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { config } from "../../config/config.jsx";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";

function NIN() {
  const navigate = useNavigate();

  /* ---------------------------------- data --------------------------------- */
  const cardVerify = [
    { label: "NIN", value: "nin" },
    { label: "VNIN", value: "vnin" },
  ];

  // Add new state for API prices
  const [AgentPrices, setAgentPrices] = useState(null);

  // Add useEffect to fetch prices when component mounts
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get(
          `${config.apiBaseUrl}${config.endpoints.currentapipricing}`,
          { withCredentials: true }
        );
        console.log("API Prices Response:", response.data);
        // Find NIN pricing
        const ninPricing = response.data.find(
          (item) => item.serviceKey === "nin"
        );
        if (ninPricing) {
          // Update cardSlip with new prices
          const updatedCardSlip = cardSlip.map((slip) => ({
            ...slip,
            price: ninPricing.agentPrice,
          }));

          setAgentPrices(updatedCardSlip);
        }
      } catch (error) {
        console.error("Error fetching API prices:", error);
        toast.error("Failed to fetch current prices");
      }
    };

    fetchPrices();
  }, []);

  const cardSlip = [
    {
      label: "Information Slip",
      value: "Basic",
      image: BasicImg,
      price: AgentPrices?.find((p) => p.value === "Basic")?.price || 200,
    },
    {
      label: "Regular Slip",
      value: "Regular",
      image: RegularImg,
      price: AgentPrices?.find((p) => p.value === "Regular")?.price || 200,
    },
    {
      label: "Standard Slip",
      value: "Standard",
      image: StandardImg,
      price: AgentPrices?.find((p) => p.value === "Standard")?.price || 200,
    },
    {
      label: "Premium Slip",
      value: "Premium",
      image: PremiumImg,
      price: AgentPrices?.find((p) => p.value === "Premium")?.price || 300,
    },
  ];

  /* ---------------------------- component state ---------------------------- */
  const [selectedVerify, setSelectedVerify] = useState(""); // unselected by default
  const [selectedSlip, setSelectedSlip] = useState(""); // unselected by default
  const [formData, setFormData] = useState({
    nin: "",
    pin: "", // Add PIN to formData
  });
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [showPin, setShowPin] = useState(false); // Add state for PIN visibility

  // Add your secret key for decryption
  const SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY;

  function decryptData(ciphertext) {
    if (!ciphertext) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  /* --------------------------------- render -------------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVerify || !selectedSlip) {
      toast.error("Please select both verification type and slip layout");
      return;
    }

    if (!formData.pin || formData.pin.length !== 4) {
      toast.error("Please enter a valid 4-digit PIN");
      return;
    }

    // Find the selected slip's price from the updated prices
    const selectedSlipObj =
      AgentPrices?.find((s) => s.value === selectedSlip) ||
      cardSlip.find((s) => s.value === selectedSlip);
    const slipAmount = selectedSlipObj ? selectedSlipObj.price : 0;

    // Show confirmation dialog
    const result = await Swal.fire({
      title: "Confirm Verification",
      text: `Are you sure you want to proceed with this verification? ${
        slipAmount > 0 ? `Amount: ₦${slipAmount}` : ""
      }`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, verify",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    // Get userId from encrypted localStorage
    let userId = null;
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = decryptData(userStr);
        userId = userObj?._id || userObj?.id;
      }
    } catch {}

    setLoading(true);
    const payload = {
      verifyWith: selectedVerify,
      slipLayout: selectedSlip,
      nin: formData.nin,
      amount: slipAmount,
      userId,
      pin: formData.pin,
    };
    console.log("Payload for verification:", payload);
    try {
      const response = await axios.post(
        `${config.apiBaseUrl}${config.endpoints.NINVerify}`,
        payload,
        {
          withCredentials: true,
        }
      );

      setVerificationResult(response.data);

      // Show success alert
      await Swal.fire({
        title: "Verification Successful!",
        text: "Your NIN has been successfully verified.",
        icon: "success",
        confirmButtonColor: "#f59e0b",
      });

      toast.success("NIN verified successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      const ninData = response.data?.data?.nin_data;
      if (ninData) {
        navigate("/dashboard/verifications/ninslip", {
          state: { userData: ninData },
        });
      } else {
        toast.error("Verification succeeded but no NIN data returned.");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-full rounded-2xl mb-10 bg-white p-5 shadow-lg">
      <p className="text-[18px] text-gray-500">NIN Verification</p>
      <form onSubmit={handleSubmit}>
        {/* ------------------------------- Step #1 ------------------------------- */}
        <p className="mt-7 text-[14px] text-gray-500">1. Verify With</p>
        <hr className="my-5 border-gray-200" />

        <div className="grid gap-6 p-4 sm:grid-cols-2 md:grid-cols-2">
          {cardVerify.map(({ label, value }) => (
            <label
              key={value}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-6 text-center transition
      ${
        selectedVerify === value
          ? "border-amber-400 ring-2 ring-amber-300 shadow-lg"
          : "border-gray-200 shadow-md hover:shadow-lg"
      }`}
            >
              <input
                type="radio"
                name="verifyWith"
                value={value}
                checked={selectedVerify === value}
                onChange={() => setSelectedVerify(value)}
                className="sr-only" // Change from hidden to sr-only
                aria-label={`Select ${label}`} // Add aria-label for accessibility
                tabIndex={0} // Make it focusable
              />

              <h3 className="mb-4 text-lg font-semibold text-gray-600">
                {label}
              </h3>

              {/* visual radio indicator */}
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  selectedVerify === value
                    ? "border-amber-400"
                    : "border-gray-300"
                }`}
              >
                {selectedVerify === value && (
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                )}
              </span>
            </label>
          ))}
        </div>

        {/* ------------------------------- Step #2 ------------------------------- */}
        <p className="mt-7 text-[14px] text-gray-500">2. Slip Layout</p>
        <hr className="my-5 border-gray-200" />

        <div className="grid gap-6 p-4 sm:grid-cols-2 md:grid-cols-3">
          {cardSlip.map(({ label, value, image, price }) => (
            <label
              key={value}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-6 text-center transition
            ${
              selectedSlip === value
                ? "border-amber-400 ring-2 ring-amber-300 shadow-lg"
                : "border-gray-200 shadow-md hover:shadow-lg"
            }`}
            >
              <input
                type="radio"
                name="slipLayout"
                value={value}
                checked={selectedSlip === value}
                onChange={() => setSelectedSlip(value)}
                className="hidden"
                required
              />

              {/* price */}
              <p className="mb-4 text-3xl font-bold tracking-wide text-slate-700">
                ₦{price}.00
              </p>

              {/* preview image */}
              <img
                src={image}
                alt={label}
                loading="lazy"
                className="mb-4 h-24 w-full object-contain"
              />

              {/* label */}
              <h4 className="mb-4 text-base font-semibold text-gray-600">
                {label}
              </h4>

              {/* visual radio indicator */}
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                  selectedSlip === value
                    ? "border-amber-400"
                    : "border-gray-300"
                }`}
              >
                {selectedSlip === value && (
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                )}
              </span>
            </label>
          ))}
        </div>
        {/* ------------------------------- Step #3 ------------------------------- */}
        <div>
          <p className="mt-7 text-[14px] text-gray-500">3. Supply ID Number</p>
          <hr className="my-7 border-gray-200" />
          <input
            type="text"
            className="pl-5 py-2 border border-gray-200 focus:border-gray-200 rounded w-full h-[50px]"
            placeholder="NIN NUMBER"
            required
            name="nin"
            value={formData.nin}
            onChange={handleInputChange}
            inputMode="numeric" // Fixed from inputmode
            maxLength="11" // Fixed from maxlength
            pattern="\d{11}"
            autoComplete="off"
            title="NIN must be exactly 11 digits"
          />

          {/* Add this after the NIN input */}
          <div className="mt-4">
            <p className="mt-7 text-[14px] text-gray-500">
              4. Enter your Transaction PIN
            </p>
            <hr className="my-7 border-gray-200" />
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                className="pl-5 py-2 border border-gray-200 focus:border-gray-200 rounded w-full h-[50px]"
                placeholder="Enter 4-digit Transaction PIN"
                required
                name="pin"
                value={formData.pin}
                onChange={handleInputChange}
                inputMode="numeric"
                maxLength="4"
                pattern="\d{4}"
                autoComplete="pin"
                title="PIN must be exactly 4 digits"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPin ? (
                  <AiOutlineEyeInvisible size={20} />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-[12px] mt-2 ">
            We'll never share your details with anyone else.
          </p>
          <label className="flex items-start mt-8 space-x-3 cursor-pointer">
            <span className="relative">
              <input
                type="checkbox"
                className="peer shrink-0 appearance-none h-5 w-5 border border-gray-400 rounded-sm bg-white checked:bg-blue-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                required
                title="Required"
              />
              <svg
                className="absolute w-4 h-4 text-white left-0.5 top-0.5 pointer-events-none hidden peer-checked:block"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.586l7.879-7.879a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              By checking this box, you agree that the owner of the ID has
              granted you consent to verify his/her identity.
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className={`flex items-center text-xl mt-10 mb-8 cursor-pointer justify-center gap-2 ${
              loading ? "bg-gray-400" : "bg-amber-500 hover:bg-amber-600"
            } text-white font-medium py-2 px-4 rounded-xl w-full h-[50px] transition-colors`}
          >
            {loading ? (
              <AiOutlineLoading3Quarters className="animate-spin" />
            ) : (
              <MdOutlineSendToMobile className="" />
            )}
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </form>
      <ToastContainer />
    </div>
  );
}

export default NIN;
