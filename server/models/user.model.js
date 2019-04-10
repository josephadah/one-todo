const mongoose = require('mongoose');

const User = mongoose.model('User', {
    email: {
        type: String,
        require: true,
        min: 1,
        trim: true
    },
    name: {
        type: String,
        min: 1
    },
    password: {
        type: Number,
        require: true
    }
});

module.exports = {User};