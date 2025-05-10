
# 📝 Blog Website

A dynamic and scalable blog platform built with the **MERN stack**, featuring real-time communication and email notifications. This project leverages **MongoDB**, **Express.js**, **Node.js**, **Socket.io**, and **Nodemailer** to provide a seamless user experience.

🔗 **Live Demo**: [blogwebsite-ii3g.onrender.com](https://blogwebsite-ii3g.onrender.com)

---

## 🚀 Features

- **User Authentication**: Secure login and registration system.
- **CRUD Operations**: Create, read, update, and delete blog posts.
- **Real-time Communication**: Instant updates using Socket.io.
- **Email Notifications**: Automated emails for user interactions via Nodemailer.
- **Modular Architecture**: Organized codebase for scalability and maintainability.

---

## 🛠️ Tech Stack

- **Frontend**: Handlebars (templating engine)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Email Service**: Nodemailer
- **Authentication**: Passport.js (if implemented)

---

## 📁 Project Structure

```
Blogwebsite/
├── controllers/        # Route handlers
├── models/             # Mongoose schemas
├── routes/             # Express routes
├── views/              # Handlebars templates
├── middleware/         # Custom middleware
├── images/             # Static assets
├── socket.js           # Socket.io configuration
├── index.js            # Entry point
├── package.json        # Project metadata
└── .gitignore          # Git ignore file
```

---

## ⚙️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Sunikhilthakur/Blogwebsite.git
   cd Blogwebsite
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   - Create a `.env` file in the root directory.
   - Add necessary variables (e.g., `MONGO_URI`, `EMAIL_USER`, `EMAIL_PASS`, etc.).

4. **Start the application**:
   ```bash
   npm start
   ```

---

## 📬 API Endpoints

| Method | Endpoint           | Description             |
|--------|--------------------|-------------------------|
| GET    | `/`                | Home page               |
| GET    | `/login`           | Login page              |
| POST   | `/login`           | Authenticate user       |
| GET    | `/register`        | Registration page       |
| POST   | `/register`        | Register new user       |
| GET    | `/create`          | Create new blog post    |
| POST   | `/create`          | Submit new blog post    |
| GET    | `/edit/:id`        | Edit blog post          |
| POST   | `/edit/:id`        | Update blog post        |
| GET    | `/delete/:id`      | Delete blog post        |

*Note: Replace `:id` with the actual blog post ID.*

---

## 📌 Future Enhancements

- **Rich Text Editor**: Integrate a WYSIWYG editor for blog content.
- **Comment System**: Allow users to comment on posts.
- **Like/Dislike Feature**: Enable user interactions with posts.
- **Profile Management**: User profiles with editable information.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 📫 Contact

**Developer**: Sunikhil Thakur  
**GitHub**: [Sunikhilthakur](https://github.com/Sunikhilthakur)
