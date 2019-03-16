const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    phoneNumber: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    facebookId: String,
    googleId: String,
    admin: {
        type: Boolean,
        default: false
    },
    books: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }
    ], 
    requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);