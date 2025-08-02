const mongoose = require('mongoose');
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const twilio = require('twilio');
const fileUpload = require("express-fileupload");
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const url = process.env.MONGO_URI;

// Import models
const Users = require('./Models/Users');
const Chat = require('./Models/Chat');


console.log('🔄 Attempting to connect to MongoDB...');
console.log('📍 MongoDB URI:', url ? 'URI found' : 'URI missing');

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB Atlas connected successfully');
  })
  .catch(err => {
    console.error('❌ Error connecting to MongoDB Atlas:', err);
    console.error('💡 Please check your MongoDB URI and network connection');
  });

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://nextalk-jouy.vercel.app",
      "http://192.168.1.3:3000",
      "https://nextalk-u0y1.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type"]
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});

console.log('🚀 Socket.IO server initialized');

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

console.log("App listen at port 5000");
const allowedOrigins = [
  "http://localhost:3000",
  "https://nextalk-jouy.vercel.app",
  "http://192.168.1.3:3000",
  "https://nextalk-u0y1.onrender.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      console.log("Request origin:", origin); // Debug origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("CORS error: Origin not allowed:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true if using HTTPS
    sameSite: 'none'
  }
}));

// Store online users
const onlineUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('🔗 New user connected with socket ID:', socket.id);

  // Handle user joining
  socket.on('join', async (userId) => {
    console.log('🔗 User attempting to join:', userId);
    if (userId) {
      socket.userId = userId;

      try {
        // Update user status in database
        await Users.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
          socketId: socket.id
        });

        onlineUsers.set(userId, {
          socketId: socket.id,
          lastSeen: new Date(),
          isOnline: true
        });

        // Broadcast user online status to all connected clients
        socket.broadcast.emit('userOnline', userId);

        // Send current online users to the newly connected user
        const onlineUserIds = Array.from(onlineUsers.keys()).filter(id =>
          onlineUsers.get(id).isOnline
        );
        socket.emit('onlineUsers', onlineUserIds);

        console.log(`✅ User ${userId} joined successfully. Online users: ${onlineUserIds.length}`);
      } catch (error) {
        console.error('❌ Error updating user online status:', error);
      }
    } else {
      console.log('❌ Join failed: No userId provided');
    }
  });

  // Handle sending messages
  socket.on('sendMessage', async (data) => {
    try {
      console.log('📨 Received sendMessage event:', data);
      const { senderId, receiverId, message, messageType = 'text' } = data;

      if (!senderId || !receiverId || !message) {
        console.error('❌ Missing required fields:', { senderId, receiverId, message });
        socket.emit('messageError', { error: 'Missing required fields' });
        return;
      }

      // Check if this is a test message (non-ObjectId users)
      const isTestMessage = !mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId);

      if (isTestMessage) {
        console.log('🧪 Processing test message (no database save)');

        // Create mock message data for testing
        const mockMessageData = {
          messageId: new mongoose.Types.ObjectId(),
          senderId,
          receiverId,
          message,
          messageType,
          timestamp: new Date(),
          chatId: new mongoose.Types.ObjectId()
        };

        // Send message to receiver if online
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket && receiverSocket.isOnline) {
          console.log('📤 Sending test message to receiver:', receiverId);
          io.to(receiverSocket.socketId).emit('receiveMessage', mockMessageData);
        } else {
          console.log('� Test receiver is offline:', receiverId);
        }

        // Send confirmation back to sender
        socket.emit('messageDelivered', {
          messageId: mockMessageData.messageId,
          chatId: mockMessageData.chatId,
          timestamp: mockMessageData.timestamp,
          success: true,
          isTest: true
        });

        console.log(`✅ Test message sent successfully from ${senderId} to ${receiverId}`);
        return;
      }

      // Handle real users with database operations
      console.log('💾 Processing real message with database save');

      // Find or create chat between users
      let chat = await Chat.findChatBetweenUsers(senderId, receiverId);
      console.log('🔍 Found existing chat:', !!chat);

      if (!chat) {
        console.log('🆕 Creating new chat between users');
        chat = new Chat({
          participants: [senderId, receiverId],
          messages: []
        });
        console.log('💾 Saving new chat...');
        await chat.save();
        console.log('✅ New chat created with ID:', chat._id);
      }

      // Add message to chat
      console.log('💾 Adding message to chat...');
      await chat.addMessage(senderId, receiverId, message, messageType);

      // Get the last message that was just added
      const lastMessage = chat.messages[chat.messages.length - 1];
      console.log('✅ Message saved with ID:', lastMessage._id);

      // Prepare message data
      const messageData = {
        messageId: lastMessage._id,
        senderId,
        receiverId,
        message,
        messageType,
        timestamp: lastMessage.timestamp,
        chatId: chat._id
      };

      // Send message to receiver if online
      const receiverSocket = onlineUsers.get(receiverId);
      if (receiverSocket && receiverSocket.isOnline) {
        console.log('📤 Sending message to receiver:', receiverId);
        io.to(receiverSocket.socketId).emit('receiveMessage', messageData);
      } else {
        console.log('📴 Receiver is offline:', receiverId);
      }

      // Send confirmation back to sender
      socket.emit('messageDelivered', {
        messageId: lastMessage._id,
        chatId: chat._id,
        timestamp: lastMessage.timestamp,
        success: true
      });

      console.log(`✅ Message sent successfully from ${senderId} to ${receiverId}`);

    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('❌ Error stack:', error.stack);
      socket.emit('messageError', {
        error: 'Failed to send message',
        details: error.message,
        stack: error.stack
      });
    }
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const { senderId, receiverId, isTyping } = data;
    const receiverSocket = onlineUsers.get(receiverId);

    if (receiverSocket) {
      io.to(receiverSocket.socketId).emit('userTyping', {
        userId: senderId,
        isTyping
      });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    if (socket.userId) {
      try {
        // Update user status in database
        await Users.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
          socketId: null
        });

        // Update user status to offline
        const userInfo = onlineUsers.get(socket.userId);
        if (userInfo) {
          onlineUsers.set(socket.userId, {
            ...userInfo,
            isOnline: false,
            lastSeen: new Date()
          });

          // Broadcast user offline status
          socket.broadcast.emit('userOffline', socket.userId);

          // Remove from online users after 30 seconds
          setTimeout(() => {
            onlineUsers.delete(socket.userId);
          }, 30000);
        }

        console.log(`User ${socket.userId} disconnected`);
      } catch (error) {
        console.error('❌ Error updating user offline status:', error);
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// API endpoint to get chat details including size
app.get("/chat/:userId1/:userId2", async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const chat = await Chat.findChatBetweenUsers(userId1, userId2);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Calculate current size
    chat.calculateChatSize();
    await chat.save();

    res.json({
      chatId: chat._id,
      messages: chat.messages,
      sizeInBytes: chat.chatSizeInBytes,
      sizeFormatted: chat.getChatSizeFormatted(),
      exceedsLimit: chat.exceedsLimit(),
      isDeleted: chat.isDeleted,
      deletedAt: chat.deletedAt
    });
  } catch (error) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to delete chat
app.delete("/chat/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    await chat.deleteChat();

    res.json({
      message: "Chat deleted successfully",
      chatId: chat._id,
      deletedAt: chat.deletedAt
    });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Delete chat endpoint - proper implementation
app.post("/delete-chat", async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;
    console.log('🗑️ Delete chat request:', { userId1, userId2 });

    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: "Both user IDs are required"
      });
    }

    // Find or create chat between users
    let chat = await Chat.findOne({
      participants: { $all: [userId1, userId2] }
    });

    if (!chat) {
      // If no chat exists, create one for tracking deletion
      chat = new Chat({
        participants: [userId1, userId2],
        messages: [],
        deletedBy: [userId1]
      });
      await chat.save();

      return res.json({
        success: true,
        message: "Chat marked for deletion",
        permanentlyDeleted: false,
        chatId: chat._id
      });
    }

    // Initialize deletedBy if not exists
    if (!chat.deletedBy) {
      chat.deletedBy = [];
    }

    // Add user to deletedBy if not already added
    if (!chat.deletedBy.includes(userId1)) {
      chat.deletedBy.push(userId1);
    }

    // Check if both users have deleted
    const allParticipantsDeleted = chat.participants.every(participantId =>
      chat.deletedBy.some(deletedId => deletedId.toString() === participantId.toString())
    );

    if (allParticipantsDeleted) {
      // Both users deleted - remove from database permanently
      await Chat.findByIdAndDelete(chat._id);
      console.log('✅ Chat permanently deleted from database');

      return res.json({
        success: true,
        message: "Chat permanently deleted from database",
        permanentlyDeleted: true,
        chatId: chat._id
      });
    } else {
      // Only one user deleted - save and wait for other
      await chat.save();
      console.log('⏳ Chat marked for deletion, waiting for other user');

      return res.json({
        success: true,
        message: "Chat marked for deletion, waiting for other user",
        permanentlyDeleted: false,
        chatId: chat._id,
        deletedBy: chat.deletedBy.length
      });
    }

  } catch (error) {
    console.error("❌ Error in delete-chat:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Restore chat endpoint - only if other user hasn't deleted
app.post("/restore-chat", async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;
    console.log('🔄 Restore chat request:', { userId1, userId2 });

    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: "Both user IDs are required"
      });
    }

    // Find chat between users
    const chat = await Chat.findOne({
      participants: { $all: [userId1, userId2] }
    });

    if (!chat) {
      return res.json({
        success: false,
        canRestore: false,
        message: "No chat found to restore"
      });
    }

    // Check if chat has deletedBy array
    if (!chat.deletedBy || chat.deletedBy.length === 0) {
      return res.json({
        success: false,
        canRestore: false,
        message: "Chat was never deleted"
      });
    }

    // Check if both users have deleted (permanently deleted)
    const bothUsersDeleted = chat.participants.every(participantId =>
      chat.deletedBy.some(deletedId => deletedId.toString() === participantId.toString())
    );

    if (bothUsersDeleted) {
      return res.json({
        success: false,
        canRestore: false,
        message: "Chat permanently deleted - cannot restore"
      });
    }

    // Check if current user had deleted it
    const userHadDeleted = chat.deletedBy.some(deletedId => deletedId.toString() === userId1.toString());

    if (userHadDeleted) {
      // Remove user from deletedBy array
      chat.deletedBy = chat.deletedBy.filter(deletedId => deletedId.toString() !== userId1.toString());
      await chat.save();

      return res.json({
        success: true,
        canRestore: true,
        message: "Chat restored successfully",
        chatId: chat._id
      });
    } else {
      return res.json({
        success: false,
        canRestore: false,
        message: "Chat was not deleted by this user"
      });
    }

  } catch (error) {
    console.error("❌ Error in restore-chat:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// API endpoint to restore chat (old endpoint - keeping for compatibility)
app.post("/chat/:chatId/restore", async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    await chat.restoreChat();

    res.json({
      message: "Chat restored successfully",
      chatId: chat._id
    });
  } catch (error) {
    console.error("Error restoring chat:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to get all chats for a user (for new device sync)
app.get("/user/:userId/chats", async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({
      participants: userId,
      isDeleted: false
    }).populate('participants', 'name username image isOnline lastSeen');

    const chatData = chats.map(chat => {
      const otherUser = chat.participants.find(p => p._id.toString() !== userId);
      return {
        chatId: chat._id,
        otherUser: otherUser,
        messages: chat.messages,
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime,
        sizeInBytes: chat.chatSizeInBytes,
        sizeFormatted: chat.getChatSizeFormatted(),
        exceedsLimit: chat.exceedsLimit()
      };
    });

    res.json(chatData);
  } catch (error) {
    console.error("Error fetching user chats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API endpoint to get users with last seen info
app.get("/users/with-status", async (req, res) => {
  try {
    const users = await Users.find({}, '-password').lean();

    // Add formatted last seen to each user
    const usersWithStatus = users.map(user => ({
      ...user,
      lastSeenFormatted: formatLastSeen(user.lastSeen, user.isOnline)
    }));

    res.json(usersWithStatus);
  } catch (error) {
    console.error("Error fetching users with status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Helper function to format last seen
function formatLastSeen(lastSeen, isOnline) {
  if (isOnline) return 'Online';

  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const options = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  };

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return `Yesterday ${lastSeenDate.toLocaleTimeString('en-US', options)}`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return lastSeenDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  }
}

app.get("/", (req, resp) => {
  resp.send("App is Working");
});

//const UserTeacher = require("./Models/Teachers");

app.post('/signup', async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // ✅ First, check if user already exists
    const existingUser = await Users.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ error: "Username already exists." });
      }
      if (existingUser.email === email) {
        return res.status(409).json({ error: "Email already exists." });
      }
    }

    // ✅ If username is unique, create a new user
    const newUser = new Users({ name, username, email, password });
    const savedUser = await newUser.save();

    // ✅ Remove password before sending the response
    const responseUser = savedUser.toObject();
    delete responseUser.password;

    res.status(201).json(responseUser);
    console.log("User successfully registered:", responseUser);
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", { username });

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await Users.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Plain text password check (insecure, consider bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    req.session.user = { id: user._id.toString(), username: user.username, name: user.name, email: user.email };
    console.log("Session set:", req.session);

    // Explicitly save the session
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Failed to save session" });
      }
      res.json({ message: "Login successful", user: req.session.user });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/me', (req, res) => {
  const user = req.cookies.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  res.json(JSON.parse(user));
});

app.post('/forgot', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await Users.findOne({ username }); // Fixed variable name

    if (!user) {
      return res.status(401).json({ error: 'Invalid Username or password' });
    }

    // Simple password check (⚠️ Not secure, but works for basic use)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid Username or password' });
    }

    // Respond with user data (excluding password)
    res.json({ name: user.name, username: user.username, _id: user._id });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const sendOTPEmail = require('./utils/sendOTPEmail');

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const user = await Users.findOne({ email: email.toLowerCase() });

  if (!user) return res.status(404).json({ error: "Email not found." });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  user.otp = otp;
  user.otpExpiresAt = expiresAt;
  await user.save();

  await sendOTPEmail(email, otp);

  // Automatically delete OTP after 5 minutes (NOT the user)
  setTimeout(async () => {
    try {
      await Users.updateOne(
        { email: email.toLowerCase() },
        { $unset: { otp: "", otpExpiresAt: "" } }
      );
      console.log("✅ OTP expired and fields removed.");
    } catch (err) {
      console.error("❌ Failed to remove OTP:", err);
    }
  }, 5 * 60 * 1000);

  res.json({ message: "OTP sent." });
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  const user = await Users.findOne({ email: email.toLowerCase() });

  if (!user || !user.otp || !user.otpExpiresAt) {
    return res.status(400).json({ error: "OTP not found. Please request again." });
  }

  const isExpired = new Date() > new Date(user.otpExpiresAt);
  if (isExpired) {
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();
    return res.status(410).json({ error: "OTP expired. Please request a new one." });
  }

  if (user.otp !== otp) {
    return res.status(401).json({ error: "Invalid OTP. Please try again." });
  }

  // OTP is valid
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();

  res.json({ message: "OTP verified. You may now reset your password." });
});

app.post("/check-email", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Users.findOne({ email: email.toLowerCase() }); // case-insensitive
    res.json({ exists: !!user }); // true or false
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/check-username", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await Users.findOne({ username: username });
    res.json({ exists: !!user }); // true or false
  } catch (error) {
    console.error("Error checking email:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.post('/update-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await Users.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ error: "User not found." });

    // Clean up OTP-related fields
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    // Store the password directly (plain text)
    user.password = newPassword;
    await user.save();

    return res.json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Password update error:", error);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

app.get('/check-auth', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, user: req.session.user });
  } else {
    res.json({ authenticated: false });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid'); // clear session cookie
    res.json({ message: 'Logged out successfully' });
  });
});

