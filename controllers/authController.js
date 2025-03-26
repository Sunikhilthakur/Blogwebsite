const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'thakursunikhil@gmail.com',
    pass: 'taso qmlq nfkb sfod',
  },
});

// Function to send verification email
const sendVerificationEmail = (email, verificationToken) => {
  const verificationLink = `https://blogwebsite-ii3g.onrender.com/auth/verify-email?token=${verificationToken}`;

  
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


const generateRandomString = (length) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

const authController = {

  register: async (req, res) => {
    try {
      const { username, password, email } = req.body;

     
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send('User already exists. Please log in.');
      }

     
      const isAdmin = username.toLowerCase() === 'sunikhil' && email.toLowerCase() === 'sunikhil1409.be21@chitkara.edu.in';

     
      const verificationToken = generateRandomString(32);

   
      const hashedPassword = await bcrypt.hash(password, 10);

  
      const newUser = new User({
        username,
        password: hashedPassword,
        email,
        isAdmin,
        isVerified: false,
        verificationToken,
      });

    
      await newUser.save();

   
      sendVerificationEmail(email, verificationToken);

      res.status(200).send('Check your email to verify your account.');
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).send('Internal Server Error');
    }
  },



verifyEmail: async (req, res) => {
  try {
    const { token } = req.query;
    console.log('Token:', token);  

   
    const user = await User.findOne({ verificationToken: token });

   
    if (!user) {
      return res.status(400).send('Invalid or expired verification token.');
    }

  
    if (user.verificationTokenExpiry < Date.now()) {
      return res.status(400).send('Verification token has expired.');
    }

   
    user.isVerified = true;
    user.verificationToken = undefined; 
    user.verificationTokenExpiry = undefined; 
    await user.save();

    res.redirect('https://blogwebsite-ii3g.onrender.com/auth/login?verified=true');
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).send('Internal Server Error');
  }
},


  // User Login
  login: async (req, res) => {
    try {
      const { username, password } = req.body;


      const user = await User.findOne({ username });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).send('Invalid username or password.');
      }

      if (!user.isVerified) {
        return res.status(403).send('Please verify your email before logging in.');
      }

      // Store user information in session
      req.session.user = user;

      res.redirect('https://blogwebsite-ii3g.onrender.com/blog');
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  // User Logout
  logout: (req, res) => {
    req.session.destroy(() => {
      res.redirect('https://blogwebsite-ii3g.onrender.com/blog');
    });
  },
};

module.exports = authController;
