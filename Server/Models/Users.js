// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: String,
    otpExpiresAt: { type: Date, index: { expires: 0 } },
    bio: { type: String, default: 'No bio yet.' },
    image: { type: String, default: null} // Renamed from avatar to image
}, { timestamps: true });

module.exports = mongoose.model('Users', userSchema);