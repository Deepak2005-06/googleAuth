const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  localId: { type: String, unique: true, sparse: true },
  name: String,
  email: String,
  picture: String,
  username: { type: String, unique: true, sparse: true },
  password: String, // hash if production
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
