const mongoose = require('mongoose');
const cors = require("cors");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const express = require('express');
const twilio = require('twilio');
const session = require('express-session');
const fileUpload = require("express-fileupload");

require('dotenv').config();

const url = "mongodb+srv://kishuu_2:ocXG5K7MBsk56Q9l@cluster0.xltekmq.mongodb.net/nextalk?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Atlas connected successfully');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB Atlas:', err);
  });

/*mongoose.connect('mongodb://localhost:27017/Quiz')
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
  });*/

// For backend and express
const app = express();
app.use(express.json()); 
app.use(cors());
console.log("App listen at port 5000");
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true,
}));

/*const SECRET_KEY = process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex');
app.use(session({
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60,
  }
}));
*/
app.get("/", (req, resp) => {
  resp.send("App is Working");
});



//Student Data
const Users = require("./Models/Users");
//const UserTeacher = require("./Models/Teachers");

app.post('/signup', async (req, res) => {
  try {
    const { name, username, password } = req.body;

    // ✅ First, check if user already exists
    const existingUser = await Users.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ error: "Username already exists." });
    }

    // ✅ If username is unique, create a new user
    const newUser = new Users({ name, username, password });
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



app.listen(5000, () => {
  console.log("Server is Running now")
});