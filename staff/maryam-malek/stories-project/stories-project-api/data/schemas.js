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
    hasImage: {
        type: Boolean,
        required: true,
        default: false
    },
    image: {
        type: String,
    },
    hasAudio: {
        type: Boolean,
        required: true,
        default: false
    },
    audio: {
        type: String,
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
    hasCover: {
        type: Boolean,
        required: true,
        default: false
    },
    cover: {
        type: String
    },
    inProcess: {
        type: Boolean,
        required: true,
        default: true
    },
    pages: [Page]
})


module.exports = {
    User,
    Story,
    Page
}

