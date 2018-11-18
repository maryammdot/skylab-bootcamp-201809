const {User, Book, Page} = require('../data')
const { expect } = require('chai')

const MONGO_URL = 'mongodb://localhost:27017/story-logic-test'

describe('logic', () => {
    before(() => mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true }))
    beforeEach(() => Promise.all([User.deleteMany(), Book.deleteMany(), Page.deleteMany()]))
    describe('users', () => {
        describe('register', () => {
            
        })
    })
})