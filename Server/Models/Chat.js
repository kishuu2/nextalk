const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isDelivered: {
        type: Boolean,
        default: false
    }
});

const chatSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Users',
        required: true
    }],
    messages: [messageSchema],
    lastMessage: {
        type: String,
        default: ''
    },
    lastMessageTime: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ 'messages.timestamp': -1 });

// Update the updatedAt field before saving
chatSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Method to get chat between two users
chatSchema.statics.findChatBetweenUsers = function(userId1, userId2) {
    return this.findOne({
        participants: { $all: [userId1, userId2] }
    }).populate('participants', 'name username image');
};

// Method to add message to chat
chatSchema.methods.addMessage = function(senderId, receiverId, message, messageType = 'text') {
    const newMessage = {
        senderId,
        receiverId,
        message,
        messageType,
        timestamp: new Date(),
        isRead: false,
        isDelivered: true
    };
    
    this.messages.push(newMessage);
    this.lastMessage = message;
    this.lastMessageTime = new Date();
    
    return this.save();
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
