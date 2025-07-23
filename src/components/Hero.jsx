import React from "react";
import "../assets/css/heroSection.css";
import HeroImage from "../assets/images/IMG-20250515-WA0006.jpg";
import { NavLink } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="hero">
      <div
        id="heroSection"
        className="hero--section items-start mx-auto max-w-[1500px]"
      >
        <div className="hero--section--img">
          <img src={HeroImage} alt="Hero Section" />
        </div>
        <div className="hero--section--content--box">
          <div className="hero--section--content">
            <p className="text-2xl   md:text-3xl text-center lg:text-left ">
              {" "}
              WELCOME TO
              <span className="text-amber-600 ml-2">3PLEC</span>
            </p>
            <h1 className="hero--section--title text-4xl  md:text-4xl text-white dark:text-white">
              <span className="hero--section-title--color">
                Trusted, secured,
              </span>
              <br />
              fast, reliable, accurate NIN and BVN verification.
            </h1>
            <p className="text-[14px] md:text-[18px] description ">
              Trusted platform providing secure verification including Nin,Bvn
              and documents modification, Our mission is to offer reliable,fast,
              and accurate verification solutions to help you with your personal
              and business needs.
            </p>
          </div>
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center lg:justify-start"
          >
            <div className="flex gap-3">
              <NavLink
                className="consult--button w-[100px]  h-[40px] md:w-[150px]  md:h-[50px] rounded-xl bg-amber-500 text-white mt-5 font-bold text-[14px] md:text-xl hover:bg-amber-600 hover:text-amber-100 transition-all duration-500"
                to="/signup"
              >
                Signup
              </NavLink>

              <NavLink
                className="consult--button w-[100px]  h-[40px] md:w-[150px]  md:h-[50px] rounded-xl bg-[#fff]  mt-5 font-bold text-[14px] md:text-xl hover:bg-amber-600 hover:text-[#fff] transition-all duration-500"
                to="/login"
              >
                Login
              </NavLink>
            </div>
          </a>
        </div>
      </div>
      <hr className="text-black dark:text-white" />
    </section>
  );
};

export default HeroSection;
