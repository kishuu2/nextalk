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

dotenv.config();

const url = process.env.MONGO_URI;


mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Atlas connected successfully');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

const app = express();
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

app.get("/", (req, resp) => {
  resp.send("App is Working");
});


//Student Data
const Users = require("./Models/Users");
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
    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ followee: userId, status: 'accepted' }),
      Follow.countDocuments({ follower: userId, status: 'accepted' }),
    ]);

    const user = await Users.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      name: user.name,
      email: user.email,
      image: user.image || '',
      bio: user.bio || 'No bio yet.',
      followers: followersCount,
      following: followingCount,
    });
  } catch (err) {
    console.error(err);
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


app.listen(5000, () => {
  console.log("Server is Running now")
});