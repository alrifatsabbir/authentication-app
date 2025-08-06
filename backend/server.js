import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
// import your routes here if needed, for example:
// import authRoutes from './routes/authRoutes.js';

// Load environment variables from the .env file
dotenv.config();

const app = express();

// Use middleware
app.use(express.json()); // To parse JSON bodies
app.use(cors()); // To handle Cross-Origin Resource Sharing

// Define the port from the .env file, with a fallback
const PORT = process.env.PORT || 3000;

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('MERN server is running!');
});

// Use your imported routes here, for example:
// app.use('/api/auth', authRoutes);


// Connect to MongoDB and start the server
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();
