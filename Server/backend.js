const mongoose = require('mongoose');
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const express = require('express');
const twilio = require('twilio');
const session = require('express-session');
const fileUpload = require("express-fileupload");

require('dotenv').config();

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
app.use(cors());
console.log("App listen at port 5000");
const allowedOrigins = [
  "http://localhost:3000",
  "https://kishuu2.github.io",
  "https://nextalk-u0y1.onrender.com"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
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
    if (existingUser.username === username) {
      return res.status(409).json({ field: "username", error: "Usernames already exists." });
    }
    if (existingUser.email === email) {
      return res.status(409).json({ field: "email", error: "Email already exists." });
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
    res.json({ name: user.name, username: user.username, _id: user._id });
  } catch (err) {
    console.error("Error logging in user:", err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(5000, () => {
  console.log("Server is Running now")
});