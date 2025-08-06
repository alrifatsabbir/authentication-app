import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js'; // Importing the auth routes

dotenv.config(); // Make sure this is BEFORE using env variables
const allowedOrigins = ['http://localhost:5173'];
const app = express();
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('MERN Auth API Running');
});
app.use('/', authRoutes); // Using the auth routes


const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB Connected');
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
});
