import React, { useState } from "react";
import axios from "axios";

const NinVerificationPage = () => {
  const [nin, setNin] = useState("");
  const [trackingId, setTrackingId] = useState("");
  const [searchType, setSearchType] = useState("nin"); // "nin", "demographic", or "check-ipe"
  const [demographicData, setDemographicData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    state_of_origin: "",
    lga: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleDemographicChange = (e) => {
    const { name, value } = e.target;
    setDemographicData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let payload;
      let endpoint;

      if (searchType === "nin") {
        console.log("NIN request:", nin);
        payload = { nin };
        endpoint = "https://verification-bdef.onrender.com/api/v1/verify/nin";
      } else if (searchType === "demographic") {
        console.log("Demographic request:", demographicData);
        payload = demographicData;
        endpoint =
          "https://verification-bdef.onrender.com/api/v1/verify/demographic";
      } else if (searchType === "check-ipe") {
        console.log("Check-IPE request:", trackingId);
        payload = { tracking_id: trackingId };
        endpoint =
          "https://verification-bdef.onrender.com/api/v1/verify/submit-ipe";
      }

      const response = await axios.post(endpoint, payload, {
        headers: {
          "x-api-key": "pk_1874a0afe3a9a7db1a43e5312e81123e",
          "x-api-secret":
            "sk_aaf70bd2381732cc2789cc917a3f7f1762e0a90b345f8290e2e5ea82a1f5d4cb",
          "Content-Type": "application/json",
        },
      });
      console.log("Response:", response.data);

      setResult(response.data);
      console.log(response);
    } catch (err) {
      console.log(err);
      if (err.response) {
        setError(err.response.data);
      } else {
        setError({
          message: "Network or server error. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">NIN Verification Test</h1>

      {/* Search Type Toggle */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Search Type:</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="nin"
              checked={searchType === "nin"}
              onChange={(e) => setSearchType(e.target.value)}
              className="mr-2"
            />
            NIN Search
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="demographic"
              checked={searchType === "demographic"}
              onChange={(e) => setSearchType(e.target.value)}
              className="mr-2"
            />
            Demographic Search
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="check-ipe"
              checked={searchType === "check-ipe"}
              onChange={(e) => setSearchType(e.target.value)}
              className="mr-2"
            />
            Check IPE
          </label>
        </div>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        {searchType === "nin" ? (
          <input
            type="text"
            placeholder="Enter NIN (11 digits)"
            value={nin}
            onChange={(e) => setNin(e.target.value)}
            className="w-full p-2 border rounded"
            maxLength={11}
            required
          />
        ) : searchType === "demographic" ? (
          <div className="space-y-4">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={demographicData.first_name}
              onChange={handleDemographicChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={demographicData.last_name}
              onChange={handleDemographicChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="date"
              name="date_of_birth"
              placeholder="Date of Birth"
              value={demographicData.date_of_birth}
              onChange={handleDemographicChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="state_of_origin"
              placeholder="State of Origin"
              value={demographicData.state_of_origin}
              onChange={handleDemographicChange}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              name="lga"
              placeholder="Local Government Area (LGA)"
              value={demographicData.lga}
              onChange={handleDemographicChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        ) : (
          <input
            type="text"
            placeholder="Enter Tracking ID"
            value={trackingId}
            onChange={(e) => setTrackingId(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading
            ? "Verifying..."
            : `Verify ${
                searchType === "nin"
                  ? "NIN"
                  : searchType === "demographic"
                  ? "Demographics"
                  : "IPE"
              }`}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded">
          <strong>Error:</strong> {error.message || "Something went wrong"}
          {error.error?.description && <div>{error.error.description}</div>}
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-100 text-green-800 border border-green-300 rounded text-sm">
          <h3 className="font-bold mb-2">✅ Verification Successful</h3>
          <p>
            <strong>Full Name:</strong>{" "}
            {result.data?.personal_information?.full_name}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {result.data?.personal_information?.date_of_birth}
          </p>
          <p>
            <strong>Status:</strong> {result.data?.verification_status}
          </p>
          <p className="mt-2 text-xs text-gray-600">
            Request ID: {result.meta?.request_id}
          </p>
        </div>
      )}
    </div>
  );
};

export default NinVerificationPage;
