/*
* This is a service for handling user authentication.
* It provides functions to register a new user.
* It uses axios to make HTTP requests to the backend API.
* The API URL is set to 'http://localhost:3000'.
* The register function sends a POST request with user details.
* It expects the backend to handle the registration logic.
* The function returns the axios promise for further handling.
* It has part called register, verifyOTP, login, logout, and getCurrentUser.
*/

import axios from 'axios';

const API_URL = 'https://auth-app-0iwu.onrender.com';

const register = (name, username, email, password) => {
    return axios.post(API_URL + '/register', {
        name,
        username,
        email,
        password
    });
}
const verifyOtp = (otp, email) => {
  return axios.post(API_URL + '/verify-email-otp', {
    otp,
    email
  });
};
const login = (username, password) => {
  return axios.post(API_URL + '/login', {
    username,
    password,
  }).then((response) => {
    // If the login is successful, store the token and user data in local storage
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  });
};
const logout = () => {
  localStorage.removeItem('user');
};
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const getProtectedProfile = (username) => {
  const user = getCurrentUser();
  if (!user || !user.token) {
    throw new Error('User is not authenticated.');
  }

  return axios.get(`${API_URL}/profile/${username}`, {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  });
};

// Forgotten Password Service
const requestOtp = (email) => {
  return axios.post(API_URL + '/request-otp', { email });
};

// Add this function to send the OTP and new password
const resetPassword = (email, otp, newPassword) => {
  return axios.post(API_URL + '/reset-password', { email, otp, newPassword });
};

const authService = {
  register,
  verifyOtp,
  login,
  logout,
  getCurrentUser,
  getProtectedProfile,
  requestOtp,
  resetPassword,
};

export default authService;