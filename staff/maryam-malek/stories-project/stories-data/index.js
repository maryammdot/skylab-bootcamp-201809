const mongoose = require('mongoose')
const { User, Story, Page } = require('./schemas')

module.exports = {
    mongoose,
    models: {
        User: mongoose.model('User', User),
        Story: mongoose.model('Story', Story),
        Page: mongoose.model('Page', Page)
    }
}