import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Steps,
  Upload,
} from "antd";
import {
  InboxOutlined,
  LoadingOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Swal from "sweetalert2";
import { config } from "../../config/config";
import CryptoJS from "crypto-js";

const MAX_FILE_SIZE = 50 * 1024; // 50KB in bytes
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

function CAC() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [lgas, setLgas] = useState([]);
  const [fileList, setFileList] = useState({
    passport: null,
    signature: null,
  });
  const [previewUrls, setPreviewUrls] = useState({
    passport: null,
    signature: null,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedState, setSelectedState] = useState("");
  const [stateOptions, setStateOptions] = useState([]);
  const [lgaOptions, setLgaOptions] = useState([]);
  // Add this state to store form data
  const [formData, setFormData] = useState({});

  const steps = [
    {
      title: "Business Info",
      description: "Basic business details",
    },
    {
      title: "Business Location",
      description: "Address information",
    },
    {
      title: "Personal Details",
      description: "Proprietor information",
    },
    {
      title: "Verification",
      description: "Identity verification",
    },
  ];

  useEffect(() => {
    fetch("https://nga-states-lga.onrender.com/fetch")
      .then((res) => res.json())
      .then((data) => setStateOptions(data))
      .catch((error) => {
        console.error("Error fetching states:", error);
        setStateOptions([]);
      });
  }, []);

  const handleStateChange = async (value, type) => {
    try {
      const response = await fetch(
        `https://nga-states-lga.onrender.com/?state=${value}`
      );
      const lgas = await response.json();

      if (type === "business") {
        setLgaOptions(lgas);
        form.setFieldValue("LGAofBusiness", ""); // Reset LGA when state changes
      } else if (type === "origin") {
        setLgaOptions(lgas);
        form.setFieldValue("lgaOfOrigin", ""); // Reset LGA when state changes
      }
    } catch (error) {
      console.error("Error fetching LGAs:", error);
      setLgaOptions([]);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const SECRET_KEY = import.meta.env.VITE_APP_SECRET_KEY;

  const decryptData = (ciphertext) => {
    if (!ciphertext) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  };

  // Update the nextStep function
  const nextStep = async () => {
    try {
      // Validate current step fields
      await form.validateFields();

      // Get current form values and merge with existing data
      const currentValues = form.getFieldsValue();
      setFormData((prevData) => ({
        ...prevData,
        ...currentValues,
      }));

      // Log the accumulated data
      console.log("Accumulated form data:", {
        ...formData,
        ...currentValues,
      });

      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("Form validation error:", error);
      message.error("Please fill in all required fields");
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      // Merge final step data with accumulated data
      const allFormData = {
        ...formData,
        ...values,
      };

      // Check for required files
      if (!fileList.passport || !fileList.signature) {
        throw new Error("Please upload both passport and signature");
      }

      // Get user ID
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found. Please login again.");
      }
      const userObj = decryptData(userStr);
      const userId = userObj?._id || userObj?.id;

      // Convert files to base64
      const passportBase64 = await convertToBase64(fileList.passport);
      const signatureBase64 = await convertToBase64(fileList.signature);

      const payload = {
        userId,
        // Step 1: Business Info
        businessName1: allFormData.businessName1,
        businessName2: allFormData.businessName2 || null,
        businessName3: allFormData.businessName3 || null,
        dateOfCommencement:
          allFormData.dateOfCommencement?.format("YYYY-MM-DD"),
        natureOfBusiness1: allFormData.natureOfBusiness1,
        natureOfBusiness2: allFormData.natureOfBusiness2 || null,

        // Step 2: Business Location
        businessAddress: allFormData.AddressofBusiness,
        businessCity: allFormData.BusinessCity,
        businessLGA: allFormData.LGAofBusiness,
        businessState: allFormData.businessState,

        // Step 3: Personal Details
        surname: allFormData.surname,
        firstName: allFormData.firstName,
        otherName: allFormData.otherName || null,
        formerName: allFormData.formerName || null,
        nationality: allFormData.nationality,
        formerNationality: allFormData.formerNationality || null,
        occupation: allFormData.occupation,
        gender: allFormData.gender,
        phoneNumber: allFormData.phone,
        email: allFormData.email,
        homeAddress: allFormData.homeAddress,
        stateOfOrigin: allFormData.stateOfOrigin,
        lgaOfOrigin: allFormData.lgaOfOrigin,

        // Step 4: Identity Verification
        identityType: values.identityType,
        identityNumber: values.identityNumber,
        dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD"),

        // Files
        passport: passportBase64.split(",")[1],
        signature: signatureBase64.split(",")[1],
      };

      console.log("Final payload:", payload);

      // Validate required dates before submission

      console.log("Submitting payload:", payload);

      const response = await fetch(
        `${config.apiBaseUrl}${config.endpoints.cacRegistration}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Registration failed: ${response.statusText}`
        );
      }

      await Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Your business registration has been submitted successfully.",
        confirmButtonColor: "#f59e0b",
      });

      // Reset everything
      form.resetFields();
      setFileList({ passport: null, signature: null });
      setPreviewUrls({ passport: null, signature: null });
      setFormData({}); // Clear accumulated form data
      setCurrentStep(0);
    } catch (error) {
      console.error("Form submission error:", error);
      await Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: error.message || "Something went wrong",
        confirmButtonColor: "#f59e0b",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle step changes
  const prevStep = () => {
    // Save current step data before going back
    const currentValues = form.getFieldsValue();
    setFormData((prevData) => ({
      ...prevData,
      ...currentValues,
    }));

    setCurrentStep(currentStep - 1);
  };

  // Add file upload handler
  const handleFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          message.error("Only JPG, JPEG and PNG files are allowed");
          return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          message.error("File size must be less than 50KB");
          return;
        }

        // Create preview URL
        const preview = URL.createObjectURL(file);
        setPreviewUrls((prev) => ({
          ...prev,
          [type]: preview,
        }));

        // Store file
        setFileList((prev) => ({
          ...prev,
          [type]: file,
        }));
      } catch (error) {
        console.error(`Error handling ${type} upload:`, error);
        message.error(`Failed to upload ${type}`);
      }
    }
  };

  const beforeUpload = (file, type) => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      alert("Only JPG, JPEG and PNG files are allowed");
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be less than 50KB");
      return false;
    }

    return true;
  };

  // First, add a handleRemoveFile function after the handleFileChange function
  const handleRemoveFile = (type) => {
    setFileList((prev) => ({
      ...prev,
      [type]: null,
    }));
    setPreviewUrls((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  return (
    <div className="p-5 bg-white shadow rounded">
      <h2 className="text-2xl  font-semibold text-center mb-10 text-amber-500">
        Business Registration Form
      </h2>

      {/* Add Steps component */}
      <Steps current={currentStep} items={steps} className="mb-8" />

      <Form form={form} layout="vertical" onFinish={onFinish} className="mt-8">
        {currentStep === 0 && (
          <>
            <h3 className="text-lg font-semibold mb-4">
              Proposed Business Name
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="businessName1"
                label="Business Name 1"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="businessName2" label="Business Name 2">
                <Input />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="businessName3" label="Business Name 3">
                <Input />
              </Form.Item>
              <Form.Item
                name="dateOfCommencement"
                label="Date of Commencement"
                rules={[{ required: true }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </div>

            <h3 className="text-lg font-semibold mt-6 mb-4">
              Nature of Business
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="natureOfBusiness1"
                label="Nature of Business 1"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item name="natureOfBusiness2" label="Nature of Business 2">
                <Input />
              </Form.Item>
            </div>
          </>
        )}

        {currentStep === 1 && (
          <>
            <h3 className="text-lg font-semibold mb-4">
              Principal Place of Business
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <Form.Item
                name="AddressofBusiness"
                label="Business Address"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="businessState"
                label="Business State"
                rules={[{ required: true }]}
              >
                <Select
                  onChange={(value) => handleStateChange(value, "business")}
                >
                  {stateOptions.map((state) => (
                    <Select.Option key={state} value={state}>
                      {state}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="LGAofBusiness"
                label="Business LGA"
                rules={[{ required: true }]}
              >
                <Select disabled={!form.getFieldValue("businessState")}>
                  {lgaOptions.map((lga) => (
                    <Select.Option key={lga} value={lga}>
                      {lga}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="BusinessCity"
                label="Business City"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </div>
          </>
        )}

        {currentStep === 2 && (
          <>
            <h3 className="text-lg font-semibold mb-4">Proprietor's Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="surname"
                label="Surname"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="otherName" label="Other Name">
                <Input />
              </Form.Item>
              <Form.Item name="formerName" label="Former Name">
                <Input />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="nationality"
                label="Nationality"
                rules={[{ required: true }]}
              >
                <Input defaultValue="Nigerian" />
              </Form.Item>
              <Form.Item name="formerNationality" label="Former Nationality">
                <Input />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="occupation"
                label="Occupation"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="gender"
                label="Gender"
                rules={[{ required: true }]}
              >
                <Select>
                  <Select.Option value="male">Male</Select.Option>
                  <Select.Option value="female">Female</Select.Option>
                </Select>
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, type: "email" }]}
              >
                <Input />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Form.Item
                name="homeAddress"
                label="Home Address"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="stateOfOrigin"
                label="State of Origin"
                rules={[{ required: true }]}
              >
                <Select
                  onChange={(value) => handleStateChange(value, "origin")}
                >
                  {stateOptions.map((state) => (
                    <Select.Option key={state} value={state}>
                      {state}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="lgaOfOrigin"
                label="LGA of Origin"
                rules={[{ required: true }]}
              >
                <Select disabled={!form.getFieldValue("stateOfOrigin")}>
                  {lgaOptions.map((lga) => (
                    <Select.Option key={lga} value={lga}>
                      {lga}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </>
        )}

        {currentStep === 3 && (
          <>
            <h3 className="text-lg font-semibold mb-4">
              Identity Verification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="identityType"
                label="Identity Type"
                rules={[
                  { required: true, message: "Please select an identity type" },
                ]}
              >
                <Select placeholder="Select identity type">
                  <Select.Option value="driversLicence">
                    Driver's Licence
                  </Select.Option>
                  <Select.Option value="nin">
                    National Identity Number
                  </Select.Option>
                  <Select.Option value="internationalPassport">
                    International Passport
                  </Select.Option>
                  <Select.Option value="votersCard">Voter's Card</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="identityNumber"
                label="Identity Number"
                rules={[
                  {
                    required: true,
                    message: "Please enter your identity number",
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve();
                      const type = form.getFieldValue("identityType");
                      if (type === "nin" && !/^\d{11}$/.test(value)) {
                        return Promise.reject("NIN must be 11 digits");
                      }
                      if (
                        type === "driversLicence" &&
                        !/^[A-Z]{3}(-|\s)?[0-9]{6,8}$/.test(value)
                      ) {
                        return Promise.reject(
                          "Invalid Driver's Licence format"
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <Input placeholder="Enter your identity number" />
              </Form.Item>
            </div>

            {/* Optional: Additional verification fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Form.Item
                name="dateOfBirth"
                label="Date of Birth"
                rules={[{ required: true }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Passport Upload */}
              <Form.Item
                name="passport"
                label="Passport Photograph"
                rules={[
                  {
                    required: true,
                    message: "Please upload your passport photograph",
                  },
                ]}
              >
                <Upload
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  beforeUpload={(file) => beforeUpload(file, "passport")}
                  customRequest={({ file }) =>
                    handleFileChange({ target: { files: [file] } }, "passport")
                  }
                >
                  {previewUrls.passport ? (
                    <div className="relative group">
                      <img
                        src={previewUrls.passport}
                        alt="Passport"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center  bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile("passport");
                          }}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className=" text-[12px] text-gray-500">
                        Upload Passport
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        JPG/PNG (max: 50KB)
                      </div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              {/* Signature Upload */}
              <Form.Item
                name="signature"
                label="Signature"
                rules={[
                  { required: true, message: "Please upload your signature" },
                ]}
              >
                <Upload
                  listType="picture-card"
                  className="signature-uploader"
                  showUploadList={false}
                  beforeUpload={(file) => beforeUpload(file, "signature")}
                  customRequest={({ file }) =>
                    handleFileChange({ target: { files: [file] } }, "signature")
                  }
                >
                  {previewUrls.signature ? (
                    <div className="relative group">
                      <img
                        src={previewUrls.signature}
                        alt="Signature"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center  bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile("signature");
                          }}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className=" text-[12px] text-gray-500">
                        Upload Signature
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        JPG/PNG (max: 50KB)
                      </div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {currentStep > 0 && <Button onClick={prevStep}>Previous</Button>}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={nextStep} className="bg-amber-500">
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-amber-500"
            >
              Submit
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}

export default CAC;
