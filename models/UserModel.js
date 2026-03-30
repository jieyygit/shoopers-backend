const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    username: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true, versionKey: false });

const User = mongoose.model("User", UserSchema);
module.exports = User;