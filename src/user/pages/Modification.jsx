import React, { useState, useEffect } from "react";
import { Form, Input, Select, DatePicker, Button } from "antd";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { config } from "../../config/config";
import CryptoJS from "crypto-js";

const MODIFICATION_TYPES = [
  { value: "name", label: "Change of Name", price: 5000 },
  { value: "dob", label: "Date of Birth", price: 32000 },
  { value: "address", label: "Address", price: 4500 },
  { value: "phone", label: "Phone Number", price: 4500 },
];

function Modification() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isLgaOpen, setIsLgaOpen] = useState(false);

  // Fetch states effect
  useEffect(() => {
    fetch("https://nga-states-lga.onrender.com/fetch")
      .then((res) => res.json())
      .then((data) => setStates(data))
      .catch(() => setStates([]));
  }, []);

  const handleStateChange = async (value) => {
    setLocationLoading(true);
    try {
      const response = await fetch(
        `https://nga-states-lga.onrender.com/?state=${value}`
      );
      const data = await response.json();
      setLgas(data);
      form.setFieldsValue({ lga: undefined });
    } catch (error) {
      setLgas([]);
      toast.error("Failed to load LGAs");
    } finally {
      setLocationLoading(false);
    }
  };

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
    setLoading(true);
    try {
      const selected = MODIFICATION_TYPES.find(
        (type) => type.value === values.modificationType
      );

      const payload = {
        userId: userId,
        modificationType: selected?.label || "Other Modification",
        modificationAmount: selected?.price || 0,
        newDob: values.newDob.format("YYYY-MM-DD"),
        newSurname: values.newSurname,
        newFirstName: values.newFirstName,
        newMiddleName: values.newMiddleName,
        newPhoneNo: values.newPhoneNo,
        newAddress: values.newAddress,
        newGender: values.newGender,
        ninNumber: values.ninNumber,
        address: values.address,
        localGovernment: values.localGovernment,
        stateOfOrigin: values.stateOfOrigin,
      };

      const response = await fetch(
        `${config.apiBaseUrl}${config.endpoints.Modification}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Modification Request Submitted!",
          text: "Your modification request has been submitted successfully.",
          confirmButtonColor: "#f59e0b",
        });
        form.resetFields();
      } else {
        throw new Error("Failed to submit modification request");
      }
    } catch (error) {
      console.error("Modification error:", error);
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error.message || "Failed to submit request. Please try again.",
        confirmButtonColor: "#d10",
      });
    } finally {
      setLoading(false);
    }
  };

  // handle body scroll
  useEffect(() => {
    if (isStateOpen || isLgaOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isStateOpen, isLgaOpen]);

  return (
    <div className="w-full rounded-2xl mb-5 bg-white p-5 shadow-lg">
      <ToastContainer />
      <h2 className="text-3xl font-semibold mb-4 text-center text-amber-500">
        Modification Form
      </h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        requiredMark={true}
      >
        <Form.Item
          label="Select Modification Type"
          name="modificationType"
          rules={[
            { required: true, message: "Please select modification type" },
          ]}
        >
          <Select
            size="large"
            placeholder="Select modification type"
            onChange={(value) => {
              const selected = MODIFICATION_TYPES.find(
                (type) => type.value === value
              );
              form.setFieldsValue({
                modificationAmount: selected ? selected.price : 0,
              });
            }}
          >
            {MODIFICATION_TYPES.map((type) => (
              <Select.Option key={type.value} value={type.value}>
                {`${type.label} @ ₦${type.price.toLocaleString()}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="newDob"
          label="New DOB"
          rules={[
            { required: true, message: "Please select new date of birth" },
          ]}
        >
          <DatePicker className="w-full" size="large" />
        </Form.Item>

        <Form.Item
          name="newSurname"
          label="New Surname"
          rules={[{ required: true, message: "Please enter new surname" }]}
        >
          <Input size="large" placeholder="Enter New Surname" />
        </Form.Item>

        <Form.Item
          name="newFirstName"
          label="New FirstName"
          rules={[{ required: true, message: "Please enter new first name" }]}
        >
          <Input size="large" placeholder="Enter New FirstName" />
        </Form.Item>

        <Form.Item name="newMiddleName" label="New MiddleName">
          <Input size="large" placeholder="Enter New MiddleName" />
        </Form.Item>

        <Form.Item
          name="newPhoneNo"
          label="New Phone No"
          rules={[
            { required: true, message: "Please enter new phone number" },
            { pattern: /^\d{11}$/, message: "Phone number must be 11 digits" },
          ]}
        >
          <Input
            size="large"
            placeholder="Enter new phone number"
            maxLength={11}
          />
        </Form.Item>

        <Form.Item
          name="newAddress"
          label="New Address"
          rules={[{ required: true, message: "Please enter new address" }]}
        >
          <Input.TextArea size="large" placeholder="Enter new address" />
        </Form.Item>

        <Form.Item
          name="newGender"
          label="New Gender"
          rules={[{ required: true, message: "Please select gender" }]}
        >
          <Select size="large" placeholder="-- Select Gender --">
            <Select.Option value="male">Male</Select.Option>
            <Select.Option value="female">Female</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="ninNumber"
          label="NIN Number"
          rules={[{ required: true, message: "Please enter NIN number" }]}
        >
          <Input size="large" placeholder="NIN" />
        </Form.Item>

        <Form.Item
          name="address"
          label="Address"
          rules={[{ required: true, message: "Please enter NIN address" }]}
        >
          <Input.TextArea size="large" placeholder="NIN Address" />
        </Form.Item>

        <Form.Item
          name="stateOfOrigin"
          label="State Of Origin"
          rules={[{ required: true }]}
        >
          <Select
            size="large"
            placeholder="NIN State Of Origin"
            onChange={handleStateChange}
            loading={locationLoading}
            onOpenChange={(open) => setIsStateOpen(open)}
            getPopupContainer={(trigger) => trigger.parentNode}
            dropdownStyle={{
              maxHeight: "200px",
              position: "fixed",
            }}
          >
            {states.map((state, idx) => (
              <Select.Option key={idx} value={state}>
                {state}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="localGovernment"
          label="Local Government"
          rules={[{ required: true }]}
        >
          <Select
            size="large"
            placeholder="NIN Local Government"
            loading={locationLoading}
            disabled={!form.getFieldValue("stateOfOrigin")}
            onOpenChange={(open) => setIsLgaOpen(open)}
            getPopupContainer={(trigger) => trigger.parentNode}
            dropdownStyle={{
              maxHeight: "200px",
              position: "fixed",
            }}
          >
            {lgas.map((lga, idx) => (
              <Select.Option key={idx} value={lga}>
                {lga}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="modificationAmount" hidden>
          <Input type="number" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="w-full flex items-center bg-amber-500"
            loading={loading}
          >
            Submit Modification
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Modification;
