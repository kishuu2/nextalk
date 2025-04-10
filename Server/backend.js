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
app.use(express.json());
console.log("App listen at port 5000");
const allowedOrigins = [
  "http://localhost:3000",
  "https://kishuu2.github.io",
  "https://nextalk-u0y1.onrender.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax' 
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

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

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
    req.session.user = { id: user._id, name: user.name, email: user.email };
    return res.json({ message: "Login successful", user: req.session.user });

  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ error: 'Internal server error' });
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

app.post('/displayusersData', async (req, res) => {
  try {
      const users = await Users.find(); // Fetch all users from MongoDB
      res.status(200).json(users);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.listen(5000, () => {
  console.log("Server is Running now")
});