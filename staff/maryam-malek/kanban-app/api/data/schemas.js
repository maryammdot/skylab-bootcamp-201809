const { Schema, SchemaTypes: {ObjectId} } = require('mongoose')

const Postit = new Schema({
    text: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'TODO',
        enum: ['TODO', 'DOING', 'REVIEW', 'DONE'],
        required: true
    },
    user: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    //assigned!!!!! Typo
    asigned: {
        type: ObjectId,
        ref: 'User'
    }
})

const User = new Schema({
    name: {
        type: String,
        required: true
    },
    surname: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    //collaborators Typo
    colaborators: [{
        type: ObjectId,
        ref: 'User'
    }]
})

module.exports = {
    User,
    Postit
}