import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [formState, setFormState] = useState({
    username: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const container = useRef(null);
  const errorRef = useRef(null);
  const buttonRef = useRef(null);
  const bgRef = useRef(null);

  useGSAP(() => {
    // Animate background gradient
    gsap.fromTo(
      bgRef.current,
      { background: 'linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%)' },
      {
        background: 'linear-gradient(135deg, #93c5fd 0%, #f3f4f6 100%)',
        duration: 2,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true,
      }
    );

    gsap.from(container.current, {
      opacity: 0,
      y: 100,
      duration: 1,
      ease: 'power3.out',
    });

    gsap.from('.form-element', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power2.out',
      delay: 0.5,
    });
  }, { scope: container });

  useGSAP(() => {
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
  }, [error]);

  // Button hover animation
  const handleButtonMouseEnter = () => {
    gsap.to(buttonRef.current, {
      scale: 1.05,
      backgroundColor: '#2563eb', // darker blue
      duration: 0.2,
    });
  };

  const handleButtonMouseLeave = () => {
    gsap.to(buttonRef.current, {
      scale: 1,
      backgroundColor: '#2563eb', // original blue
      duration: 0.2,
    });
  };

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await authService.login(formState.username, formState.password);
      setMessage('Login successful! Redirecting to your profile...');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid username or password.');
    }
  };

  return (
    <div
      ref={bgRef}
      className="min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden"
      style={{ transition: 'background 0.5s' }}
    >
      <div
        ref={container}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6 form-element">
          Welcome Back
        </h2>
        
        {message && <p className="text-green-600 text-center mb-4">{message}</p>}
        {error && <p ref={errorRef} className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="form-element">
            <input
              type="text"
              name="username"
              value={formState.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="form-element">
            <input
              type="password"
              name="password"
              value={formState.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            ref={buttonRef}
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors form-element"
            onMouseEnter={handleButtonMouseEnter}
            onMouseLeave={handleButtonMouseLeave}
          >
            Log In
          </button>
          <div className="form-element text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );

};
export default LoginPage;