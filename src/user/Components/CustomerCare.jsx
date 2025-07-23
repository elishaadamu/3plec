import React, { useState, useEffect } from "react";
import { BsWhatsapp } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";

function CustomerCare() {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const tooltipInterval = setInterval(() => {
      setShowTooltip(true);
      // Hide tooltip after 3 seconds
      setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
    }, 300000); // 300000ms = 5 minutes

    // Initial timeout to hide the tooltip after 3 seconds
    setTimeout(() => {
      setShowTooltip(false);
    }, 3000);

    // Cleanup on component unmount
    return () => {
      clearInterval(tooltipInterval);
    };
  }, []);

  const whatsappStyles = {
    icon: `bg-green-500 text-white p-4 rounded-full shadow-lg 
           hover:bg-green-600 transition-all duration-300 animate-bounce-slow`,
    tooltip: `bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg 
             absolute right-16 transform -translate-y-1/2 whitespace-nowrap
             before:content-[''] before:absolute before:right-[-10px] 
             before:top-1/2 before:-translate-y-1/2
             before:border-[10px] before:border-transparent 
             before:border-l-white`,
    modal: `fixed bottom-20 right-6 bg-white rounded-lg shadow-xl p-6 
           max-w-sm z-50 transition-all duration-300 transform mb-5
           ${
             showWhatsAppModal
               ? "opacity-100 scale-100"
               : "opacity-0 scale-95 pointer-events-none"
           }`,
  };

  const toggleWhatsAppModal = () => {
    setShowWhatsAppModal(!showWhatsAppModal);
  };

  return (
    <>
      {/* WhatsApp Button with Tooltip */}
      <div className="cursor-pointer fixed bottom-6 right-6 flex items-center space-x-2 z-50">
        {!showWhatsAppModal && showTooltip && (
          <div className={whatsappStyles.tooltip}>Message Us</div>
        )}
        <button
          onClick={toggleWhatsAppModal}
          className={whatsappStyles.icon}
          aria-label="Contact us on WhatsApp"
        >
          {showWhatsAppModal ? (
            <IoMdClose className="text-2xl" />
          ) : (
            <BsWhatsapp className="text-2xl" />
          )}
        </button>
      </div>

      {/* WhatsApp Modal */}
      <div className={whatsappStyles.modal}>
        <div className="flex flex-col space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Contact Us</h3>
          <p className="text-gray-600">Need help? Chat with us on WhatsApp!</p>
          <a
            href="https://wa.me/+2348100652955" // Replace with your WhatsApp number
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-300"
          >
            <BsWhatsapp className="text-xl" />
            <span>Chat Now</span>
          </a>
        </div>
      </div>
    </>
  );
}

export default CustomerCare;
