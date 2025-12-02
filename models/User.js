
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// const userSchema = new Schema({
//   username: String,
//   password: String,
//   email: String,
//   isAdmin: { type: Boolean, default: false },
//   isVerified: { type: Boolean, default: false }, 
//   verificationToken: String,
//   blog: [
//     {
//       type: Schema.Types.ObjectId,
//       ref: "Blog"
//     }
//   ]
// });

// const User = mongoose.model('User', userSchema);
// module.exports = User;

const userSchema = new Schema({
  username: String,
  password: String,
  email: String,
  isAdmin: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpiry: Date,  // Ensure you store token expiration
  blog: [
    {
      type: Schema.Types.ObjectId,
      ref: "Blog"
    }
  ]
});

const User = mongoose.model('User', userSchema);
module.exports = User;
