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
    }, 
    favourites: [{
        type: ObjectId,
        ref: 'Story'
    }]
})

const Page = new Schema({
    hasImage: {
        type: Boolean,
        required: true,
        default: false
    },
    image: {
        type: String,
    },
    vectors: [],
    dataURL: {
        type: String,
    },
    hasAudio: {
        type: Boolean,
        required: true,
        default: false
    },
    audioURL: {
        type: String,
    },
    text: {
        type: String
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
        required: false
    },
    textLanguage: {
        type: String,
        required: false
    },
    hasCover: {
        type: Boolean,
        required: true,
        default: false
    },
    vectors: [],
    dataURL: {
        type: String,
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

