import React from "react";
import { NavLink } from "react-router-dom";
import { IoCopyOutline } from "react-icons/io5";
import { MdLockClock } from "react-icons/md";
import { FaFingerprint } from "react-icons/fa";

const serviceItems = [
  {
    title: "NIN SLIP",
    description: "National Identification Number Verification",
  },
  {
    title: "CAC SLIP",
    description: "Cooperate Affairs Commission Verification",
  },
  {
    title: "Driver Lincense",
    description: "Driver Lincense Verification",
  },
  {
    title: "BVN SLIP",
    description: "Bank Verification Number Slip",
  },
  {
    title: "Voters Card",
    description: "National Electoral Commission Verification",
  },
  {
    title: "International Passport",
    description: "International Passport Verification",
  },
];
const iconMap = {
  IoCopyOutline: <IoCopyOutline />,
  MdLockClock: <MdLockClock />,
  FaFingerprint: <FaFingerprint />,
};

const data = {
  sectionTitle: "What we do",
  mainHeading: "What We Offer To Highest Quality Services",
  services: [
    {
      title: "Secure Identity Verification",
      icon: "IoCopyOutline",
      description:
        "Ensures the authenticity of users through a multi-layered verification process, enhancing security and trust.",
    },
    {
      title: "Real-time Authentication",
      icon: "MdLockClock",
      description:
        "Offers instant validation of documents, including IDs, passports, and other crucial paperwork, to prevent fraudulent activities.",
    },
    {
      title: "Biometric Verification",
      icon: "FaFingerprint",
      description:
        "Utilizes advanced biometric technology such as facial recognition or fingerprint scanning for accurate and reliable user authentication.",
    },
  ],
};
function Services() {
  return (
    <div>
      <div className="max-w-[1500px] mx-auto ">
        <div className=" py-20">
          <h4 className="text-amber-600 text-center text-xl">
            {data.sectionTitle}
          </h4>
          <h1 className=" dark:text-white text-center text-2xl md:text-4xl font-bold max-w-[70%] mx-auto py-8">
            {data.mainHeading}
          </h1>
          <div className="flex justify-center flex-col md:flex-row gap-20 max-w-[90%] mx-10 md:mx-20">
            {data.services.map((service, index) => (
              <div
                key={index}
                className="group flex flex-col items-center text-center"
              >
                <div className="flex justify-center items-center bg-white rounded-full w-23 h-23 transition duration-300 group-hover:bg-amber-600">
                  <p className="text-amber-600 text-4xl transition duration-300 group-hover:text-white">
                    {iconMap[service.icon]}
                  </p>
                </div>
                <h4 className="text-[20px] font-bold my-3 cursor-pointer dark:text-white hover:text-amber-600">
                  {service.title}
                </h4>
                <p className="text-gray-500 dark:text-gray-200 text-[14px]">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
        <hr className="text-black dark:text-white" />
        <div className="">
          <div className="flex justify-start flex-col md:flex-row items-start gap-10 md:gap-20 md:justify-center py-10 md:py-20 max-w-[90%] mx-10 md:mx-20 ">
            <div className="flex-1/2">
              <p className="text-amber-600 text-sm ">SERVICES</p>
              <h1 className="font-bold text-3xl dark:text-white">
                Empowering Trust through Reliable Verification.
              </h1>
            </div>
            <div className="flex-1/2 max-w-3/4">
              <p className="text-gray-500 dark:text-gray-200 text-sm ">
                Ensures the authenticity of users through a multi-layered
                verification process, enhancing security and trust.
              </p>
            </div>
          </div>
          <div className=" pb-20">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-20">
              {serviceItems.map((item, index) => (
                <div key={index} className="group flex items-start gap-4 ">
                  <div className="flex justify-center items-center w-14 h-14 rounded-full bg-gray-100 transition group-hover:bg-amber-600">
                    <IoCopyOutline className="w-8 h-8 text-amber-600 group-hover:text-white transition" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[16px] dark:text-white group-hover:text-amber-600">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
