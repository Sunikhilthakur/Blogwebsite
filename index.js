const express = require('express');
const cors = require('cors'); // Import cors
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const session = require('express-session');
const exphbs = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const multer = require('multer');
const http = require('http');
const initSocket = require('./socket');

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_DB_URI = process.env.MONGO_DB_URI;

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = require('socket.io')(server);
initSocket(io);



// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,  // Allow cookies over HTTP
      sameSite: 'Lax', // Works better for development
    },
}));


// Set up Handlebars as the view engine
app.engine('hbs', exphbs({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir: __dirname + '/views/partials/',
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    allowProtoMethodsByDefault: true,
}));
app.set('view engine', 'hbs');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage });

// Routes
app.use('/auth', authRoutes);
app.use('/blog', blogRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('home', { user: req.session.user });
});

// Start the server
server.listen(PORT, () => {
    connectToMongoDB();
    console.log(`Server Running on port ${PORT}`);
});

const connectToMongoDB = async () => {
  try {
      await mongoose.connect(process.env.MONGO_DB_URI);
      console.log("Connected to MongoDB");
  } catch (error) {
      console.log("Error connecting to MongoDB", error.message);
  }
};
