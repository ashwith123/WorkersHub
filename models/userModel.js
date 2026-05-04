const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
        bio: {
        type: String,
        maxlength: 300
    },
    role: {
        type: String,
        enum: ["WORKER", "BUILDER"],
        default: "WORKER"
    },
    profilePhoto: {
    url: String,
    filename: String,
    },
    
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);