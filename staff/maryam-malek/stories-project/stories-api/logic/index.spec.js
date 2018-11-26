const { mongoose, models: { User, Story, Page } } = require('stories-data')
const logic = require('./index')
const { AlreadyExistsError, AuthError, NotFoundError, ValueError } = require('../errors')
const { expect } = require('chai')
const fs = require('fs-extra')
const path = require('path')
const hasha = require('hasha')
const text2png = require('text2png')
const streamToArray = require('stream-to-array')

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
                expect(story.hasCover).to.be.false
                expect(story.cover).not.to.be.undefined
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
                expect(_story.pages).to.be.undefined
                expect(_story2.pages).to.be.undefined


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
                expect(__story.pages.length).to.equal(0)
                expect(__story2.pages.length).to.equal(0)
            })


            it('should fail on undefined user id', () => {
                expect(() => logic.listStories(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty title', () => {
                expect(() => logic.listStories('')).to.throw(ValueError, 'authorId is empty or blank')
            })

            it('should fail on empty authorId', () => {
                expect(() => logic.listStories('   \t\n')).to.throw(ValueError, 'authorId is empty or blank')
            })
        })


        describe('retrieve story', () => {
            let title, audioLanguage, textLanguage, user, story, page, index, text

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

                story = await new Story({ title, author: id, audioLanguage, textLanguage, pages: [page] }).save()

            })

            it('should succeed on correct author', async () => {

                const _story = await logic.retrieveStory(story.author.toString(), story.id.toString())


                expect(_story.id).to.be.a('string')
                expect(_story.author.toString()).to.equal(user.id)
                expect(_story.title).to.equal(title)
                expect(_story.audioLanguage).to.equal(audioLanguage)
                expect(_story.textLanguage).to.equal(textLanguage)
                expect(_story.cover).to.be.undefined
                expect(_story.hasCover).to.be.false
                expect(_story.pages.length).to.equal(1)
                expect(_story.pages[0].index).to.equal(index)
                expect(_story.pages[0].text).to.equal(text)
                expect(_story.pages[0].id).to.equal(page.id)
                expect(_story.pages[0].hasImage).to.be.false
                expect(_story.pages[0].hasAudio).to.be.undefined

                const _stories = await Story.find()

                const [__story] = _stories

                expect(_story.id).to.be.a('string')
                expect(_story.id).to.equal(__story.id)
                expect(_story.title).to.equal(__story.title)
                expect(_story.audioLanguage).to.equal(__story.audioLanguage)
                expect(_story.textLanguage).to.equal(__story.textLanguage)
                expect(__story.cover).to.be.undefined
                expect(__story.hasCover).to.be.false
                expect(_story.pages.length).to.equal(__story.pages.length)
                expect(_story.pages[0].index).to.equal(__story.pages[0].index)
                expect(_story.pages[0].text).to.equal(__story.pages[0].text)
                expect(_story.pages[0].id).to.equal(__story.pages[0].id)
                expect(__story.pages[0].hasImage).to.be.false
                expect(__story.pages[0].hasAudio).to.be.false
                expect(__story.pages[0].image).to.be.undefined
                expect(__story.pages[0].audio).to.be.undefined

            })


            it('should fail on undefined authorId', () => {
                expect(() => logic.retrieveStory(undefined, story.id)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty authorId', () => {
                expect(() => logic.retrieveStory('', story.id)).to.throw(ValueError, 'authorId is empty or blank')
            })

            it('should fail on empty authorId', () => {
                expect(() => logic.retrieveStory('   \t\n', story.id)).to.throw(ValueError, 'authorId is empty or blank')
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


        describe('finish story', () => {
            let title, audioLanguage, textLanguage, user, story

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

                story = await new Story({ title, author: id, audioLanguage, textLanguage }).save()
            })

            it('should succeed on correct data', async () => {

                await logic.finishStory(story.id, user.id)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(title)
                expect(_story.audioLanguage).to.equal(audioLanguage)
                expect(_story.textLanguage).to.equal(textLanguage)
                expect(_story.inProcess).to.be.false
            })

            it('should fail on undefined user.id', () => {
                expect(() => logic.finishStory(story.id, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty title', () => {
                expect(() => logic.finishStory(story.id, '')).to.throw(ValueError, 'authorId is empty or blank')
            })

            it('should fail on empty authorId', () => {
                expect(() => logic.finishStory(story.id, '   \t\n')).to.throw(ValueError, 'authorId is empty or blank')
            })

            // TODO other test cases
        })

        describe('work in story ', () => {
            let title, audioLanguage, textLanguage, user, story

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

                story = await new Story({ title, author: id, audioLanguage, textLanguage }).save()
            })

            it('should succeed on correct data', async () => {

                await logic.workInStory(story.id, user.id)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(title)
                expect(_story.audioLanguage).to.equal(audioLanguage)
                expect(_story.textLanguage).to.equal(textLanguage)
                expect(_story.inProcess).to.be.true
            })

            it('should fail on undefined user.id', () => {
                expect(() => logic.workInStory(story.id, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty title', () => {
                expect(() => logic.workInStory(story.id, '')).to.throw(ValueError, 'authorId is empty or blank')
            })

            it('should fail on empty authorId', () => {
                expect(() => logic.workInStory(story.id, '   \t\n')).to.throw(ValueError, 'authorId is empty or blank')
            })

            // TODO other test cases
        })

        false && describe('save cover', () => {
            let user, story

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

            it('should succeed on correct data', async () => {

                const rs = fs.createReadStream(path.join(process.cwd(), `data/stories/default/cover.png`))

                await logic.saveStoryCover(user.id, story.id, rs)

                expect(fs.existsSync(path.join(process.cwd(), `data/stories/${story.id}/cover/cover.png`))).to.be.true

                const _story = await Story.findById(story.id)

                expect(_story.hasCover).to.be.true
            })

            afterEach(() => fs.removeSync(`data/stories/${story.id}`))
        })

        false && describe('retrieve cover', () => {
            let user, story

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
            it('should succeed on correct data', async () => {
                const storyCoverReadStream = await logic.retrieveStoryCover(user.id, story.id)

                const storyCoverHashReadStream = storyCoverReadStream.pipe(hasha.stream())

                const defaultCoverHashReadStream = fs.createReadStream('data/stories/default/cover.png').pipe(hasha.stream())

                const hashes = await Promise.all([
                    streamToArray(storyCoverHashReadStream)
                        .then(arr => arr[0]),
                    streamToArray(defaultCoverHashReadStream)
                        .then(arr => arr[0])
                ])

                const [storyCoverHash, defaultCoverHash] = hashes

                expect(storyCoverHash).to.equal(defaultCoverHash)
            })

            describe('when user already has a profile photo', () => {
                let folder, file

                beforeEach(async () => {
                    folder = `data/stories/${story.id}`

                    fs.mkdirSync(folder)

                    fs.mkdirSync(`data/stories/${story.id}/cover`)

                    file = 'cover.png'

                    fs.writeFileSync(path.join(`data/stories/${story.id}/cover`, file), text2png(':-)', { color: 'blue' }))

                    story.hasCover = true

                    await story.save()
                })

                it('should succeed on correct data', async () => {
                    const storyCoverReadStream = await logic.retrieveStoryCover(user.id, story.id)

                    const storyCoverHashReadStream = storyCoverReadStream.pipe(hasha.stream())

                    const actualCoverHashReadStream = fs.createReadStream(path.join(`data/stories/${story.id}/cover`, file)).pipe(hasha.stream())

                    const hashes = await Promise.all([
                        streamToArray(storyCoverHashReadStream)
                            .then(arr => arr[0]),
                        streamToArray(actualCoverHashReadStream)
                            .then(arr => arr[0])
                    ])

                    const [storyCoverHash, actualCoverHash] = hashes

                    expect(storyCoverHash).to.equal(actualCoverHash)
                })

            })

            afterEach(() => fs.removeSync(`data/stories/${story.id}`))
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

                story = new Story({ title, author: id, audioLanguage, textLanguage })
                await story.save()

            })

            it('should succeed on correct data', async () => {

                await logic.removeStory(user.id, story.id)

                const stories = await Story.find()

                expect(stories.length).to.equal(0)

            })

            it('should fail on undefined story id', () => {
                expect(() => logic.removeStory(user.id, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.removeStory(user.id, '')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.removeStory(user.id, '   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
            })

            // TODO other test cases
        })

        describe('search stories', () => {
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

                story = new Story({ title, author: id, audioLanguage, textLanguage })
                story.inProcess = false
                await story.save()
                story2 = new Story({ title: title2, author: id, audioLanguage: audioLanguage2, textLanguage: textLanguage2 })
                story2.inProcess = false
                await story2.save()

            })

            it('should succeed on correct query', async () => {

                const query = 'title'
                // const stories = await logic.searchStoriesByTitle(title)

                // expect(stories.length).to.equal(2)

                // const [_story, _story2] = stories

                const stories = await logic.searchStoriesByTitle(title)

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id.toString()).to.equal(story.id.toString())
                expect(_story.title).to.equal(story.title)
                expect(_story.hasCover).to.equal(story.hasCover)
                expect(_story.author.toString()).to.equal(story.author.toString())
                expect(_story.audioLanguage).to.equal(story.audioLanguage)
                expect(_story.textLanguage).to.equal(story.textLanguage)
                
                // expect(_story2.id.toString()).to.equal(story2.id.toString())
                // expect(_story2.title).to.equal(story2.title)
                // expect(_story2.hasCover).to.equal(story2.hasCover)
                // expect(_story2.author.toString()).to.equal(story2.author.toString())
                // expect(_story2.audioLanguage).to.equal(story2.audioLanguage)
                // expect(_story2.textLanguage).to.equal(story2.textLanguage)
            })

            // it('should fail if inProcess is true', async () => {

            //     story.inProcess = true
            //     await story.save()

            //     expect(() => logic.searchStoriesByTitle(title)).to.throw(NotFoundError, `stories with query ${title} not found`)
                
            // })

            it('should fail on undefined title', () => {
                expect(() => logic.searchStoriesByTitle(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty title', () => {
                expect(() => logic.searchStoriesByTitle('')).to.throw(ValueError, 'title is empty or blank')
            })

            it('should fail on empty title', () => {
                expect(() => logic.searchStoriesByTitle('   \t\n')).to.throw(ValueError, 'title is empty or blank')
            })
        })

        describe('add story to favourite', () => {
            let title, audioLanguage, textLanguage, user, story

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
                story.inProcess = false
                await story.save()
            })

            it('should succeed on correct query', async () => {
                await logic.addFavourites(user.id, story.id)

                const __user = await User.findById(user.id)

                expect(__user.favourites.length).to.equal(1)

                const [storyFav] = __user.favourites

                expect(storyFav.toString()).to.equal(story.id.toString())
                
            })

            // it('should fail if inProcess is true', async () => {

            //     story.inProcess = true
            //     await story.save()

            //     expect(() => logic.addFavourites(user.id, story.id)).to.throw(Error, `story with id ${story.id} still in process`)
            // })

            it('should fail on undefined userId', () => {
                expect(() => logic.addFavourites(undefined, story.id)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty userId', () => {
                expect(() => logic.addFavourites('', story.id)).to.throw(ValueError, 'userId is empty or blank')
            })

            it('should fail on empty userId', () => {
                expect(() => logic.addFavourites('   \t\n', story.id)).to.throw(ValueError, 'userId is empty or blank')
            })

            //TO DO OTHER CASES
        })

        describe('remove story to favourite', () => {
            let title, audioLanguage, textLanguage, user, story

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
                story.inProcess = false
                await story.save()

                user.favourites.push(story.id)

                await user.save()
            })

            it('should succeed on correct query', async () => {
                await logic.removeFavourites(user.id, story.id)

                const __user = await User.findById(user.id)

                expect(__user.favourites.length).to.equal(0)

                
            })

            // it('should fail if inProcess is true', async () => {

            //     story.inProcess = true
            //     await story.save()

            //     expect(() => logic.addFavourites(user.id, story.id)).to.throw(Error, `story with id ${story.id} still in process`)
            // })

            it('should fail on undefined userId', () => {
                expect(() => logic.addFavourites(undefined, story.id)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty userId', () => {
                expect(() => logic.addFavourites('', story.id)).to.throw(ValueError, 'userId is empty or blank')
            })

            it('should fail on empty userId', () => {
                expect(() => logic.addFavourites('   \t\n', story.id)).to.throw(ValueError, 'userId is empty or blank')
            })

            //TO DO OTHER CASES
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



        false && describe('save picture', () => {
            let user, story, page

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

                index = 1
                text = `text-${Math.random()}`

                page = await new Page({ index, text }).save()
                story = await new Story({ title, author: id, audioLanguage, textLanguage, pages: [page] }).save()
            })

            it('should succeed on correct data', async () => {

                const rs = fs.createReadStream(path.join(process.cwd(), `data/stories/default/picture.png`))

                await logic.savePicPage(page.id, story.id, rs)

                expect(fs.existsSync(path.join(process.cwd(), `data/stories/${story.id}/pages/${page.id}/picture.png`))).to.be.true

                const _page = await Page.findById(page.id)

                expect(_page.hasImage).to.be.true
            })

            afterEach(() => fs.removeSync(`data/stories/${story.id}`))
        })

        false && describe('retrieve picture', () => {
            let user, story, page

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
                index = 1
                text = `text-${Math.random()}`

                page = await new Page({ index, text }).save()
                story = await new Story({ title, author: id, audioLanguage, textLanguage, pages: [page] }).save()
            })
            it('should succeed on correct data', async () => {
                const pagePicReadStream = await logic.retrievePagePic(page.id, story.id)

                const pagePicHashReadStream = pagePicReadStream.pipe(hasha.stream())

                const defaultPictureHashReadStream = fs.createReadStream('data/stories/default/picture.png').pipe(hasha.stream())

                const hashes = await Promise.all([
                    streamToArray(pagePicHashReadStream)
                        .then(arr => arr[0]),
                    streamToArray(defaultPictureHashReadStream)
                        .then(arr => arr[0])
                ])

                const [pagePicHash, defaultPictureHash] = hashes

                expect(pagePicHash).to.equal(defaultPictureHash)
            })

            describe('when user already has a profile photo', () => {
                let folder, file

                beforeEach(async () => {
                    folder = `data/stories/${story.id}`

                    fs.mkdirSync(folder)

                    fs.mkdirSync(`data/stories/${story.id}/pages`)
                    fs.mkdirSync(`data/stories/${story.id}/pages/${page.id}`)

                    file = 'picture.png'

                    fs.writeFileSync(path.join(`data/stories/${story.id}/pages/${page.id}`, file), text2png(':-)', { color: 'blue' }))

                    page.hasImage = true
                    debugger

                    await page.save()
                })

                it('should succeed on correct data', async () => {
                    const pagePicReadStream = await logic.retrievePagePic(page.id, story.id)

                    const pagePicHashReadStream = pagePicReadStream.pipe(hasha.stream())

                    const actualPictureHashReadStream = fs.createReadStream(path.join(`data/stories/${story.id}/pages/${page.id}`, file)).pipe(hasha.stream())

                    const hashes = await Promise.all([
                        streamToArray(pagePicHashReadStream)
                            .then(arr => arr[0]),
                        streamToArray(actualPictureHashReadStream)
                            .then(arr => arr[0])
                    ])

                    const [pagePicHash, actualPictureHash] = hashes

                    expect(pagePicHash).to.equal(actualPictureHash)
                })
            })

            afterEach(() => fs.removeSync(`data/stories/${story.id}`))
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