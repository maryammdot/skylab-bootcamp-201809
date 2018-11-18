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
    // com que es guarda en disc això no ha de constar aquí, oi?
    // image: {
    //     type: Image,
    // },
    // com que es guarda en disc això no ha de constar aquí, oi?
    // audio: {
    //     type: Audio,
    // },
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
    pages: [Page]
})


module.exports = {
    User,
    Story,
    Page
}

