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
    chatSizeInBytes: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
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

// Method to calculate chat size in bytes
chatSchema.methods.calculateChatSize = function() {
    let totalSize = 0;

    this.messages.forEach(msg => {
        // Calculate size of message content
        totalSize += Buffer.byteLength(msg.message, 'utf8');
        // Add overhead for metadata (approximate)
        totalSize += 200; // senderId, receiverId, timestamp, etc.
    });

    this.chatSizeInBytes = totalSize;
    return totalSize;
};

// Method to check if chat exceeds 10MB
chatSchema.methods.exceedsLimit = function() {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    return this.chatSizeInBytes >= MAX_SIZE;
};

// Method to get chat size in human readable format
chatSchema.methods.getChatSizeFormatted = function() {
    const bytes = this.chatSizeInBytes;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Method to delete chat (soft delete)
chatSchema.methods.deleteChat = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.messages = []; // Clear messages
    this.chatSizeInBytes = 0;
    this.lastMessage = '';
    return this.save();
};

// Method to restore chat
chatSchema.methods.restoreChat = function() {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
};

// Method to add message to chat with size tracking
chatSchema.methods.addMessage = function(senderId, receiverId, message, messageType = 'text') {
    // Check if chat is deleted
    if (this.isDeleted) {
        throw new Error('Cannot add message to deleted chat');
    }

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

    // Update chat size
    this.calculateChatSize();

    return this.save();
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
