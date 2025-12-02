// controllers/blogController.js
const User = require('../models/User');
const Blog = require('../models/Blog');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sunikhil1409.be21@chitkara.edu.in',
    pass: 'sfpt idyw ubtr znvi',
  },
});

// Optional helper to mark a blog pending
async function notifyAdmin(blog) {
  try {
    blog.status = 'Pending';
    await blog.save();
  } catch (error) {
    console.error('Error notifying admin:', error);
  }
}

const blogController = {
  viewHomePage: async (req, res) => {
    try {
      const homePageBlogs = await Blog.find({ status: 'Approved' }).limit(4);
      const allBlogs = await Blog.find({ status: 'Approved' });
      res.render('home', { homePageBlogs, allBlogs, user: req.session.user });
    } catch (error) {
      console.error('Error in viewHomePage:', error);
      res.render('error', { error, user: req.session.user });
    }
  },

  viewSingleBlog: async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id).populate('author');
      if (blog.status === 'Approved') {
        res.render('single-blog', { singleBlog: blog, user: req.session.user });
      } else {
        res.redirect('/');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  },

  viewAllBlogs: async (req, res) => {
    try {
      const blogs = await Blog.find({ status: 'Approved' }).populate('author');
      res.render('blogs', { blogs, user: req.session.user });
    } catch (error) {
      console.error(error);
      res.redirect('/');
    }
  },

  myblog: async (req, res) => {
    try {
      const user = await User.findById(req.session.user._id).populate({
        path: 'blog',
        match: { status: 'Approved' },
        populate: { path: 'author', model: 'User' },
      });
      res.render('myblog', { blogs: user.blog, user: req.session.user });
    } catch (error) {
      console.error('Error in myblog:', error);
      res.redirect('/');
    }
  },

  addBlog: async (req, res) => {
    const { title, content } = req.body;
    try {
      const isAdmin = req.session.user.isAdmin;

      const newBlog = new Blog({
        title,
        content,
        imagePath: req.file ? `/uploads/${req.file.filename}` : null,
        author: req.session.user._id,
        status: isAdmin ? 'Approved' : 'Pending',
      });

      await newBlog.save();

      const user = await User.findById(req.session.user._id);
      user.blog.push(newBlog._id);
      await user.save();

      if (!isAdmin) {
        await notifyAdmin(newBlog);

        // ✅ Safely emit event only if req.io exists
        if (req.io) {
          req.io.emit('newBlogNotification', { title: newBlog.title });
        } else {
          console.warn('Socket.io not attached to request.');
        }
      }

      res.redirect('/blog');
    } catch (error) {
      console.error('Error in addBlog:', error);
      res.redirect('/blog');
    }
  },

  approveBlog: async (req, res) => {
    try {
      const blogId = req.params.id;
      const updatedBlog = await Blog.findByIdAndUpdate(blogId, { status: 'Approved' }, { new: true });
      const adminUser = await User.findOne({ isAdmin: true });
      const user = await User.findById(updatedBlog.author);

      const mailOptions = {
        from: adminUser.email,
        to: user.email,
        subject: 'Blog Approved',
        text: `Your blog "${updatedBlog.title}" has been approved.`,
      };

      await transporter.sendMail(mailOptions);
      console.log('Approval email sent to:', user.email);

      res.redirect('/blog/settings');
    } catch (error) {
      console.error('Error in approveBlog:', error);
      res.redirect('/');
    }
  },

  rejectBlog: async (req, res) => {
    try {
      const blogId = req.params.id;
      const updatedBlog = await Blog.findByIdAndUpdate(blogId, { status: 'Rejected' }, { new: true });
      const adminUser = await User.findOne({ isAdmin: true });
      const user = await User.findById(updatedBlog.author);

      const mailOptions = {
        from: adminUser.email,
        to: user.email,
        subject: 'Blog Rejected',
        text: `Your blog "${updatedBlog.title}" has been rejected.`,
      };

      await transporter.sendMail(mailOptions);
      console.log('Rejection email sent to:', user.email);

      res.redirect('/blog/settings');
    } catch (error) {
      console.error('Error in rejectBlog:', error);
      res.redirect('/');
    }
  },

  updateUser: async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const user = await User.findById(req.session.user._id);
      user.name = name;
      user.email = email;

      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      await user.save();
      res.redirect('/blog/settings');
    } catch (error) {
      console.error('Error in updateUser:', error);
      res.redirect('/blog');
    }
  },

  deleteAccount: async (req, res) => {
    try {
      const user = await User.findById(req.session.user._id);
      if (!user) return res.redirect('/blog/settings');

      if (!req.body.passwordToDelete) return res.redirect('/blog/settings');

      const isPasswordMatch = await bcrypt.compare(req.body.passwordToDelete, user.password);
      if (!isPasswordMatch) return res.redirect('/blog/settings');

      await User.deleteOne({ _id: user._id });
      req.session.destroy(() => res.redirect('/blog'));
    } catch (error) {
      console.error('Error in deleteAccount:', error);
      res.redirect('/blog/settings');
    }
  },

  getAdminSettings: async (req, res) => {
    try {
      const blogsToApprove = await Blog.find({ status: 'Pending' });
      const approvedBlogs = await Blog.find({ status: 'Approved' });

      if (req.session.user.isAdmin) {
        res.render('admin-settings', { user: req.session.user, blogsToApprove, approvedBlogs });
      } else {
        res.render('settings', { user: req.session.user, blogsToApprove });
      }
    } catch (error) {
      console.error('Error in getAdminSettings:', error);
      res.render('error', { error, user: req.session.user });
    }
  },

  deleteBlog: async (req, res) => {
    try {
      const blogId = req.params.id;
      await Blog.findByIdAndDelete(blogId);
      await User.findByIdAndUpdate(req.session.user._id, { $pull: { blog: blogId } });
      res.redirect('/blog/settings');
    } catch (error) {
      console.error('Error in deleteBlog:', error);
      res.redirect('/');
    }
  },
};

module.exports = blogController;
