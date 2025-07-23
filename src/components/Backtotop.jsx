import { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button if scroll is beyond 100px, otherwise hide
      setVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="bg-amber-700 w-10 h-10 rounded-full flex justify-center items-center fixed bottom-5 right-5 cursor-pointer z-50"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Back to Top"
    >
      <FaArrowUp className="text-white text-xl" />
    </div>
  );
}

export default BackToTop;
