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
    "https://kishuu2.github.io",
    "http://192.168.1.4:3000",
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

        req.session.user = { id: user._id.toString(), name: user.name, email: user.email };
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
    const user = await Users.findOne({ username: username}); 
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
    // Assuming Users is a Mongoose model
    const user = await Users.findById(req.userId); // Use findById for single document
    if (user) {
      // Match frontend's expected profile structure
      return res.status(200).json({
        username: user.username,
        name: user.name,
        email: user.email,
        bio: user.bio || 'No bio yet.', // Provide default if missing
        image: user.image || '' // Provide default or stored avatar URL
      });
    } else {
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
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


app.listen(5000, () => {
  console.log("Server is Running now")
});