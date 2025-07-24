import * as React from "react";
import axios from "axios";
import { config } from "../../../config/config.jsx";
import CryptoJS from "crypto-js";
import { format, formatDistanceToNow, differenceInMinutes } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  ArrowsUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/solid";
import { Empty, Modal, Tooltip } from "antd";
import { InboxOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons"; // Added ReloadOutlined
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Add toast import
import Swal from "sweetalert2"; // Add Swal import

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

// Add this helper function at the top of the file
const formatDate = (dateString) => {
  try {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "N/A" : format(date, "dd/MM/yyyy HH:mm:ss");
  } catch (error) {
    return "N/A";
  }
};

export default function VerificationsHistoryTable() {
  const navigate = useNavigate();

  // Get encrypted user data from localStorage
  const encryptedUser = localStorage.getItem("user");
  const user = decryptData(encryptedUser);
  const userId = user?._id || user?.id;

  // Set the API link using the userId
  const apiLink = `${config.apiBaseUrl}${config.endpoints.VerificationHistory}${userId}`;

  const [loading, setLoading] = React.useState(false);
  const [apiData, setApiData] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [startDate, setStartDate] = React.useState(null);
  const [endDate, setEndDate] = React.useState(null);
  const [sortConfig, setSortConfig] = React.useState({
    key: "createdAt",
    direction: "desc",
  });
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState(null);
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [refreshingStatus, setRefreshingStatus] = React.useState({}); // Add state for tracking refresh status

  // Update handleViewStatus function
  const handleViewStatus = async (transaction) => {
    try {
      // Show confirmation dialog first
      const result = await Swal.fire({
        title: "Refresh IPE Status",
        text: "Do you want to fetch the latest status for this transaction?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#f59e0b",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, refresh",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        return; // User cancelled
      }

      // Get user ID from localStorage
      let userId = null;
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userObj = decryptData(userStr);
          userId = userObj?._id || userObj?.id;
        }
      } catch (error) {
        console.error("Error getting user ID:", error);
      }

      if (!userId) {
        toast.error("User not found. Please login again.");
        return;
      }

      // Extract tracking ID from transaction data
      const trackingId =
        transaction.data?.data?.raw_data?.old_tracking_id ||
        transaction.data?.data?.raw_data?.newTracking_id ||
        transaction.data?.data?.raw_data?.tracking_id ||
        transaction.data?.old_tracking_id ||
        transaction.data?.newTracking_id ||
        transaction.data?.tracking_id;

      if (!trackingId) {
        toast.error("No tracking ID found for this transaction.");
        return;
      }

      const payload = {
        trackingId: trackingId,
        userId: userId,
      };
      console.log("IPE Payload", payload);

      // Set loading state for this specific transaction
      setRefreshingStatus((prev) => ({ ...prev, [transaction._id]: true }));

      // Trigger the free status IPE endpoint
      const response = await axios.post(
        `${config.apiBaseUrl}${config.endpoints.freeStatusipe}`,
        payload,
        { withCredentials: true }
      );

      // Show success message
      toast.success("Status updated successfully!");

      // Refresh the current page data
      await fetchVerificationHistory();
    } catch (error) {
      console.error("Error triggering free status IPE:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch latest status. Please try again."
      );
    } finally {
      // Remove loading state for this transaction
      setRefreshingStatus((prev) => {
        const newState = { ...prev };
        delete newState[transaction._id];
        return newState;
      });
    }
  };

  const fetchVerificationHistory = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const response = await axios.get(apiLink, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("API Response:", response.data);

      const details = response.data || [];
      setSelectedTransaction(details || []);
    } catch (error) {
      console.error("Error fetching verification history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update the filteredTransactions logic
  const filteredTransactions = apiData.filter((transaction) => {
    // First filter for IPE-Slip only
    if (transaction.dataFor !== "IPE-Slip") return false;

    const searchStr = searchTerm.toLowerCase();
    const transactionDate = new Date(transaction.createdAt);

    // Date filter with validation
    const passesDateFilter =
      (!startDate || !isNaN(transactionDate.getTime())) &&
      (!startDate || transactionDate >= startDate) &&
      (!endDate || transactionDate <= endDate);

    // Text search filter for IPE specific fields
    const passesSearchFilter =
      transaction.data?.message?.toLowerCase().includes(searchStr) ||
      transaction.data?.reply?.name?.toLowerCase().includes(searchStr) ||
      transaction.data?.newNIN?.toLowerCase().includes(searchStr) ||
      transaction.data?.newTracking_id?.toLowerCase().includes(searchStr) ||
      transaction.data?.old_tracking_id?.toLowerCase().includes(searchStr) ||
      transaction.data?.verificationStatus?.toLowerCase().includes(searchStr);

    return passesDateFilter && passesSearchFilter;
  });

  const sortData = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      if (sortConfig.key === "createdAt") {
        const dateA = new Date(a[sortConfig.key]);
        const dateB = new Date(b[sortConfig.key]);

        // Handle invalid dates
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;

        return sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  // Create a reusable header component
  const TableHeader = ({ label, sortKey, className }) => {
    const isSorted = sortConfig.key === sortKey;
    const icon = isSorted ? (
      sortConfig.direction === "asc" ? (
        <ArrowUpIcon className="w-4 h-4 text-blue-600" />
      ) : (
        <ArrowDownIcon className="w-4 h-4 text-blue-600" />
      )
    ) : (
      <ArrowsUpDownIcon className="w-4 h-4 text-gray-400" />
    );

    return (
      <th
        scope="col"
        className={`${className} cursor-pointer hover:bg-gray-50`}
        onClick={() => sortKey && sortData(sortKey)}
      >
        <div className="flex items-center justify-between">
          <span>{label}</span>
          <span className="ml-2">{icon}</span>
        </div>
      </th>
    );
  };

  const handleViewSlip = (transaction) => {
    const slipType = transaction.slipLayout;
    const verificationType = transaction.verifyWith;
    const apiData = transaction.data?.data;
    console.log("Transaction Data:", apiData);
    if (verificationType === "nin") {
      navigate("/dashboard/verifications/ninslip", {
        state: { userData: transaction.data?.nin_data },
      });
    } else if (verificationType === "bvn") {
      if (slipType === "Basic") {
        navigate("/dashboard/verifications/basicbvn", {
          state: { apiData: transaction.data?.data },
        });
      } else {
        navigate("/dashboard/verifications/advancedbvn", {
          state: { apiData: transaction.data?.data?.data },
        });
      }
    }
  };

  React.useEffect(() => {
    fetchVerificationHistory();
  }, [userId]);

  // Add console logs for debugging
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(apiLink, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("Raw API Response:", response.data);
        const details = response.data?.findData || [];

        // Log IPE-Slip specific transactions
        const ipeSlips = details.filter((item) => item.dataFor === "IPE-Slip");
        console.log("IPE-Slip Transactions:", ipeSlips);

        setApiData(details || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, apiLink]);

  const sortedTransactions = getSortedData(filteredTransactions);

  // Pagination logic
  const paginatedData = sortedTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(sortedTransactions.length / pageSize);

  // Add this function before the return statement
  const showModal = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalVisible(true);
  };

  return (
    <div className="p-4 w-full">
      <h2 className="text-[clamp(1.2rem,2vw,2rem)] font-bold mb-4">
        IPE Transaction History
      </h2>

      {/* Search and Date Filter Controls */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search transactions..."
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          placeholderText="Start Date"
          className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          dateFormat="dd/MM/yyyy"
          isClearable
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          placeholderText="End Date"
          className="p-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          dateFormat="dd/MM/yyyy"
          isClearable
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500 text-lg">
            Loading IPE transaction history...
          </p>
        </div>
      ) : !loading && sortedTransactions.length > 0 ? (
        <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow">
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <table className="w-full table-auto divide-y divide-gray-200 transition-all duration-300 ease-in-out">
              <thead className="bg-gray-50">
                <tr>
                  <TableHeader
                    label="Date"
                    sortKey="createdAt"
                    className="w-[clamp(80px,15vw,112px)] px-2 py-2 text-left text-[clamp(0.65rem,1vw,0.75rem)] font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                  />
                  <TableHeader
                    label="Status"
                    sortKey="status"
                    className="w-[100px] px-2 py-2 text-left text-[clamp(0.65rem,1vw,0.75rem)] font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200"
                  />
                  <th className="w-[60px] px-2 py-2 text-left text-[clamp(0.65rem,1vw,0.75rem)] font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Tracking ID
                  </th>
                  <th className="w-[60px] px-2 py-2 text-left text-[clamp(0.65rem,1vw,0.75rem)] font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Details
                  </th>
                  <th className="w-[60px] px-2 py-2 text-left text-[clamp(0.65rem,1vw,0.75rem)] font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                    Refresh Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((transaction, index) => (
                  <tr
                    key={transaction._id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="w-[clamp(80px,15vw,112px)] px-2 py-2 whitespace-nowrap text-[clamp(0.8rem,1vw,0.75rem)] text-gray-900">
                      {formatDate(transaction.createdAt)}
                    </td>
                    <td className="w-[100px] px-2 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {transaction.data?.data?.raw_data?.transactionStatus ||
                          "completed"}
                      </span>
                    </td>
                    <td className="w-[100px] px-2 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                        {transaction.data?.data?.raw_data?.newTracking_id ||
                          "N/A"}
                      </span>
                    </td>
                    <td className="w-[60px] px-2 py-2 whitespace-nowrap">
                      <button
                        onClick={() => showModal(transaction)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <EyeOutlined className="text-lg" />
                      </button>
                    </td>
                    <td className="w-[60px] px-2 py-2 whitespace-nowrap">
                      <Tooltip title="Refresh IPE Status">
                        <button
                          onClick={() => handleViewStatus(transaction)}
                          disabled={refreshingStatus[transaction._id]}
                          className={`transition-colors ${
                            refreshingStatus[transaction._id]
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-amber-600 hover:text-amber-800"
                          }`}
                        >
                          <ReloadOutlined
                            className={`text-lg ${
                              refreshingStatus[transaction._id]
                                ? "animate-spin"
                                : ""
                            }`}
                          />
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            imageStyle={{ height: 60 }}
            description={
              <div className="text-center">
                <p className="text-gray-500 text-lg mb-2">
                  No Transaction Records Found
                </p>
                <p className="text-gray-400 text-sm">
                  Your transaction history will appear here
                </p>
              </div>
            }
          />
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && sortedTransactions.length > 0 && (
        <div className="mt-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Rows per page and showing entries */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 whitespace-nowrap">
                Rows per page:
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded-md px-2 py-1 text-sm transition-colors duration-200 ease-in-out hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <span className="text-sm text-gray-700 text-center sm:text-left">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, sortedTransactions.length)} of{" "}
              {sortedTransactions.length} entries
            </span>
          </div>

          {/* Pagination buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 min-w-[80px] ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Previous
            </button>

            <div className="flex flex-wrap items-center gap-1 max-w-[calc(100vw-2rem)] overflow-x-auto">
              {totalPages <= 7 ? (
                // Show all pages if total pages are 7 or less
                [...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-1 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 ${
                      currentPage === i + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))
              ) : (
                // Show truncated pagination for more than 7 pages
                <>
                  {[...Array(Math.min(3, totalPages))].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 ${
                        currentPage === i + 1
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  {currentPage > 4 && <span className="px-2">...</span>}
                  {currentPage > 3 && currentPage < totalPages - 2 && (
                    <button className="px-3 py-1 rounded-md bg-blue-500 text-white">
                      {currentPage}
                    </button>
                  )}
                  {currentPage < totalPages - 3 && (
                    <span className="px-2">...</span>
                  )}
                  {[...Array(Math.min(2, totalPages))].map((_, i) => (
                    <button
                      key={totalPages - 1 + i}
                      onClick={() => setCurrentPage(totalPages - 1 + i)}
                      className={`px-3 py-1 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 ${
                        currentPage === totalPages - 1 + i
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {totalPages - 1 + i}
                    </button>
                  ))}
                </>
              )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md transition-all duration-200 ease-in-out transform hover:scale-105 min-w-[80px] ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal
        title="Verification Details"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedTransaction && (
          <div className="space-y-4">
            {selectedTransaction.dataFor === "IPE-Slip" ? (
              // IPE-Slip specific details
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedTransaction.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className="mt-1 text-sm font-medium capitalize px-2 py-0.5 rounded-full inline-block bg-green-100 text-green-800">
                    {selectedTransaction.data?.data?.raw_data
                      ?.transactionStatus || "N/A"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.data?.data?.raw_data.reply?.name ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.data?.data?.raw_data.reply?.dob ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">New NIN</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.data?.data?.raw_data?.newNIN || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    New Tracking ID
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.data?.data?.raw_data?.newTracking_id ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Old Tracking ID
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.data?.data?.raw_data
                      ?.old_tracking_id || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Message</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.data?.message || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              // Existing modal content for other verification types
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Date</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedTransaction.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data For</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.dataFor}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Verification Type
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.verifyWith}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className="mt-1 text-sm font-medium capitalize px-2 py-0.5 rounded-full inline-block bg-blue-100 text-blue-800">
                    {selectedTransaction.data?.verification?.status || "N/A"}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Reference</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.data?.verification?.reference || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Endpoint</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.data?.endpoint_name || "N/A"}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">
                    Response Detail
                  </p>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedTransaction.data?.detail || "N/A"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
