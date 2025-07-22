const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  googleId: { type: String, ref: 'User' },
  items: [{ id: String, name: String, price: Number, quantity: Number }],
  total: Number,
  status: { type: String, enum: ['pending', 'confirmed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  otp: { type: String },
  otpExpires: { type: Date },
});

module.exports = mongoose.model('Order', orderSchema);
