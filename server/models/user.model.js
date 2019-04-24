const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const isEmail = require('validator/lib/isEmail');
const _ = require('lodash');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'email is required'],
        minlength: 1,
        trim: true,
        unique: true,
        validate: {
            validator: isEmail,
            message: props => `${props.value} is not a valid email`
        }
    },
    name: {
        type: String,
        minlength: 1
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    return _.pick(userObject, ['_id', 'email']);
};

userSchema.methods.generateAuthToken = function() {
    const user = this;
    const access = 'auth';
    const token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    user.tokens.push({access, token});

    return user.save().then(() => {
        return token;
    });
};

const User = mongoose.model('User', userSchema);

module.exports = {User};