import mongoose from 'mongoose';

const emailTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  token: { type: String }, 
  otp: { type: String }, 
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

export default mongoose.model('EmailToken', emailTokenSchema);
