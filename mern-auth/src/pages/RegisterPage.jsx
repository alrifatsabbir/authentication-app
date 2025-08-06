import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

const RegisterPage = () => {
  const [formState, setFormState] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });

  const [otp, setOtp] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const container = useRef(null);
  const errorRef = useRef(null);
  const backgroundRef = useRef(null);
  const navigate = useNavigate();

  useGSAP(() => {
    gsap.from(container.current, {
      opacity: 0,
      y: 100,
      duration: 1,
      ease: 'power3.out',
    });

    gsap.from('.register-form-element', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.5,
    });
  }, { scope: container });

  useGSAP(() => {
    if (isRegistered) {
      gsap.from('.otp-form-element', {
        opacity: 0,
        y: 50,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out',
      });
    }

    if (error) {
      gsap.fromTo(
        errorRef.current,
        { x: -10 },
        {
          x: 10,
          duration: 0.07,
          repeat: 5,
          yoyo: true,
          ease: 'sine.inOut',
          clearProps: 'transform',
        }
      );
    }
  }, [isRegistered, error]);

  useGSAP(() => {
    const circles = gsap.utils.toArray('.bg-circle');
    const tl = gsap.timeline({ repeat: -1, yoyo: true });

    tl.to(circles, {
      scale: () => 1 + Math.random() * 0.3,
      x: (i) => (i % 2 === 0 ? 30 : -30),
      y: (i) => (i % 2 === 0 ? -20 : 20),
      rotate: () => gsap.utils.random(-20, 20),
      opacity: 0.6,
      duration: 6,
      ease: 'power1.inOut',
      stagger: { amount: 2, from: 'random' },
    });

    gsap.to(circles, {
      filter: 'hue-rotate(360deg)',
      duration: 20,
      repeat: -1,
      ease: 'none',
    });

    const moveWithMouse = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;

      gsap.to(circles, {
        x: (i) => x * (i + 1) * 0.1,
        y: (i) => y * (i + 1) * 0.1,
        duration: 1,
        ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', moveWithMouse);
    return () => window.removeEventListener('mousemove', moveWithMouse);
  }, { scope: backgroundRef });

  const handleChange = (e) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await authService.register(
        formState.name,
        formState.username,
        formState.email,
        formState.password
      );
      setMessage('Registration successful! Please check your email for the OTP.');

      const tl = gsap.timeline({
        onComplete: () => setIsRegistered(true),
      });

      tl.to('.register-form-element', {
        opacity: 0,
        y: -50,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power2.in',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during registration.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await authService.verifyOtp(otp, formState.email);
      setMessage('Email verified successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid OTP. Please try again.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-100 p-4 overflow-hidden">
      <div ref={backgroundRef} className="absolute inset-0 z-0 overflow-hidden">
        <div className="bg-circle absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-50 blur-3xl z-10"></div>
        <div className="bg-circle absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-tr from-pink-400 to-pink-600 opacity-40 blur-3xl z-20"></div>
        <div className="bg-circle absolute top-1/2 left-1/2 w-72 h-72 rounded-full bg-gradient-to-bl from-purple-400 to-purple-600 opacity-60 blur-3xl transform -translate-x-1/2 -translate-y-1/2 z-30"></div>
      </div>

      <div ref={container} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md relative z-10">
        {!isRegistered ? (
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 register-form-element">
            Create an Account
          </h2>
        ) : (
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 otp-form-element">
            Verify Your Email
          </h2>
        )}

        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p ref={errorRef} className="text-red-600 text-center mb-4">{error}</p>}

        {!isRegistered ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="register-form-element">
              <input
                type="text"
                name="name"
                value={formState.name}
                onChange={handleChange}
                placeholder="Full Name"
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="register-form-element">
              <input
                type="text"
                name="username"
                value={formState.username}
                onChange={handleChange}
                placeholder="Username"
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="register-form-element">
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="register-form-element">
              <input
                type="password"
                name="password"
                value={formState.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors register-form-element"
            >
              Register
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <p className="text-center text-gray-600 otp-form-element">
              An OTP has been sent to your email. Please enter it below.
            </p>
            <br />
            <br />
            <div
              className="otp-form-element"
              style={{ display: 'block', visibility: 'visible', opacity: 1 }}
            >
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
                className="w-full px-4 py-2 border rounded-md text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors otp-form-element"
                  style={{ opacity: 1, visibility: 'visible', display: 'block' }}
              >
              Verify OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
