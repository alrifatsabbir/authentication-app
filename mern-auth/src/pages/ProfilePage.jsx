// src/pages/ProfilePage.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { gsap } from 'gsap';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const currentUser = authService.getCurrentUser();
        if (!currentUser) {
          navigate('/login');
          return;
        }

        const username = currentUser.user.username;
        const response = await authService.getProtectedProfile(username);

        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || 'Could not fetch profile data.');
        setLoading(false);
        if (err.response && err.response.status === 401) {
          authService.logout();
          navigate('/login');
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    if (!loading && !error && userData) {
      gsap.fromTo(
        cardRef.current,
        { y: 50, opacity: 0, scale: 0.8 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
        }
      );
      gsap.fromTo(
        containerRef.current,
        { background: '#fff' },
        {
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          duration: 1.2,
        }
      );
    }
  }, [loading, error, userData]);

  if (loading) {
    return (
      <div
        ref={containerRef}
        className="min-h-screen flex items-center justify-center text-xl text-gray-500"
      >
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div
        ref={containerRef}
        className="min-h-screen flex items-center justify-center text-xl text-red-600"
      >
        Error: {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-gray-100"
    >
      <div
        ref={cardRef}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">User Profile</h2>
        {userData && (
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-semibold text-blue-600">Name:</span> {userData.name}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-purple-600">Username:</span> {userData.username}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-green-600">Email:</span> {userData.email}
            </p>
            <button
              onClick={() => {
                gsap.to(cardRef.current, {
                  y: -50,
                  opacity: 0,
                  scale: 0.8,
                  duration: 0.6,
                  ease: 'power2.in',
                  onComplete: () => {
                    authService.logout();
                    navigate('/login');
                  },
                });
              }}
              className="mt-6 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;