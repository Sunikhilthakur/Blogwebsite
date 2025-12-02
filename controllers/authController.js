const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sunikhil1409.be21@chitkara.edu.in',
    pass: 'sfpt idyw ubtr znvi',
  },
});

const sendVerificationEmail = (email, verificationToken) => {
  // const verificationLink = `https://blogwebsite-ii3g.onrender.com/auth/verify-email?token=${verificationToken}`;
  const verificationLink = `http://localhost:5000/auth/verify-email?token=${verificationToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    text: `Click on the following link to verify your email: ${verificationLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error('Error sending verification email:', error);
    else console.log('Verification email sent:', info.response);
  });
};

const generateRandomString = (length) => crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);

const authController = {
  register: async (req, res) => {
    try {
      const { username, password, email } = req.body;
      const isAdmin = username.toLowerCase() === 'sunikhil' && email.toLowerCase() === 'sunikhil1409.be21@chitkara.edu.in';
      const verificationToken = generateRandomString(32);
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        password: hashedPassword,
        email,
        isAdmin,
        verificationToken,
      });

      await newUser.save();
      sendVerificationEmail(email, verificationToken);

      res.send('Check your email to verify your account.');
    } catch (error) {
      console.error('Error in register:', error);
      res.redirect('/auth/register');
    }
  },

  verifyEmail: async (req, res) => {
    const { token } = req.query;
    try {
      const user = await User.findOne({ verificationToken: token });
      if (!user) return res.status(400).send('Invalid verification token');

      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();

      res.redirect('/auth/login');
    } catch (error) {
      console.error('Error in verifyEmail:', error);
      res.status(500).send('Internal Server Error');
    }
  },

  login: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.redirect('/auth/register');
      }

      req.session.user = user;
      res.redirect('/blog');
    } catch (error) {
      console.error('Error in login:', error);
      res.redirect('/auth/login');
    }
  },

  logout: (req, res) => {
    req.session.destroy(() => res.redirect('/blog'));
  },
};

module.exports = authController;
