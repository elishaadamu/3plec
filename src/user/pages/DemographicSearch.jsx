import React, { useState, useEffect } from "react";
import { Form, Input, Select, DatePicker, Button } from "antd";
import Swal from "sweetalert2";
import { config } from "../../config/config";
import CryptoJS from "crypto-js";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from "axios";
import { toast } from "react-toastify";

function DemographicSearch() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [banks, setBanks] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [banksLoading, setBanksLoading] = useState(false);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isLgaOpen, setIsLgaOpen] = useState(false);
  // Add state for PIN visibility
  const [showPin, setShowPin] = useState(false);

  // Add state for API prices
  const [apiPrices, setApiPrices] = useState(null);
  const [demographicPrice, setDemographicPrice] = useState(0); // Default price

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

  // Add useEffect to fetch prices when component mounts
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get(
          `${config.apiBaseUrl}${config.endpoints.currentapipricing}`,
          { withCredentials: true }
        );
        console.log("API Prices Response:", response.data);
        // Find demographic search pricing
        const demographicPricing = response.data.find(
          (item) => item.serviceKey === "demographic"
        );
        console.log("Demographic Pricing:", demographicPricing);
        if (demographicPricing) {
          setDemographicPrice(demographicPricing.agentPrice);
        }
      } catch (error) {
        console.error("Error fetching API prices:", error);
        toast.error("Failed to fetch current prices");
      }
    };

    fetchPrices();
  }, []);

  // Get userId from encrypted localStorage
  let userId = null;
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userObj = decryptData(userStr);
      userId = userObj?._id || userObj?.id;
    }
  } catch (error) {
    console.error("Error getting userId:", error);
  }

  const onFinish = async (values) => {
    // Show confirmation dialog first
    const result = await Swal.fire({
      title: "Confirm Search",
      text: `Are you sure you want to proceed with this demographic search? Amount: ₦${demographicPrice}`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, proceed",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    setLoading(true);
    try {
      // Simplified payload to match new requirements
      const payload = {
        userId: userId,
        amount: demographicPrice,
        firstName: values.firstName,
        lastName: values.lastName,
        dob: values.dob.format("DD-MM-YY"),
        gender: values.gender,
        pin: values.pin,
      };
      console.log("Payload:", payload);
      const response = await fetch(
        `${config.apiBaseUrl}${config.endpoints.DemographicSearch}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      console.log("Response status:", response);

      const data = await response.json();
      console.log("Response data:", data);
      if (response.status === 200) {
        await Swal.fire({
          icon: "success",
          title: "Registration Successful!",
          text: " ",
          confirmButtonColor: "#f59e0b",
        });

        form.resetFields();
      } else {
        throw new Error(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);

      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: "Failed to submit registration. Please try again.",
        confirmButtonColor: "#f59e0b",
      });
    } finally {
      setLoading(false);
    }
  };

  // effect to handle body scroll
  useEffect(() => {
    if (isBankOpen || isStateOpen || isLgaOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isBankOpen, isStateOpen, isLgaOpen]);

  return (
    <div className="w-full rounded-2xl mb-5 bg-white p-5 shadow-lg">
      <h2 className="text-3xl text-center text-amber-500 font-semibold mb-4">
        Demographic Search
      </h2>

      {/* Cost Display */}
      <div className="mb-6 my-5 bg-gray-50 rounded-lg">
        <p className="text-lg font-medium">
          This service will cost you ={" "}
          <span className="p-1 text-lg bg-green-100 text-green-900 rounded">
            ₦{demographicPrice}.00
          </span>
        </p>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={true}
      >
        {/* Slip Selection */}
        <Form.Item
          name="amount"
          label="Select Slip"
          rules={[{ required: true, message: "Please select slip type" }]}
        >
          <Select size="large" placeholder="Select slip type">
            <Select.Option value={demographicPrice}>
              Premium Slip = ₦{demographicPrice}
            </Select.Option>
            <Select.Option value={demographicPrice}>
              Standard Slip = ₦{demographicPrice}
            </Select.Option>
            <Select.Option value="0">Digital Slip = ₦0.00</Select.Option>
          </Select>
        </Form.Item>

        {/* First Name */}
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: "Please enter first name" }]}
        >
          <Input size="large" placeholder="Enter first name" />
        </Form.Item>

        {/* Last Name */}
        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: "Please enter last name" }]}
        >
          <Input size="large" placeholder="Enter last name" />
        </Form.Item>

        {/* Gender Field */}
        <Form.Item
          name="gender"
          label="Gender"
          rules={[{ required: true, message: "Please select gender" }]}
        >
          <Select size="large" placeholder="Select gender">
            <Select.Option value="male">Male</Select.Option>
            <Select.Option value="female">Female</Select.Option>
          </Select>
        </Form.Item>

        {/* Date of Birth */}
        <Form.Item
          name="dob"
          label="Date of Birth"
          rules={[{ required: true }]}
        >
          <DatePicker className="w-full" size="large" />
        </Form.Item>

        {/* PIN Field */}
        <Form.Item
          name="pin"
          label="Transaction PIN"
          rules={[
            { required: true, message: "Please enter your 4-digit PIN" },
            { pattern: /^\d{4}$/, message: "PIN must be exactly 4 digits" },
          ]}
        >
          <Input.Password
            size="large"
            maxLength={4}
            placeholder="Enter 4-digit PIN"
            autoComplete="current-password"
            iconRender={(visible) => (
              <span
                onClick={() => setShowPin(!visible)}
                className="cursor-pointer"
              >
                {visible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            )}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full justify-center flex items-center bg-amber-500 mt-[-5px]"
            loading={loading}
          >
            Verify NIN
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default DemographicSearch;
