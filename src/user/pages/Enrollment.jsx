import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  message,
} from "antd";
import { ToastContainer, toast } from "react-toastify";
import Swal from "sweetalert2";
import { config } from "../../config/config";
import CryptoJS from "crypto-js";

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

// Helper function to get enrollment amount based on type
const getEnrollmentAmount = (type) => {
  switch (type) {
    case "adult_7000":
      return 7000;
    case "child_4000":
      return 4000;
    case "old_4000":
      return 4000;
    default:
      return 0;
  }
};

function Enrollment() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileError, setFileError] = useState(null);

  // File upload handler with validation
  const validateFile = (file) => {
    // Check file type
    const validTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setFileError("Please upload only JPG, PNG or PDF files");
      message.error("Please upload only JPG, PNG or PDF files");
      toast("Please upload only JPG, PNG or PDF files", {
        type: "error",
        position: "top-right",
      });
      return false;
    }

    // Check file size (50KB = 51200 bytes)
    if (file.size > 51200) {
      setFileError("File size must be less than 50KB");
      toast("File size must be less than 50KB", {
        type: "error",
        position: "top-right",
      });
      return false;
    }

    setFileError("");
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (validateFile(file)) {
      setSelectedFile(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    } else {
      e.target.value = ""; // Reset file input
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  // Update the convertToBase64 function
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Get the base64 string without the data URL prefix
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
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
        throw new Error("User authentication failed");
      }

      if (!userId) {
        throw new Error("User ID not found");
      }

      // Handle passport file
      let passportBase64 = null;
      if (selectedFile) {
        try {
          passportBase64 = await convertToBase64(selectedFile);
          console.log("Passport converted successfully");
        } catch (error) {
          console.error("Error converting passport:", error);
          throw new Error("Failed to process passport image");
        }
      }

      // Verify we have the required passport
      if (!passportBase64) {
        throw new Error("Passport photo is required");
      }

      // Format date to DD-MM-YYYY
      const formattedDOB = values.dob.format("DD-MM-YY");

      // Construct payload with amount and passport
      const payload = {
        userId,
        type: values.enrollmentType,
        amount: getEnrollmentAmount(values.enrollmentType), // Add amount based on type,
        firstname: values.firstName,
        middleName: values.middleName || "",
        surname: values.surname,
        dob: formattedDOB,
        state: values.stateOfOrigin,
        lga: values.localOfOrigin,
        phone: values.phone,
        gender: values.gender,
        height: values.height,
        passport: passportBase64, // Base64 encoded passport image
      };

      // Add debug logging
      console.log("Sending payload with passport:", {
        ...payload,
        passport: passportBase64 ? ` ${passportBase64}` : "No passport",
      });

      const response = await fetch(
        `${config.apiBaseUrl}${config.endpoints.Enrollment}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      console.log("API Response:", response);

      if (response.ok) {
        await Swal.fire({
          icon: "success",
          title: "Enrollment Successful!",
          text: "Your enrollment has been submitted successfully.",
          confirmButtonColor: "#f59e0b",
        });

        // Reset form and previews
        form.resetFields();
        setPreviewUrl(null);
        setSelectedFile(null);
      } else {
        throw new Error(data.message || "Enrollment failed");
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      Swal.fire({
        icon: "error",
        title: "Enrollment Failed",
        text: error.message || "Failed to submit enrollment. Please try again.",
        confirmButtonColor: "#f59e0b",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch states and LGAs
  useEffect(() => {
    fetch("https://nga-states-lga.onrender.com/fetch")
      .then((res) => res.json())
      .then((data) => setStates(data))
      .catch(() => setStates([]));
  }, []);

  const handleStateChange = (value) => {
    form.setFieldsValue({ localOfOrigin: undefined });
    if (value) {
      fetch(`https://nga-states-lga.onrender.com/?state=${value}`)
        .then((res) => res.json())
        .then((data) => setLgas(data))
        .catch(() => setLgas([]));
    } else {
      setLgas([]);
    }
  };

  return (
    <div className="w-full rounded-2xl mb-5 bg-white p-5 shadow-lg">
      <ToastContainer />
      <p className="text-3xl text-center text-amber-500 font-semibold">
        Enrollment
      </p>
      <div className="ml-7">
        <p className="text-[16px] mt-7 mb-5 font-semibold text-gray-500">
          Enrollment for non appearance
        </p>
        <Form form={form} onFinish={onFinish} layout="vertical" className="">
          <Form.Item
            size="large"
            name="enrollmentType"
            label="ENROLLMENT TYPE"
            rules={[
              { required: true, message: "Please select enrollment type" },
            ]}
          >
            <Select placeholder="-- Select an Option --">
              <Select.Option value="adult_7000">
                Adult Enrollment @ ₦7,000
              </Select.Option>
              <Select.Option value="child_4000">
                Child Enrollment @ ₦4,000
              </Select.Option>
              <Select.Option value="old_4000">
                Old Slip Enrollment @ ₦4,000
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            size="large"
            name="firstName"
            label="FIRST NAME"
            rules={[{ required: true, message: "Please input first name" }]}
          >
            <Input placeholder="First Name" />
          </Form.Item>

          <Form.Item size="large" name="middleName" label="MIDDLE NAME">
            <Input placeholder="Middle Name" />
          </Form.Item>

          <Form.Item
            size="large"
            name="surname"
            label="SURNAME"
            rules={[{ required: true, message: "Please input surname" }]}
          >
            <Input placeholder="Surname" />
          </Form.Item>

          <Form.Item
            size="large"
            name="dob"
            label="DATE OF BIRTH"
            rules={[{ required: true, message: "Please select date of birth" }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            size="large"
            name="stateOfOrigin"
            label="STATE OF ORIGIN"
            rules={[
              { required: true, message: "Please select state of origin" },
            ]}
          >
            <Select
              placeholder="-- Select State of Origin --"
              onChange={handleStateChange}
            >
              {states.map((state) => (
                <Select.Option key={state} value={state}>
                  {state}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            size="large"
            name="localOfOrigin"
            label="LGA OF ORIGIN"
            rules={[{ required: true, message: "Please select LGA of origin" }]}
          >
            <Select placeholder="-- Select LGA of Origin --">
              {lgas.map((lga) => (
                <Select.Option key={lga} value={lga}>
                  {lga}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            size="large"
            name="phone"
            label="PHONE NUMBER"
            rules={[
              { required: true, message: "Please input phone number" },
              {
                pattern: /^\d{11}$/,
                message: "Phone number must be 11 digits",
              },
            ]}
          >
            <Input placeholder="Phone Number" maxLength={11} />
          </Form.Item>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Form.Item
              size="large"
              name="gender"
              label="GENDER"
              rules={[{ required: true, message: "Please select gender" }]}
            >
              <Select placeholder="-- Select Gender --">
                <Select.Option value="male">Male</Select.Option>
                <Select.Option value="female">Female</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              size="large"
              name="height"
              label="HEIGHT (CM)"
              rules={[{ required: true, message: "Please input height" }]}
            >
              <InputNumber className="w-full" min={0} placeholder="e.g 165cm" />
            </Form.Item>
          </div>

          <Form.Item
            size="large"
            name="passport"
            label="Passport Photograph"
            className="my-5"
            rules={[
              {
                required: true,
                validator: (_, value) => {
                  if (!selectedFile) {
                    return Promise.reject(
                      "Please upload a passport photograph"
                    );
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-center w-full">
                <label className="w-full mt-5 flex flex-col items-center px-4 py-6 bg-white rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                  />
                </label>
              </div>

              {fileError && (
                <p className="mt-1 text-sm text-red-600">{fileError}</p>
              )}

              {previewUrl && (
                <div className="mt-5 relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-[100px] max-h-[100px] object-contain rounded border border-gray-200"
                  />
                </div>
              )}

              <div className="text-xs text-gray-500 mt-2">
                File requirements:
                <ul className="list-disc ml-4 mt-1">
                  <li>Maximum file size: 50KB</li>
                  <li>Allowed file types: JPG, JPEG, PNG, PDF</li>
                  <li>Recent passport photograph with white background</li>
                </ul>
              </div>
            </div>
          </Form.Item>

          <Form.Item size="large">
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              className="w-full flex items-center bg-amber-500 mt-[-5px]"
              loading={loading}
            >
              Submit Enrollment
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

export default Enrollment;
