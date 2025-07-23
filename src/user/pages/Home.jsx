import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { CiWallet } from "react-icons/ci";
import { FaEllipsisVertical } from "react-icons/fa6";
import { FaCube } from "react-icons/fa6";
import { NavLink, useNavigate } from "react-router-dom";
import NIMC from "../assets/images/nimc.png";
import NIBSS from "../assets/images/nibss.png";
import CAC from "../assets/images/cac.png";
import Airtime from "../assets/images/airtime.png";
import Bank from "../assets/images/bank.webp";
import Data from "../assets/images/data.png";
import { IoClose } from "react-icons/io5";
import { FaRegCopy } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../assets/css/style.css";
import Logo from "../assets/images/logo-3plec.png";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { config } from "../../config/config.jsx";
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY;

function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

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

// DepositModal Component
function DepositModal({ open, onClose }) {
  const user = decryptData(localStorage.getItem("user"));
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [modalVisible, setModalVisible] = useState(false);

  // Add useEffect to handle animation
  useEffect(() => {
    if (open) {
      // Small delay to trigger animation
      setTimeout(() => setModalVisible(true), 10);
    } else {
      setModalVisible(false);
    }
  }, [open]);

  const handleClose = () => {
    setModalVisible(false);
    // Wait for animation to complete before closing
    setTimeout(() => onClose(), 300);
  };

  const handlePaystack = () => {
    if (!window.PaystackPop) {
      toast.error("Paystack is not loaded. Please refresh the page.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_URL,
      email: user?.email,
      amount: Number(amount) * 100,
      currency: "NGN",
      ref: `3PLEC-${Date.now()}`,
      metadata: {
        userId: user?._id || user?.id,
        name: `${user?.firstName} ${user?.lastName}`,
      },
      callback: function (response) {
        toast.success("Payment successful. Processing...");
        // Handle successful payment here
        console.log("Payment successful:", response);
        onClose();
      },
      onClose: function () {
        toast.error("Payment closed by user.");
      },
    });

    // Close the modal before opening the Paystack popup
    onClose();
    handler.openIframe();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !paymentMethod) {
      toast.error("Please complete all fields");
      return;
    }
    if (Number(amount) < 100) {
      toast.error("Minimum deposit amount is ₦100");
      return;
    }
    if (paymentMethod === "paystack") {
      handlePaystack();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50">
      <div
        className={`bg-white rounded-xl w-[450px] max-w-[90%] p-6 shadow-xl 
          transform transition-all duration-300 
          ${modalVisible ? "scale-100 opacity-100" : "scale-90 opacity-0"}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Make a Deposit</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <IoClose size={24} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">Add funds to your 3PLEC wallet.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Amount
            </label>
            <input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="payment"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="paystack">Paystack</option>
            </select>
          </div>

          {amount && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Deposit Amount:</span>
                  <span>₦{Number(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee:</span>
                  <span>₦0.00</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₦{Number(amount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
            >
              Deposit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Dashboard() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false); // New state for deposit modal

  const [creatingAccount, setCreatingAccount] = useState(false);
  const [account, setAccount] = useState(null);
  const [loadingAccount, setLoadingAccount] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);

  const user = decryptData(localStorage.getItem("user"));
  const firstName = user?.firstName || "User";
  const userId = user?._id || user?.id;

  // Detect if user is new or returning
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    // Check localStorage for a flag
    const hasVisited = localStorage.getItem("hasVisitedAYCreative");
    if (hasVisited) {
      setIsReturning(true);
    } else {
      setIsReturning(false);
      localStorage.setItem("hasVisitedAYCreative", "true");
    }
  }, []);

  // Load Paystack script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch account info on mount
  useEffect(() => {
    const fetchAccount = async () => {
      setLoadingAccount(true);
      try {
        const res = await axios.get(
          `${config.apiBaseUrl}/virtualAccount/${userId}`
        );
        console.log("res.data", res.data.customerPin);
        setAccount(res.data);
      } catch (err) {
        setAccount(null);
        console.error("Fetch account error:", err, err.response?.data);
      }
      setLoadingAccount(false);
    };
    if (userId) {
      fetchAccount();
    }
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleCreateAccount = async () => {
    setCreatingAccount(true);
    try {
      const res = await axios.post(
        `${config.apiBaseUrl}/virtualAccount/create/${userId}`
      );
      console.log("Create account response:", res.data);

      const accountRes = await axios.get(
        `${config.apiBaseUrl}/virtualAccount/${userId}`
      );
      setAccount(accountRes.data);

      localStorage.setItem(
        "user",
        encryptData({ ...user, account: accountRes.data })
      );

      // SweetAlert success
      Swal.fire({
        icon: "success",
        title: "Account Created!",
        text: "Your virtual account has been created successfully. You can now fund your wallet.",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Create account error:", err, err.response?.data);
      alert(
        err.response?.data?.message ||
          "Failed to create account. Please try again."
      );
    }
    setCreatingAccount(false);
  };

  // Add this function inside Dashboard component
  const refreshAccount = async () => {
    setLoadingAccount(true);
    try {
      const res = await axios.get(
        `${config.apiBaseUrl}/virtualAccount/${userId}`
      );
      setAccount(res.data);
    } catch (err) {
      setAccount(null);
      console.error("Fetch account error:", err, err.response?.data);
    }
    setLoadingAccount(false);
  };

  // navItems.js
  const navItems = [
    {
      id: 1,
      name: "NIN VERIFY",
      icon: NIMC,
      to: "/dashboard/verifications/nin",
    },
    {
      id: 2,
      name: "NIN WITH PHONE",
      icon: NIMC,
      to: "/dashboard/verifications/pvn",
    },
    {
      id: 3,
      name: "IPE CLEARANCE",
      icon: NIMC,
      to: "/dashboard/ipe-clearance",
    },
    {
      id: 4,
      name: "MODIFICATION",
      icon: NIMC,
      to: "/dashboard/modification",
    },
    {
      id: 5,
      name: "PERSONALIZATION",
      icon: NIMC,
      to: "/dashboard/personalisation",
    },
    {
      id: 6,
      name: "DEMOGRAPHIC SEARCH",
      icon: NIMC,
      to: "/dashboard/demographic-search",
    },
    {
      id: 7,
      name: "VALIDATION",
      icon: NIMC,
      to: "/dashboard/validation",
    },
    {
      id: 8,
      name: "ENROLLMENT",
      icon: NIMC,
      to: "/dashboard/enrollment",
    },
    {
      id: 9,
      name: "BVN VERIFY",
      icon: NIBSS,
      to: "/dashboard/verifications/bvn",
    },
    {
      id: 10,
      name: "AIRTIME SUBSCRIPTION",
      icon: Airtime,
      to: "/dashboard/airtime",
    },
    {
      id: 11,
      name: "DATA SUBSCRIPTION",
      icon: Data,
      to: "/dashboard/data",
    },
    {
      id: 12,
      name: "CAC REGISTRATION",
      icon: CAC,
      to: "/dashboard/cac",
    },
    {
      id: 13,
      name: "BVN LICENCES",
      icon: NIBSS,
      to: "/dashboard/bvn-licence",
    },
    {
      id: 14,
      name: "BANK AGENCY",
      icon: Bank,
      to: "/dashboard/bank-agency",
    },
  ];

  const openModal = () => {
    setIsOpen(true);
    setTimeout(() => setModalVisible(true), 10);
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  const [showBalance, setShowBalance] = useState(true);
  const [verificationCount, setVerificationCount] = useState(0);
  const [loadingVerifications, setLoadingVerifications] = useState(true);

  // Update the useEffect for fetching verification counts
  useEffect(() => {
    const fetchVerificationCount = async () => {
      if (!userId) return;

      setLoadingVerifications(true);
      try {
        const response = await axios.get(
          `${config.apiBaseUrl}${config.endpoints.VerificationHistory}${userId}`,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const totalCount = response.data.count || 0;
        console.log("Total transactions:", totalCount);
        setVerificationCount(totalCount);
      } catch (error) {
        console.error("Error fetching verification count:", error);
        setVerificationCount(0);
      } finally {
        setLoadingVerifications(false);
      }
    };

    fetchVerificationCount();
  }, [userId]);

  return (
    <div className="max-w-[1500px] mx-auto">
      <div className="mb-10 text-2xl text-gray-500 font-bold">
        {isReturning
          ? `Welcome back, ${firstName} 🙂`
          : `Welcome to 3PLEC, ${firstName} 👋`}
      </div>
      <div className="flex justify-center  max-w-full flex-col md:flex-row  gap-10">
        <div className="flex-1/2 rounded-lg bg-white hover:shadow-lg shadow-md ring-2 ring-amber-50/2 w-full p-7">
          {loadingAccount ? (
            <div className="flex items-center justify-center h-[100px]">
              <span className="text-gray-400">Loading...</span>
            </div>
          ) : account ? (
            <>
              <p className="text-gray-500 text-[16px] font-light">
                Wallet Balance
              </p>
              <p className="text-gray-600 text-[30px] mb-10 font-bold font-sans flex items-center gap-2">
                {showBalance ? `₦${account.balance || "0.00"}` : "₦*** ***"}
                <button
                  onClick={() => setShowBalance((prev) => !prev)}
                  className="ml-2 focus:outline-none text-gray-400"
                  title={showBalance ? "Hide Balance" : "Show Balance"}
                  type="button"
                >
                  {showBalance ? <FaEyeSlash /> : <FaEye />}
                </button>
              </p>

              {/* Updated Add Money section with two buttons */}
              <div className="flex flex-col items-center md:justify-start sm:flex-row gap-3">
                <button
                  onClick={openModal}
                  className=" w-[160px] h-[40px] text-black bg-gray-200 cursor-pointer hover:bg-gray-300 rounded-lg p-2 flex items-center justify-center gap-2"
                >
                  <CiWallet className="text-xl" />
                  <span>Bank Transfer</span>
                </button>

                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="w-[160px] h-[40px] text-white bg-amber-400 cursor-pointer hover:bg-amber-500 rounded-lg p-2 flex items-center justify-center gap-2"
                >
                  <CiWallet className="text-xl" />
                  <span>Card Payment</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mb-4 text-gray-500 text-[15px]">
                To use your wallet, you need to create a virtual account. Click
                the button below to get started! 🚀
              </p>
              <button
                className="w-[140px] h-[40px] text-black bg-amber-400 cursor-pointer hover:bg-amber-500 max-w-full rounded-lg p-2 flex items-center justify-center"
                onClick={handleCreateAccount}
                disabled={creatingAccount}
              >
                {creatingAccount ? "Creating..." : "Create Account"}
              </button>
            </>
          )}

          {/* Bank Transfer Modal */}
          {isOpen && (
            <div
              className={`fixed inset-0 z-50 flex justify-center items-center bg-black/30 transition-opacity duration-300 ${
                modalVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <div
                className={`bg-white rounded-xl w-[450px] h-[450px] max-w-full text-center relative shadow-xl transform transition-all duration-300 ${
                  modalVisible ? "scale-100" : "scale-90"
                } flex flex-col justify-center items-center mx-auto`}
              >
                <button
                  className="absolute top-[-10px] right-[-15px] cursor-pointer bg-gray-200 rounded p-1 text-gray-500 hover:text-black"
                  onClick={closeModal}
                >
                  <IoClose size={24} />
                </button>

                <h2 className="text-2xl font-bold text-gray-500 mb-1">
                  Fund Your Wallet
                </h2>
                <p className="text-md my-4 text-gray-500">
                  Send money to your 3PLEC Account
                </p>

                <div className="flex justify-center mt-5 mb-10">
                  <img src={Logo} alt="Wallet Icon" className="w-[200px]" />
                </div>

                {account ? (
                  <>
                    <p className="font-semibold text-gray-500">
                      Datapin-{account.accountName}
                    </p>
                    <p className="text-xl text-gray-500">{account.bankName}</p>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <p className="text-xl text-gray-500 font-bold mb-0">
                        {account.accountNumber}
                      </p>
                      <button
                        className="ml-2 text-gray-500 hover:text-amber-500"
                        onClick={() => {
                          navigator.clipboard.writeText(account.accountNumber);
                          toast.success("Copied!", {
                            position: "top-center",
                            autoClose: 1200,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: false,
                            draggable: false,
                            style: { fontSize: "15px" },
                          });
                        }}
                        title="Copy account number"
                      >
                        <FaRegCopy size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-red-500">No account details available.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1/2 rounded bg-white shadow-md hover:shadow-lg ring-2 ring-amber-50/2 w-full p-5">
          <div className="flex justify-between items-center relative">
            <FaCube className="text-5xl" />
            <div className="relative" ref={dropdownRef}>
              <FaEllipsisVertical
                className="cursor-pointer hover:bg-gray-200 hover:rounded-full h-full"
                onClick={() => setDropdownOpen((open) => !open)}
              />
              {dropdownOpen && (
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 mt-[30px] bg-gray-50 shadow-lg rounded-md py-2 px-4 z-50 min-w-[120px]">
                  <NavLink
                    to="/dashboard/all-history"
                    className="block text-gray-700 hover:text-amber-600 py-1"
                    onClick={() => setDropdownOpen(false)}
                  >
                    View More
                  </NavLink>
                </div>
              )}
            </div>
          </div>
          <p className="text-gray-500 text-[16px] mt-8 font-normal">
            Verifications History
          </p>
          <p className="mt-2">
            {loadingVerifications ? (
              <span className="text-amber-400 text-[18px] font-bold">
                Loading...
              </span>
            ) : (
              <span className="text-gray-500 text-[24px] font-bold">
                {verificationCount}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 w-full py-4">
        {navItems.map((item) => (
          <NavLink
            to={item.to}
            key={item.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4 flex flex-col items-center text-center"
          >
            <img
              src={item.icon}
              alt={item.name}
              className="w-16 h-16 object-contain mb-3"
            />
            <span className="font-semibold text-[14px] text-gray-400">
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>

      {/* Deposit Modal */}
      <DepositModal
        open={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
      />

      <ToastContainer />
    </div>
  );
}

export default Dashboard;
