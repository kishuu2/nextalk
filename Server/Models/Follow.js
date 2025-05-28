const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }, // who sends request
  followee: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' }, // who receives request
  status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
  followedAt: { type: Date, default: Date.now }
});



// Add a virtual to return formatted 12-hour time
followSchema.virtual('followTime').get(function () {
    const date = new Date(this.followedAt);
    const options = {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'Asia/Kolkata' // or your desired timezone
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
});

// Include virtuals when converting to JSON
followSchema.set('toJSON', { virtuals: true });
followSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model("Follow", followSchema);
