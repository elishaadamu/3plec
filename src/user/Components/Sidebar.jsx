import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // <-- import useNavigate
import Logo from "../assets/images/logo-3plec.png";
import {
  FiHome,
  FiPhone,
  FiKey,
  FiLogOut,
  FiSettings,
  FiFileText,
  FiClock,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  FaFlag,
  FaBuilding,
  FaCar,
  FaIdBadge,
  FaLeaf,
  FaSimCard,
} from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";

import { RiPassportFill } from "react-icons/ri";
import { MdHistory } from "react-icons/md";
import { IoEnterSharp } from "react-icons/io5";
import { MdOutlineSubscriptions } from "react-icons/md";
import { MdContactPhone } from "react-icons/md";
import { FaPersonCircleCheck } from "react-icons/fa6";
import { MdDataThresholding } from "react-icons/md";
import { FaPhone } from "react-icons/fa";
import { MdLocationSearching } from "react-icons/md";
import { GrValidate } from "react-icons/gr";
import { VscVerified } from "react-icons/vsc";
import { Menu, Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";

const sidebarSections = [
  {
    section: "",
    links: [
      {
        to: "/dashboard",
        icon: <FiHome className="w-5 h-5" />,
        label: "Dashboard",
        end: true, // <-- add this property
      },
    ],
  },
  {
    section: "SERVICES",
    links: [
      {
        to: "/dashboard/verifications/nin",
        icon: <FaFlag className="w-5 h-5" />,
        label: "NIN Verification",
      },
      {
        to: "/dashboard/verifications/pvn",
        icon: <FiPhone className="w-5 h-5" />,
        label: "NIN With Phone",
      },
      {
        to: "/dashboard/modification",
        icon: <RiPassportFill className="w-5 h-5" />,
        label: "NIN Modification",
      },
      {
        to: "/dashboard/verifications/bvn",
        icon: <FaSimCard className="w-5 h-5" />,
        label: "BVN Verification",
      },
      {
        to: "/dashboard/enrollment",
        icon: <IoEnterSharp className="w-5 h-5" />,
        label: "Enrollment",
      },
      {
        to: "/dashboard/cac",
        icon: <FaIdBadge className="w-5 h-5" />,
        label: "CAC Registration",
      },
      {
        to: "/dashboard/bank-agency",
        icon: <FaBuilding className="w-5 h-5" />,
        label: "Banking Agency",
      },
      {
        to: "/dashboard/bvn-licence",
        icon: <FaCar className="w-5 h-5" />,
        label: "BVN Licence",
      },
      {
        to: "/dashboard/ipe-clearance",
        icon: <FaPersonCircleCheck className="w-5 h-5" />,
        label: "IPE Clearance",
      },
      {
        to: "/dashboard/check-ipe-status",
        icon: <FaListCheck className="w-5 h-5" />,
        label: "IPE Clearance Check Status",
      },
      {
        to: "/dashboard/personalisation",
        icon: <FaLeaf className="w-5 h-5" />,
        label: "Personalisation",
      },
      {
        to: "/dashboard/demographic-search",
        icon: <MdLocationSearching className="w-5 h-5" />,
        label: "Demographic Search",
      },
      {
        to: "/dashboard/validation",
        icon: <GrValidate className="w-5 h-5" />,
        label: "Validation",
      },
      {
        to: "/dashboard/data",
        icon: <MdOutlineSubscriptions className="w-5 h-5" />,
        label: "Data Subscription",
      },
      {
        to: "/dashboard/airtime",
        icon: <MdContactPhone className="w-5 h-5" />,
        label: "Airtime Subscription",
      },
    ],
  },
  {
    section: "SUMMARY AND HISTORY",
    links: [
      {
        isDropdown: true,
        icon: <FiClock className="w-5 h-5" />,
        label: "History",
        items: [
          {
            key: "all",
            to: "/dashboard/all-history",
            icon: <FiClock className="w-5 h-5" />,
            label: "All History",
          },
          {
            key: "funding",
            to: "/dashboard/fundinghistory",
            icon: <FiFileText className="w-5 h-5" />,
            label: "Funding History",
          },
          {
            key: "bvn",
            to: "/dashboard/bvnhistory",
            icon: <VscVerified className="w-5 h-5" />,
            label: "BVN History",
          },
          {
            key: "nin",
            to: "/dashboard/ninhistory",
            icon: <MdHistory className="w-5 h-5" />,
            label: "NIN History",
          },
          {
            key: "data",
            to: "/dashboard/data-history",
            icon: <MdDataThresholding className="w-5 h-5" />,
            label: "Data History",
          },
          {
            key: "airtime",
            to: "/dashboard/airtime-history",
            icon: <FaPhone className="w-5 h-5" />,
            label: "Airtime History",
          },
          {
            key: "ipe",
            to: "/dashboard/ipe-history",
            icon: <FaPersonCircleCheck className="w-5 h-5" />,
            label: "IPE Clearance History",
          },
        ],
      },
    ],
  },
  {
    section: "DEVELOPER AND SECURITY",
    links: [
      {
        to: "/dashboard/api-documentation",
        icon: <FiKey className="w-5 h-5" />,
        label: "Documentation",
      },
      {
        to: "/change-password",
        icon: <FiSettings className="w-5 h-5" />,
        label: "Change Password",
      },
      {
        to: "/dashboard/reset-pin",
        icon: <FiSettings className="w-5 h-5" />,
        label: "Reset Pin",
      },
      {
        to: "/login",
        icon: <FiLogOut className="w-5 h-5 text-red-500" />,
        label: "Sign Out",
      },
    ],
  },
];

let user = {};
try {
  user = JSON.parse(localStorage.getItem("user") || "{}");
} catch (e) {
  user = {};
}

function Sidebar({ collapsed, setCollapsed }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate(); // <-- useNavigate hook

  const handleLogout = (e) => {
    e.preventDefault(); // Prevent default link behavior
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div
      className={`sidebar custom-scrollbar fixed flex flex-col top-0 left-0 h-full shadow-lg text-amber-300 bg-gray-900 z-30
        transition-all duration-300
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* Collapse/Expand Button */}
      <button
        className="absolute cursor-pointer -right-3 top-6 z-40 hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        type="button"
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      <div className="flex items-center pl-[15px] h-20 border-b border-gray-700 transition-all duration-300">
        <NavLink to="/dashboard">
          <img
            src={Logo}
            alt="Logo"
            className={`transition-all duration-300 ${
              collapsed ? "w-10" : "w-[80px]"
            } `}
          />
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto mt-4">
        {sidebarSections.map((section, i) => (
          <div key={i} className="mb-6">
            {!collapsed && section.section && (
              <p className="px-6 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {section.section}
              </p>
            )}
            <div className="flex flex-col">
              {section.section === "VERIFICATIONS" ? (
                <>
                  {section.links.map((link, j) => {
                    // Normal links
                    return (
                      <NavLink
                        to={link.to}
                        key={j}
                        end={link.end || false} // <-- add this line
                        className={({ isActive }) =>
                          `flex items-center px-6 py-2 text-sm font-medium border-l-4 transition-colors duration-200
                          ${collapsed ? "justify-center px-0" : ""}
                          ${
                            isActive
                              ? "border-amber-400 text-amber-300 bg-gray-800"
                              : "border-transparent text-gray-300 hover:text-amber-300 hover:bg-gray-800"
                          }`
                        }
                        title={collapsed ? link.label : undefined}
                      >
                        {link.icon}
                        {!collapsed && (
                          <span className="ml-3">{link.label}</span>
                        )}
                      </NavLink>
                    );
                  })}
                </>
              ) : section.section === "SUMMARY AND HISTORY" ? (
                // Special handling for SUMMARY AND HISTORY section
                section.links.map((link, j) => {
                  if (link.isDropdown) {
                    const menu = (
                      <Menu
                        items={link.items.map((item) => ({
                          key: item.key,
                          label: (
                            <NavLink
                              to={item.to}
                              className="flex items-center text-sm font-medium"
                            >
                              {item.icon}
                              <span className="ml-3">{item.label}</span>
                            </NavLink>
                          ),
                        }))}
                        className="bg-gray-800 border border-gray-700"
                      />
                    );

                    return (
                      <Dropdown
                        key={j}
                        overlay={menu}
                        trigger={["click"]}
                        overlayClassName="history-dropdown"
                      >
                        <div
                          className={`flex items-center px-6 py-2 text-sm font-medium border-l-4 cursor-pointer
          ${collapsed ? "justify-center px-0" : ""}
          border-transparent text-gray-300 hover:text-amber-300 hover:bg-gray-800`}
                        >
                          {link.icon}
                          {!collapsed && (
                            <>
                              <span className="ml-3">{link.label}</span>
                              <DownOutlined className="ml-2" />
                            </>
                          )}
                        </div>
                      </Dropdown>
                    );
                  }
                  return null;
                })
              ) : (
                // All other sections
                section.links.map((link, j) => {
                  // For the Sign Out link
                  if (link.label === "Sign Out") {
                    return (
                      <a
                        href="/login"
                        key={j}
                        onClick={handleLogout}
                        className={`flex items-center px-6 py-2 text-sm font-medium border-l-4 transition-colors duration-200
                        ${collapsed ? "justify-center px-0" : ""}
                        border-transparent text-gray-300 hover:text-amber-300 hover:bg-gray-800`}
                        title={collapsed ? link.label : undefined}
                      >
                        {link.icon}
                        {!collapsed && (
                          <span className="ml-3">{link.label}</span>
                        )}
                      </a>
                    );
                  }
                  // All other links
                  return (
                    <NavLink
                      to={link.to}
                      key={j}
                      end={link.end || false}
                      className={({ isActive }) =>
                        `flex items-center px-6 py-2 text-sm font-medium border-l-4 transition-colors duration-200
                      ${collapsed ? "justify-center px-0" : ""}
                      ${
                        isActive
                          ? "border-amber-400 text-amber-300 bg-gray-800"
                          : "border-transparent text-gray-300 hover:text-amber-300 hover:bg-gray-800"
                      }`
                      }
                      title={collapsed ? link.label : undefined}
                    >
                      {link.icon}
                      {!collapsed && <span className="ml-3">{link.label}</span>}
                    </NavLink>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
