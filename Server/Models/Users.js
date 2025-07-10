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
    image: { type: String, default: null}, // Renamed from avatar to image
    isOnline: { type: Boolean, default: false },
    lastSeen: { type: Date, default: Date.now },
    socketId: { type: String, default: null }
}, { timestamps: true });

// Virtual for formatted last seen time (12-hour format)
userSchema.virtual('lastSeenFormatted').get(function() {
    if (this.isOnline) return 'Online';

    const now = new Date();
    const lastSeen = new Date(this.lastSeen);
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    // Format as 12-hour time with AM/PM
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Kolkata'
    };

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
        return `Yesterday ${lastSeen.toLocaleTimeString('en-US', options)}`;
    } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
    } else {
        return lastSeen.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    }
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Users', userSchema);