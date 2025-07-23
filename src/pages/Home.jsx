// src/pages/Home.jsx
import React from "react";
import HeroSection from "../components/Hero";
import Services from "../components/Services";

const Home = () => {
  return (
    <div className=" dark:bg-[#111827]">
      <HeroSection />
      <Services />
    </div>
  );
};

export default Home;
