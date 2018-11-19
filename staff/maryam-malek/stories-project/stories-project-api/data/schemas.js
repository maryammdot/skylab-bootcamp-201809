const { Schema, SchemaTypes: { ObjectId } } = require('mongoose')

const User = new Schema({
    name: {
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
    }
})

const Page = new Schema({
    index: {
        type: Number,
        required: true
    },
    image: {
        type: Boolean,
        required: true,
        default: false
    },
    audio: {
        type: Boolean,
        required: true,
        default: false
    },
    text: {
        type: String,
    }
})

const Story = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: ObjectId,
        required: true,
        ref: 'User'
    },
    audioLanguage: {
        type: String,
        required: true,
    },
    textLanguage: {
        type: String,
        required: true
    },
    cover: {
        type: Boolean,
        required: true,
        default: false
    },
    pages: [Page]
})


module.exports = {
    User,
    Story,
    Page
}

