const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
    name: {
        type: String,
        default: ''
    },
    image: {
        type:String,
        default: "https://previews.123rf.com/images/salamatik/salamatik1801/salamatik180100019/92979836-profile-anonymous-face-icon-gray-silhouette-person-male-default-avatar-photo-placeholder-isolated-on.jpg"
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