const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String, 
        default: ''
    },
    email:{
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
    ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);