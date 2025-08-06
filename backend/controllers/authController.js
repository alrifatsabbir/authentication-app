import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Otp } from '../models/Otp.js';
import { sendOTPEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';
import EmailToken from '../models/emailToken.js';

// Register a new user
export const register = async (req, res) => {
  const { name, username, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Email already in use' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, username, email, password: hashed });

  const token = crypto.randomBytes(32).toString('hex');
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await EmailToken.create({ userId: user._id, token, otp: otpCode, expiresAt });

  const link = `http://localhost:3000/verify-email?token=${token}&id=${user._id}`;

  await sendOTPEmail(email, `
    Click to verify: ${link}
    Or enter this OTP code: ${otpCode}
  `);

  res.json({ message: 'Account created. Please check your email for the verification link or OTP.' });
};

// Login an existing user
export const login = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  if (!user.isVerified) {
    return res.status(403).json({ message: 'Please verify your email before logging in.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1d' });

  // ✅ CORRECTED LINE: Return the token AND the user data
  res.json({ token, user: { id: user._id, username: user.username, email: user.email, name: user.name } });
};

// Delete a user
export const deleteUser = async (req, res) => {
  try {
    const username = req.user.username; // ⬅️ from token

    const deletedUser = await User.findOneAndDelete({ username });

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const username = req.params.username;

    const user = await User.findOne({ username }).select('-password'); // hide password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Request OTP for password reset
export const requestOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({ email, otp: otpCode, expiresAt });
    await sendOTPEmail(email, otpCode);

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Error sending OTP', error: error.message });
  }
};

// ✅ Verify OTP for password reset
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ msg: 'Email and OTP are required.' });
  }

  try {
    const record = await Otp.findOne({ email, otp });

    if (!record) {
      return res.status(400).json({ msg: 'Invalid OTP.' });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ msg: 'OTP has expired.' });
    }

    // OTP verified, delete it now
    await Otp.deleteOne({ email, otp });

    // Generate a reset token (JWT), valid for 15 minutes (adjust as needed)
    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({ msg: 'OTP verified successfully.', resetToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// ✅ Reset Password
export const resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const hashed = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate({ email }, { password: hashed });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Reset token expired' });
    }
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

// Verify by linkN
export const verifyEmailByLink = async (req, res) => {
  const { token, id } = req.query;

  const record = await EmailToken.findOne({ userId: id, token });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired verification link' });
  }

  await User.findByIdAndUpdate(id, { isVerified: true });
  await EmailToken.deleteMany({ userId: id });

  res.json({ message: 'Email verified successfully via link' });
};

// Verify by OTP
export const verifyEmailByOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const record = await EmailToken.findOne({ userId: user._id, otp });
  if (!record || record.expiresAt < new Date()) {
    return res.status(400).json({ message: 'Invalid or expired OTP' });
  }

  await User.findByIdAndUpdate(user._id, { isVerified: true });
  await EmailToken.deleteMany({ userId: user._id });

  res.json({ message: 'Email verified successfully via OTP' });
};

// Resend OTP
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ msg: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (user.isVerified) {
      return res.status(400).json({ msg: 'Email is already verified' });
    }

    const existingToken = await EmailToken.findOne({ userId: user._id });

    // Delete if expired or create new one
    if (existingToken && existingToken.expiresAt > new Date()) {
      return res.status(400).json({ msg: 'OTP already sent. Try again after a few minutes.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete previous token if exists
    if (existingToken) {
      await EmailToken.deleteOne({ _id: existingToken._id });
    }

    const newToken = new EmailToken({
      userId: user._id,
      otp,
      expiresAt
    });

    await newToken.save();
    await sendOTPEmail(user.email, otp);

    res.status(200).json({ msg: 'OTP resent successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};