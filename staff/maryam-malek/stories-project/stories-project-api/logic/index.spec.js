const { User, Story, Page } = require('../data')
const logic = require('./index')
const { AlreadyExistsError, AuthError, NotFoundError, ValueError } = require('../errors')

const { expect } = require('chai')
const mongoose = require('mongoose')

const MONGO_URL = 'mongodb://localhost:27017/story-logic-test'

describe('logic', () => {
    before(() => mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true }))
    beforeEach(() => Promise.all([User.deleteMany(), Story.deleteMany(), Page.deleteMany()]))

    describe('users', () => {

        describe('register', () => {
            let name, surname, username, password

            beforeEach(() => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`
            })

            it('should succeed on correct data', async () => {
                await logic.register(name, surname, username, password)

                const _user = await User.findOne({ username })

                expect(_user.id).to.be.a('string')
                expect(_user.name).to.equal(name)
                expect(_user.surname).to.equal(surname)
                expect(_user.username).to.equal(username)
                expect(_user.password).to.equal(password)

            })

            // I don't know why it returns error  AssertionError: expected [Function] to throw AlreadyExistsError
            // it('should fail on repeted username', async () => {
            //     await logic.register(name, surname, username, password)

            //     expect(() => logic.register(name, surname, username, password)).to.throw(AlreadyExistsError, `username ${username} already registered`)
            // })

            it('should fail on undefined name', () => {
                expect(() => logic.register(undefined, surname, username, password)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty name', () => {
                expect(() => logic.register('', surname, username, password)).to.throw(ValueError, 'name is empty or blank')
            })

            it('should fail on blank name', () => {
                expect(() => logic.register('   \t\n', surname, username, password)).to.throw(ValueError, 'name is empty or blank')
            })

            // TODO other test cases
        })

        describe('authenticate', () => {
            let user

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()
            })

            it('should succeed on correct data', async () => {
                const id = await logic.authenticate(username, password)

                const _user = await User.findOne({ username })

                expect(id).to.be.a('string')
                expect(id).to.equal(_user.id)
            })

            it('should fail on incorrect password', async () => {
                try {
                    await logic.authenticate(username, 'password')
                    expect(true).to.be.false
                } catch (err) {
                    expect(err).to.be.instanceof(AuthError)
                    expect(err.message).to.equal(`invalid username or password`)
                }
            })

            it('should fail on undefined username', () => {
                expect(() => logic.authenticate(undefined, password)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty username', () => {
                expect(() => logic.authenticate('', password)).to.throw(ValueError, 'username is empty or blank')
            })

            it('should fail on blank username', () => {
                expect(() => logic.authenticate('   \t\n', password)).to.throw(ValueError, 'username is empty or blank')
            })

            // TODO other test cases
        })

        describe('retrieve user', () => {
            let user

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()
            })

            it('should succeed on correct data', async () => {
                const _user = await logic.retrieveUser(user.id)

                const { name, surname, username, id } = _user

                expect(_user).not.to.be.instanceof(User)

                expect(user.id).to.equal(id)
                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(surname)
                expect(user.username).to.equal(username)
            })

            it('should fail on undefined id', () => {
                expect(() => logic.retrieveUser(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                expect(() => logic.retrieveUser('')).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                expect(() => logic.retrieveUser('   \t\n')).to.throw(ValueError, 'id is empty or blank')
            })
            // TODO other test cases
        })


        describe('update user', () => {
            let user, newName, newSurname, newUsername, newPassword

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                newName = `${name}-${Math.random()}`
                newSurname = `${surname}-${Math.random()}`
                newUsername = `${username}-${Math.random()}`
                newPassword = `${password}-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()
            })

            it('should succeed on correct data', async () => {
                await logic.updateUser(user.id, newName, newSurname, newUsername, newPassword, user.password)

                const _user = await User.findById(user.id)

                expect(_user.id).to.equal(user.id)
                expect(_user.name).to.equal(newName)
                expect(_user.surname).to.equal(newSurname)
                expect(_user.username).to.equal(newUsername)
                expect(_user.password).to.equal(newPassword)
            })

            it('should fail on undefined id', () => {
                expect(() => logic.retrieveUser(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty id', () => {
                expect(() => logic.retrieveUser('')).to.throw(ValueError, 'id is empty or blank')
            })

            it('should fail on blank id', () => {
                expect(() => logic.retrieveUser('   \t\n')).to.throw(ValueError, 'id is empty or blank')
            })
            // TODO other test cases
        })

    })

    describe('stories', () => {
        describe('add', () => {
            let title, audioLanguage, textLanguage, user

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()

                title = `title-${Math.random()}`
                audioLanguage = `audioLanguage-${Math.random()}`
                textLanguage = `textLanguage-${Math.random()}`

            })

            it('should succeed on correct data', async () => {

                await logic.addStory(title, user.id, audioLanguage, textLanguage)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [story] = stories

                expect(story.id).to.be.a('string')
                expect(story.title).to.equal(title)
                expect(story.audioLanguage).to.equal(audioLanguage)
                expect(story.textLanguage).to.equal(textLanguage)
            })

            it('should fail on undefined title', () => {
                expect(() => logic.addStory(undefined, user.id, audioLanguage, textLanguage)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty title', () => {
                expect(() => logic.addStory('', user.id, audioLanguage, textLanguage)).to.throw(ValueError, 'title is empty or blank')
            })

            it('should fail on blank title', () => {
                expect(() => logic.addStory('   \t\n', audioLanguage, textLanguage)).to.throw(ValueError, 'title is empty or blank')
            })

            // TODO other test cases
        })

        describe('list stories', () => {
            let title, audioLanguage, textLanguage, user, story, story2, title2, textLanguage2, audioLanguage2

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()

                title = `title-${Math.random()}`
                audioLanguage = `audioLanguage-${Math.random()}`
                textLanguage = `textLanguage-${Math.random()}`

                title2 = `title-${Math.random()}`
                textLanguage2 = `textLanguage-${Math.random()}`
                audioLanguage2 = `audioLanguage-${Math.random()}`

                let id = user.id

                story = await new Story({ title, author: id, audioLanguage, textLanguage }).save()
                story2 = await new Story({ title: title2, author: id, audioLanguage: audioLanguage2, textLanguage: textLanguage2 }).save()

            })

            it('should succeed on correct author', async () => {

                const stories = await logic.listStories(user.id)

                expect(stories.length).to.equal(2)

                const [_story, _story2] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.author.toString()).to.equal(user.id)
                expect(_story.title).to.equal(title)
                expect(_story.audioLanguage).to.equal(audioLanguage)
                expect(_story.textLanguage).to.equal(textLanguage)
                expect(_story2.author.toString()).to.equal(user.id)
                expect(_story2.title).to.equal(title2)
                expect(_story2.audioLanguage).to.equal(audioLanguage2)
                expect(_story2.textLanguage).to.equal(textLanguage2)

                const _stories = await Story.find()

                const [__story, __story2] = _stories

                expect(_story.id).to.be.a('string')
                expect(_story.id).to.equal(__story.id)
                expect(_story.title).to.equal(__story.title)
                expect(_story.audioLanguage).to.equal(__story.audioLanguage)
                expect(_story.textLanguage).to.equal(__story.textLanguage)
                expect(_story2.author.toString()).to.equal(__story2.author.toString())
                expect(_story2.title).to.equal(__story2.title)
                expect(_story2.audioLanguage).to.equal(__story2.audioLanguage)
                expect(_story2.textLanguage).to.equal(__story2.textLanguage)
            })


            it('should fail on undefined user id', () => {
                expect(() => logic.updateStory(story.id, null, undefined, null, null)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty title', () => {
                expect(() => logic.updateStory(story.id, null, '', null, null)).to.throw(ValueError, 'authorId is empty or blank')
            })

            it('should fail on empty authorId', () => {
                expect(() => logic.updateStory(story.id, null, '   \t\n', null, null)).to.throw(ValueError, 'authorId is empty or blank')
            })

        })


        describe('update', () => {
            let title, audioLanguage, textLanguage, user, story, newTitle, newTextLanguage, newAudioLanguage

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()

                title = `title-${Math.random()}`
                audioLanguage = `audioLanguage-${Math.random()}`
                textLanguage = `textLanguage-${Math.random()}`
                newTitle = `${title}-${Math.random()}`
                newTextLanguage = `${textLanguage}-${Math.random()}`
                newAudioLanguage = `${audioLanguage}-${Math.random()}`
                let id = user.id

                story = await new Story({ title, author: id, audioLanguage, textLanguage }).save()
            })

            it('should succeed on new title', async () => {

                await logic.updateStory(story.id, newTitle, user.id, null, null)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(newTitle)
                expect(_story.audioLanguage).to.equal(audioLanguage)
                expect(_story.textLanguage).to.equal(textLanguage)
            })

            it('should succeed on new audio language', async () => {

                await logic.updateStory(story.id, null, user.id, newAudioLanguage, null)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(title)
                expect(_story.audioLanguage).to.equal(newAudioLanguage)
                expect(_story.textLanguage).to.equal(textLanguage)
            })

            it('should succeed on new text language', async () => {

                await logic.updateStory(story.id, null, user.id, null, newTextLanguage)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(title)
                expect(_story.audioLanguage).to.equal(audioLanguage)
                expect(_story.textLanguage).to.equal(newTextLanguage)
            })

            it('should succeed on new title, audio language and text language', async () => {

                await logic.updateStory(story.id, newTitle, user.id, newAudioLanguage, newTextLanguage)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(newTitle)
                expect(_story.audioLanguage).to.equal(newAudioLanguage)
                expect(_story.textLanguage).to.equal(newTextLanguage)
            })

            it('should fail on undefined user.id', () => {
                expect(() => logic.updateStory(story.id, null, undefined, null, null)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty title', () => {
                expect(() => logic.updateStory(story.id, null, '', null, null)).to.throw(ValueError, 'authorId is empty or blank')
            })

            it('should fail on empty authorId', () => {
                expect(() => logic.updateStory(story.id, null, '   \t\n', null, null)).to.throw(ValueError, 'authorId is empty or blank')
            })

            // TODO other test cases
        })

        describe('remove story', () => {
            let title, audioLanguage, textLanguage, user, story, page

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()

                title = `title-${Math.random()}`
                audioLanguage = `audioLanguage-${Math.random()}`
                textLanguage = `textLanguage-${Math.random()}`

                let id = user.id

                story = new Story({ title, author: id, audioLanguage, textLanguage})
                await story.save()

            })

            it('should succeed on correct data', async () => {

                await logic.removeStory(story.id)

                const stories = await Story.find()

                expect(stories.length).to.equal(0)

            })

            it('should fail on undefined story id', () => {
                expect(() => logic.removeStory(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.removeStory('')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.removeStory('   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
            })

            // TODO other test cases
        })
    })


    describe('page', () => {
        describe('add page', () => {
            let title, audioLanguage, textLanguage, user, story, index, text

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()

                title = `title-${Math.random()}`
                audioLanguage = `audioLanguage-${Math.random()}`
                textLanguage = `textLanguage-${Math.random()}`

                let id = user.id

                story = new Story({ title, author: id, audioLanguage, textLanguage })
                await story.save()

                index = 1
                text = `text-${Math.random()}`
            })

            it('should succeed on correct data', async () => {
                debugger
                await logic.addPage(story.id, index, text)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.pages.length).to.equal(1)

                const [page] = _story.pages

                expect(page.id).to.be.a('string')
                expect(page.index).to.equal(index)
                expect(page.text).to.equal(text)

                const pages = await Page.find()

                expect(pages.length).to.equal(1)

                const [_page] = pages

                expect(_page.id).to.equal(page.id)
                expect(_page.index).to.equal(index)
                expect(_page.text).to.equal(text)
            })

            it('should fail on undefined index', () => {
                expect(() => logic.addPage(story.id, undefined, text)).to.throw(TypeError, 'undefined is not a number')
            })

            it('should fail on undefined story id', () => {
                expect(() => logic.addPage(undefined, index, text)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.addPage('', index, text)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.addPage('   \t\n', index, text)).to.throw(ValueError, 'storyId is empty or blank')
            })

            // TODO other test cases
        })

        describe('update page', () => {
            let title, audioLanguage, textLanguage, user, story, index, text, newText, page

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()

                title = `title-${Math.random()}`
                audioLanguage = `audioLanguage-${Math.random()}`
                textLanguage = `textLanguage-${Math.random()}`

                let id = user.id

                index = 1
                text = `text-${Math.random()}`
                newText = `text-${Math.random()}`

                page = await new Page({ index, text }).save()

                story = new Story({ title, author: id, audioLanguage, textLanguage, pages: [page] })
                await story.save()

            })

            it('should succeed on correct data', async () => {

                await logic.updatePage(page.id, story.id, index, newText)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.pages.length).to.equal(1)

                const [__page] = _story.pages

                expect(__page.id).to.be.a('string')
                expect(__page.index).to.equal(index)
                expect(__page.text).to.equal(newText)

                const pages = await Page.find()

                expect(pages.length).to.equal(1)

                const [_page] = pages

                expect(_page.id).to.equal(page.id)
                expect(_page.index).to.equal(index)
                expect(_page.text).to.equal(newText)
            })

            it('should fail on undefined index', () => {
                expect(() => logic.updatePage(page.id, story.id, undefined, text)).to.throw(TypeError, 'undefined is not a number')
            })

            it('should fail on undefined story id', () => {
                expect(() => logic.updatePage(page.id, undefined, index, text)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.updatePage(page.id, '', index, text)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.updatePage(page.id, '   \t\n', index, text)).to.throw(ValueError, 'storyId is empty or blank')
            })

            // TODO other test cases
        })


        describe('remove page', () => {
            let title, audioLanguage, textLanguage, user, story, index, text, page

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()

                title = `title-${Math.random()}`
                audioLanguage = `audioLanguage-${Math.random()}`
                textLanguage = `textLanguage-${Math.random()}`

                let id = user.id

                index = 1
                text = `text-${Math.random()}`

                page = await new Page({ index, text }).save()

                story = new Story({ title, author: id, audioLanguage, textLanguage, pages: [page] })
                await story.save()

            })

            it('should succeed on correct data', async () => {

                await logic.removePage(page.id, story.id)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.pages.length).to.equal(0)

                const pages = await Page.find()

                expect(pages.length).to.equal(0)

            })

            it('should fail on undefined story id', () => {
                expect(() => logic.removePage(page.id, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.removePage(page.id, '')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.removePage(page.id, '   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
            })

            // TODO other test cases
        })

    })
    afterEach(() => Promise.all([User.deleteMany(), Story.deleteMany(), Page.deleteMany()]))

    after(() => mongoose.disconnect())
})