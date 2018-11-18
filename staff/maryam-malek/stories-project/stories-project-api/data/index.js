const mongoose = require('mongoose')
const {User, Story, Page} = require('./schemas')

module.exports = {
    User: mongoose.model('User', User),
    Story: mongoose.model('Story', Story),
    Page: mongoose.model('Page', Page)
}