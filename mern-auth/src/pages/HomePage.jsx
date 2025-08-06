import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';

// We'll create a mock authService to simulate the check
// In a real app, this would be your actual authService.
const authService = {
  // This function simulates checking if a user is logged in
  isLoggedIn: () => {
    // Replace this with your actual logic, e.g.,
    // return localStorage.getItem('userToken') !== null;
    return localStorage.getItem('user') !== null;
  }
};

const HomePage = () => {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const buttonRef = useRef(null);
  const bgRef = useRef(null);
  
  // NEW: State to store the authentication status
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // NEW: Effect to check for authentication on component mount
  useEffect(() => {
    setIsLoggedIn(authService.isLoggedIn());
  }, []);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Background gradient animation
      gsap.to(bgRef.current, {
        background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
        duration: 2,
        ease: "power2.inOut",
      });

      // Container fade-in
      gsap.from(containerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power2.out",
      });

      // Title bounce-in
      gsap.from(titleRef.current, {
        y: 80,
        opacity: 0,
        duration: 1.2,
        ease: "bounce.out",
      });

      // Description fade-in with slight left slide
      gsap.from(descriptionRef.current, {
        x: -60,
        opacity: 0,
        duration: 1,
        delay: 0.5,
        ease: "power3.out",
      });

      // Button pop-in with pulse effect
      gsap.from(buttonRef.current, {
        scale: 0.7,
        opacity: 0,
        duration: 0.8,
        delay: 1,
        ease: "back.out(2)",
      });
      gsap.to(buttonRef.current, {
        scale: 1.05,
        repeat: -1,
        yoyo: true,
        duration: 0.8,
        delay: 2,
        ease: "power1.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isLoggedIn]); // NEW: Add isLoggedIn to dependency array

  return (
    <div
      ref={bgRef}
      className="min-h-screen flex flex-col items-center justify-center text-center p-6"
      style={{
        background: "linear-gradient(135deg, #111827 0%, #1e293b 100%)",
        transition: "background 1s",
      }}
    >
      <div
        ref={containerRef}
        className="main flex flex-col items-center justify-center text-white"
      >
        <h1 ref={titleRef} className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg">
          Welcome guest, this is an AUTHENTICATE APP.
        </h1>
        <p ref={descriptionRef} className="text-lg md:text-xl max-w-2xl mb-8 opacity-80">
          Discover the power of the MERN stack with modern authentication, sleek design, and fluid animations.
          Join us on this journey to build secure and scalable web applications with ease.
        </p>
        <button
          ref={buttonRef}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 transform opacity-90 scale-95 shadow-xl"
        >
          {/* NEW: Conditional Link */}
          <Link
            to={isLoggedIn ? "/profile" : "/login"}
            className="no-underline text-white"
          >
            Get Started
          </Link>
        </button>
      </div>
    </div>
  );
};

export default HomePage;