app.post('/displayusersProfile', async (req, res) => {
  console.log('Received request to /displayusersProfile'); // ✅ Correct now
  try {
    const users = await Users.find();
    console.log('Users fetched:', users);
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Middleware to extract the user ID from the Authorization header
const extractUserIdFromHeader = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  try {
    // Validate ObjectId format (assuming MongoDB ObjectId)
    if (!mongoose.Types.ObjectId.isValid(token)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    req.userId = token;
    next();
  } catch (error) {
    console.error('Error in extractUserIdFromHeader:', error);
    return res.status(400).json({ message: 'Invalid token' });
  }

};

app.get('/profile', extractUserIdFromHeader, async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Followers: jin logon ne mujhe follow kiya (status: accepted)
    const followersDocs = await Follow.find({
      followee: userId,
      status: 'accepted'
    }).populate('follower', 'name username image');

    // 2. Following: jinhe main follow kar raha hoon (status: accepted)
    const followingDocs = await Follow.find({
      follower: userId,
      status: 'accepted'
    }).populate('followee', 'name username image');

    // 3. Map followers to usable frontend structure
    const followers = followersDocs.map(f => ({
      _id: f.follower._id.toString(),
      name: f.follower.name,
      username: f.follower.username,
      image: f.follower.image || '',
    }));

    // 4. Map following to usable frontend structure
    const following = followingDocs.map(f => ({
      _id: f.followee._id.toString(),
      name: f.followee.name,
      username: f.followee.username,
      image: f.followee.image || '',
    }));

    // 5. Get logged-in user info
    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 6. Send profile response
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.image || '',
      bio: user.bio || 'No bio yet.',
      followers, // full user info array
      followersCount: followers.length,
      following,
      followingCount: following.length
    });

  } catch (err) {
    console.error("Profile Fetch Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});





const imageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
  image: { type: String, required: true } // Stores the Base64 string
}, { timestamps: true });

module.exports = mongoose.model('Image', imageSchema);

app.post("/update-image", async (req, res) => {
  const { id, image } = req.body;

  if (!id || !image) {
    return res.status(400).json({ message: "User ID and image are required" });
  }

  try {
    // Find user by ID
    const user = await Users.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update or add image field
    user.image = image;

    // Save updated user
    await user.save();

    console.log("User updated:", user);
    return res.status(200).json({ message: "Image updated successfully", imageUrl: user.image });
  } catch (error) {
    console.error("Error updating image:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/update-profile", async (req, res) => {
  const { id, username, name, email, bio } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID is required." });
  }

  try {
    const updatedFields = {};
    if (username) updatedFields.username = username;
    if (name) updatedFields.name = name;
    if (email) updatedFields.email = email;
    if (bio !== undefined) updatedFields.bio = bio; // even empty string allowed

    const updatedUser = await Users.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error while updating profile." });
  }
});

const Follow = require("./Models/Follow");

app.post("/follow", async (req, res) => {
  const { followerId, followeeId } = req.body;

  try {
    if (followerId === followeeId) {
      return res.status(400).json({ message: "You can't follow yourself." });
    }

    const alreadyExists = await Follow.findOne({
      follower: followerId,
      followee: followeeId
    });

    if (alreadyExists) {
      return res.status(409).json({ message: "Follow request already sent or already following." });
    }

    const followDoc = await Follow.create({
      follower: followerId,
      followee: followeeId,
      status: "pending", // 🔑 This keeps track of whether it's been accepted yet
      followTime: new Date()
    });

    res.status(200).json({
      message: "Follow request sent successfully",
      follow: {
        id: followDoc._id,
        follower: followDoc.follower,
        followee: followDoc.followee,
        status: followDoc.status,
        time: new Date(followDoc.followTime).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }
    });

  } catch (err) {
    console.error("🔥 Follow Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});



app.get("/requests/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const requests = await Follow.find({ followee: userId, status: 'pending' })
      .populate('follower', 'name image bio');

    console.log("✅ Raw requests fetched:", requests);

    const result = requests.map(req => {
      if (!req.follower) {
        console.warn("⚠️ Skipping request, follower not populated:", req);
        return null;
      }

      return {
        _id: req.follower._id,
        name: req.follower.name,
        avatar: req.follower.image,
        bio: req.follower.bio,
        time: new Date(req.followedAt).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      };
    }).filter(Boolean); // remove nulls
    res.json(result);

  } catch (err) {
    console.error("❌ Error fetching follow requests:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put('/accept-request', async (req, res) => {
  const { followerId, followeeId } = req.body;

  try {
    const follow = await Follow.findOneAndUpdate(
      { follower: followerId, followee: followeeId },
      { status: 'accepted' },
      { new: true }
    );

    if (!follow) return res.status(404).json({ message: 'Request not found' });

    // ✅ B accepts A's request → so B gains a follower, A gains a following
    await Users.findByIdAndUpdate(followeeId, { $inc: { followers: 1 } }); // B = followee
    await Users.findByIdAndUpdate(followerId, { $inc: { following: 1 } }); // A = follower

    res.status(200).json({ message: 'Accepted', follow });
  } catch (err) {
    console.error("🔥 Accept error:", err);
    res.status(500).json({ message: 'Internal error' });
  }
});



app.get('/follow-status/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    // Fetch follows where user is the follower (sent requests)
    const outgoing = await Follow.find({ follower: userId });

    // Fetch follows where user is the followee (received & accepted)
    const incomingAccepted = await Follow.find({
      followee: userId,
      status: 'accepted'
    });

    const following = outgoing.map(f => f.followee.toString());
    const accepted = [
      ...outgoing.filter(f => f.status === 'accepted').map(f => f.followee.toString()),
      ...incomingAccepted.map(f => f.follower.toString())
    ];

    res.json({
      following,
      accepted,
    });
  } catch (err) {
    console.error('🔥 Error getting follow status:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /pending-follow-requests/:userId
app.get("/pending-follow-requests/:userId", async (req, res) => {
  try {
    const requests = await Follow.find({ followee: req.params.userId, status: "pending" });
    res.status(200).json({ count: requests.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


app.delete('/removeFollower/:userId/:followerId', async (req, res) => {
  const { userId, followerId } = req.params;

  try {
    const result = await Follow.findOneAndDelete({ follower: followerId, followee: userId });

    if (!result) {
      return res.status(404).json({ message: 'Follower not found' });
    }

    res.json({ message: 'Follower removed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Chat API Routes

// Get chat history between two users
app.get('/chat/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;

    const chat = await Chat.findChatBetweenUsers(userId1, userId2);

    if (!chat) {
      return res.json({ messages: [] });
    }

    // Sort messages by timestamp
    const messages = chat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      chatId: chat._id,
      messages: messages.map(msg => ({
        id: msg._id,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        message: msg.message,
        messageType: msg.messageType,
        timestamp: msg.timestamp,
        isRead: msg.isRead,
        isDelivered: msg.isDelivered
      }))
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Get all chats for a user
app.get('/chats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({
      participants: userId
    }).populate('participants', 'name username image')
      .sort({ lastMessageTime: -1 });

    const chatList = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p._id.toString() !== userId);
      return {
        chatId: chat._id,
        participant: otherParticipant,
        lastMessage: chat.lastMessage,
        lastMessageTime: chat.lastMessageTime,
        unreadCount: chat.messages.filter(msg =>
          msg.receiverId.toString() === userId && !msg.isRead
        ).length
      };
    });

    res.json(chatList);

  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Get online users status
app.get('/online-users', (req, res) => {
  const onlineUserIds = Array.from(onlineUsers.keys()).filter(userId =>
    onlineUsers.get(userId).isOnline
  );
  res.json({ onlineUsers: onlineUserIds });
});

// Mark messages as read
app.post('/chat/mark-read', async (req, res) => {
  try {
    const { chatId, userId } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Mark all unread messages from other user as read
    let updatedCount = 0;
    chat.messages.forEach(message => {
      if (message.receiverId.toString() === userId && !message.isRead) {
        message.isRead = true;
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await chat.save();
    }

    res.json({ message: `${updatedCount} messages marked as read` });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

console.log('🚀 Starting server on port 5000...');

server.listen(5000, () => {
  console.log("✅ Server is Running now with Socket.IO support");
  console.log("🌐 Server URL: http://localhost:5000");
  console.log("📡 Socket.IO enabled for real-time communication");
});