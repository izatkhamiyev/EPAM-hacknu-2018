const mongoose = require('mongoose');
const { Schema } = mongoose;


const bookSchema = new Schema({
    author: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    },
    title: {
        type: String,
        required: true
    },
    genre: {
        type: String,
    },
    description: {
        type: String
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Book', bookSchema);