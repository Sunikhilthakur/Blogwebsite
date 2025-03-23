const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'thakursunikhil@gmail.com',
    pass: 'taso qmlq nfkb sfod', // Use environment variables instead of hardcoding credentials
  },
});

// Function to send verification email
const sendVerificationEmail = (email, verificationToken) => {
  const verificationLink = `https://blogwebsite-rja9.onrender.com/auth/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: 'thakursunikhil@gmail.com',
    to: email,
    subject: 'Verify Your Email',
    text: `Click on the following link to verify your email: ${verificationLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Verification email sent:', info.response);
    }
  });
};

// Function to generate a random verification token
const generateRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

const authController = {
  // User Registration
  register: async (req, res) => {
    try {
      const { username, password, email } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send('User already exists. Please log in.');
      }

      // Determine if the user should be an admin
      const isAdmin = username.toLowerCase() === 'sunikhil' && email.toLowerCase() === 'sunikhil1409.be21@chitkara.edu.in';

      // Generate a verification token
      const verificationToken = generateRandomString(32);

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user
      const newUser = new User({
        username,
        password: hashedPassword,
        email,
        isAdmin,
        isVerified: false,
        verificationToken,
      });

      // Save the user to the database
      await newUser.save();

      // Send verification email
      sendVerificationEmail(email, verificationToken);

      res.status(200).send('Check your email to verify your account.');
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  // Email Verification
  verifyEmail: async (req, res) => {
    try {
      const { token } = req.query;

      // Find user by verification token
      const user = await User.findOne({ verificationToken: token });

      if (!user) {
        return res.status(400).send('Invalid or expired verification token.');
      }

      // Mark user as verified
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();

      // Redirect user to frontend login page with success message
      res.redirect('https://blogwebsite-rja9.onrender.com/login?verified=true');
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  // User Login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      // Find the user by username
      const user = await User.findOne({ username });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid username or password.');
      }

      if (!user.isVerified) {
        return res.status(403).send('Please verify your email before logging in.');
      }

      // Store user information in session
      req.session.user = user;

      res.redirect('https://blogwebsite-rja9.onrender.com/blog');
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  // User Logout
  logout: (req, res) => {
    req.session.destroy(() => {
      res.redirect('https://blogwebsite-rja9.onrender.com/blog');
    });
  },
};

module.exports = authController;
