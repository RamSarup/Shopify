const User = require("../model/User.js");
const sendEmail = require("../utils/sendEmail.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register a new user

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ name, email, password: hashedPassword });
    if (newUser) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      const message = `Welcome to ShopNeext! Your OTP for registration is ${otp}. Please use this OTP to complete your registration process. Thank you for choosing ShopNeext!`;

      await sendEmail(email, "ShopNeext Registration OTP", message);
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        token: generateToken(newUser._id),
        message:
          "User registered successfully. Please check your email for the OTP.",
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login a user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const foundUser = await User.findOne({ email });
    if (foundUser && (await bcrypt.compare(password, foundUser.password))) {
      res.json({
        _id: foundUser._id,
        name: foundUser.name,
        email: foundUser.email,
        token: generateToken(foundUser._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select("-password");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    } else {
      res.status(200).json(currentUser);
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, getUsers };
