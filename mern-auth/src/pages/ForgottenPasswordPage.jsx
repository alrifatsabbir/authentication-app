// src/pages/ForgottenPasswordPage.jsx

import React, { useState, useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ForgottenPasswordPage = () => {
  const container = useRef(null);
  const errorRef = useRef(null);
  
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('request-otp');
  const navigate = useNavigate();

  // Initial "Page Load" Animation
  useGSAP(() => {
    gsap.from(container.current, {
      opacity: 0,
      y: 100,
      duration: 1,
      ease: 'power3.out',
    });
    
    // Animate the initial form in
    gsap.from('.request-form-element', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.5,
    });
  }, { scope: container });

  // Animation for the transition and error shake
  useGSAP(() => {
    if (step === 'reset-password') {
      gsap.from('.reset-form-element', {
        opacity: 0,
        y: 50,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out',
      });
    }

    if (error) {
      gsap.fromTo(errorRef.current,
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
  }, [step, error]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await authService.requestOtp(email);
      setMessage(response.data.message || 'OTP sent successfully. Check your email.');

      // **Critical Change:**
      // We set the step to 'reset-password' immediately after a successful API call.
      // This will trigger the useGSAP hook to animate the new form in.
      // We don't need to wrap this in the onComplete callback of a separate animation.
      setStep('reset-password');
      
      // We can add an animation to fade out the previous form here if needed,
      // but changing the state first is more reliable.
      gsap.to('.request-form-element', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
      });

    } catch (err) {
      // If the API call fails, stay on this form and display the error
      setError(err.response?.data?.msg || 'An error occurred. Please check the email address.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await authService.resetPassword(email, otp, newPassword);
      
      setMessage('Password reset successful! Redirecting to login...');
      setError('');

      gsap.to('.reset-form-element', {
        opacity: 0,
        y: -50,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => {
          setTimeout(() => {
            navigate('/login');
          }, 500);
        },
      });
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid OTP or an error occurred. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setMessage('');
    setError('');
    try {
      const response = await authService.requestOtp(email);
      setMessage(response.data.message || 'New OTP sent successfully.');
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred. Could not resend OTP.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 overflow-hidden">
      <div ref={container} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        
        {step === 'request-otp' ? (
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 request-form-element">
            Forgot Your Password?
          </h2>
        ) : (
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 reset-form-element">
            Reset Password
          </h2>
        )}

        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p ref={errorRef} className="text-red-600 text-center mb-4">{error}</p>}

        {step === 'request-otp' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <p className="text-center text-gray-600 request-form-element">
              Enter your email address to receive a one-time password (OTP).
            </p>
            <div className="request-form-element">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Email Address" 
                required 
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors request-form-element"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <p className="text-center text-gray-600 reset-form-element">
              An OTP has been sent to {email}. Enter it below along with your new password.
            </p>
            <div className="reset-form-element">
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Enter OTP" 
                required 
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="reset-form-element">
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                placeholder="New Password" 
                required 
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors reset-form-element"
            >
              Reset Password
            </button>
            <p className="text-center mt-4 reset-form-element">
              <button 
                type="button" 
                onClick={handleResendOtp} 
                className="text-sm text-blue-600 hover:underline"
              >
                Resend OTP
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgottenPasswordPage;