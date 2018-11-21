// import logic from './logic'
const logic = require('./logic')
const { mongoose, models: { User, Story, Page } } = require('stories-data')

require('isomorphic-fetch')
global.sessionStorage = require('sessionstorage')
const { expect } = require('chai')
const fs = require('fs-extra')
const path = require('path')

const { AlreadyExistsError, AuthError, NotFoundError, ValueError } = require('./errors')

const MONGO_URL = 'mongodb://localhost:27017/stories-app'


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
                const res = await logic.register(name, surname, username, password)

                expect(res).to.be.undefined
            })

            it('should fail on repeted username', async () => {
                try {
                    await logic.register(name, surname, username, password)
                    // expect(true).to.be.false
                } catch (err) {
                    expect(err).to.be.instanceof(Error)
                    expect(err.message).to.equal(`username ${username} already registered`)
                }

            })

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

        describe('login', () => {
            describe('with existing user', () => {
                let username, password

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    await logic.register(name, surname, username, password)
                })

                it('should succeed on correct data', async () => {
                    const res = await logic.login(username, password)

                    expect(res).to.be.undefined
                })

                it('should fail on undefined username', () => {
                    expect(() => logic.login(undefined, password)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on empty username', () => {
                    expect(() => logic.login('', password)).to.throw(ValueError, 'username is empty or blank')
                })

                it('should fail on blank username', () => {
                    expect(() => logic.login('   \t\n', password)).to.throw(ValueError, 'username is empty or blank')
                })

                // TODO other test cases

            })

            describe('without existing user', () => {

                it('should fail with unregistered username', async () => {
                    try {
                        let username = `username-${Math.random()}`
                        await logic.login(username, `password-${Math.random()}`)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`invalid username or password`)
                    }
                })
            })
        })

        describe('logout', () => {
            let name, surname, username, password

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                await logic.register(name, surname, username, password)
                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {
                const res = await logic.logout()

                expect(res).to.be.undefined
            })

            // TODO other test cases
        })

        describe('retrieve user', () => {
            describe('with existing user', () => {
                let name, surname, username, password

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                })

                it('should succeed on correct data', async () => {
                    const user = await logic.retrieveUser()

                    expect(user.id).not.to.be.undefined
                    expect(user.name).to.equal(name)
                    expect(user.surname).to.equal(surname)
                    expect(user.username).to.equal(username)
                })

                // TODO other test cases
            })
        })


    })


    describe('stories', () => {

        describe('add story', () => {
            describe('with existing user', () => {
                let title, audioLanguage, textLanguage

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    title = `t-${Math.random()}`
                    audioLanguage = `a-${Math.random()}`
                    textLanguage = `tL-${Math.random()}`

                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                })

                it('should succeed on correct data', async () => {

                    await logic.addStory(title, audioLanguage, textLanguage)

                    const users = await User.find()

                    expect(users.length).to.equal(1)

                    const [user] = users

                    const stories = await Story.find()

                    expect(stories.length).to.equal(1)

                    const [story] = stories

                    expect(story.id).not.to.be.undefined
                    expect(story.title).to.equal(title)
                    expect(story.audioLanguage).to.equal(audioLanguage)
                    expect(story.textLanguage).to.equal(textLanguage)
                    expect(story.author.toString()).to.equal(user.id)
                    expect(story.hasCover).to.be.false
                    expect(story.cover).not.to.be.undefined
                    expect(story.inProcess).to.be.true
                })

                it('should fail on undefined title', () => {
                    expect(() => logic.addStory(undefined, audioLanguage, textLanguage)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on empty title', () => {
                    expect(() => logic.addStory('', audioLanguage, textLanguage)).to.throw(ValueError, 'title is empty or blank')
                })

                it('should fail on blank title', () => {
                    expect(() => logic.addStory('   \t\n', audioLanguage, textLanguage)).to.throw(ValueError, 'title is empty or blank')
                })

                // TODO other test cases
            })
        })


        describe('list stories', () => {
            describe('with existing user', () => {
                let title, audioLanguage, textLanguage

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    title = `t-${Math.random()}`
                    audioLanguage = `a-${Math.random()}`
                    textLanguage = `tL-${Math.random()}`

                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                    await logic.addStory(title, audioLanguage, textLanguage)
                })

                it('should succeed on correct data', async () => {

                    const stories = await logic.listStories()

                    expect(stories.length).to.equal(1)

                    const [story] = stories

                    const users = await User.find()

                    expect(users.length).to.equal(1)

                    const [user] = users

                    const _stories = await Story.find()

                    const [_story] = _stories

                    expect(story.id).not.to.be.undefined
                    expect(story.title).to.equal(title)
                    expect(story.audioLanguage).to.equal(audioLanguage)
                    expect(story.textLanguage).to.equal(textLanguage)
                    expect(story.author.toString()).to.equal(user.id)
                    expect(story.hasCover).to.be.undefined
                    expect(story.cover).not.to.be.undefined
                    expect(story.inProcess).to.be.true

                    expect(story.id).to.equal(_story.id)
                    expect(story.title).to.equal(_story.title)
                    expect(story.audioLanguage).to.equal(_story.audioLanguage)
                    expect(story.textLanguage).to.equal(_story.textLanguage)
                    expect(story.author.toString()).to.equal(_story.author.toString())
                    expect(story.hasCover).not.to.equal(_story.hasCover)
                    expect(story.cover).to.equal(_story.cover)
                    expect(story.inProcess).to.equal(_story.inProcess)
                })

                // TODO other test cases
            })
        })

        describe('retrieve story', () => {
            describe('with existing user', () => {
                let title, audioLanguage, textLanguage

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    title = `t-${Math.random()}`
                    audioLanguage = `a-${Math.random()}`
                    textLanguage = `tL-${Math.random()}`

                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                    await logic.addStory(title, audioLanguage, textLanguage)
                })

                it('should succeed on correct data', async () => {
                    const _stories = await Story.find()

                    const [_story] = _stories

                    const story = await logic.retrieveStory(_story.id)

                    const users = await User.find()

                    expect(users.length).to.equal(1)

                    const [user] = users

                    expect(story.id).not.to.be.undefined
                    expect(story.title).to.equal(title)
                    expect(story.audioLanguage).to.equal(audioLanguage)
                    expect(story.textLanguage).to.equal(textLanguage)
                    expect(story.author.toString()).to.equal(user.id)
                    expect(story.hasCover).to.be.undefined
                    expect(story.cover).not.to.be.undefined
                    expect(story.inProcess).to.be.true
                    expect(story.pages).not.to.be.undefined
                    expect(story.pages.length).to.equal(0)

                    expect(story.id).to.equal(_story.id)
                    expect(story.title).to.equal(_story.title)
                    expect(story.audioLanguage).to.equal(_story.audioLanguage)
                    expect(story.textLanguage).to.equal(_story.textLanguage)
                    expect(story.author.toString()).to.equal(_story.author.toString())
                    expect(story.hasCover).not.to.equal(_story.hasCover)
                    expect(story.cover).to.equal(_story.cover)
                    expect(story.inProcess).to.equal(_story.inProcess)
                    expect(story.pages.length).to.equal(_story.pages.length)
                })


                it('should fail on undefined storyId', () => {
                    expect(() => logic.retrieveStory(undefined)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on empty storyId', () => {
                    expect(() => logic.retrieveStory('')).to.throw(ValueError, 'storyId is empty or blank')
                })

                it('should fail on blank storyId', () => {
                    expect(() => logic.retrieveStory('   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
                })
                // TODO other test cases
            })
        })


        describe('update story', () => {
            describe('with existing user', () => {
                let title, audioLanguage, textLanguage, newTitle, newAudioLanguage, newTextLanguage

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    title = `t-${Math.random()}`
                    audioLanguage = `a-${Math.random()}`
                    textLanguage = `tL-${Math.random()}`

                    newTitle = `${title}-${Math.random()}`
                    newAudioLanguage = `${audioLanguage}-${Math.random()}`
                    newTextLanguage = `${textLanguage}-${Math.random()}`

                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                    await logic.addStory(title, audioLanguage, textLanguage)
                })

                it('should succeed on changing title, audio language and text language', async () => {
                    const stories = await Story.find()

                    let [story] = stories

                    await logic.updateStory(story.id, newTitle, newAudioLanguage, newTextLanguage)

                    const users = await User.find()

                    expect(users.length).to.equal(1)

                    const [user] = users

                    const _stories = await Story.find()

                    expect(_stories.length).to.equal(1)

                    const [_story] = _stories

                    expect(_story.id).to.equal(story.id)
                    expect(_story.title).to.equal(newTitle)
                    expect(_story.audioLanguage).to.equal(newAudioLanguage)
                    expect(_story.textLanguage).to.equal(newTextLanguage)
                    expect(_story.author.toString()).to.equal(user.id)
                    expect(_story.hasCover).to.be.false
                    expect(_story.cover).not.to.be.undefined
                    expect(_story.inProcess).to.be.true
                    expect(_story.pages).not.to.be.undefined
                    expect(_story.pages.length).to.equal(0)
                })

                it('should succeed on changing only title', async () => {
                    const stories = await Story.find()

                    let [story] = stories

                    await logic.updateStory(story.id, newTitle, audioLanguage, textLanguage)

                    const users = await User.find()

                    expect(users.length).to.equal(1)

                    const [user] = users

                    const _stories = await Story.find()

                    expect(_stories.length).to.equal(1)

                    const [_story] = _stories

                    expect(_story.id).to.equal(story.id)
                    expect(_story.title).to.equal(newTitle)
                    expect(_story.audioLanguage).to.equal(audioLanguage)
                    expect(_story.textLanguage).to.equal(textLanguage)
                    expect(_story.author.toString()).to.equal(user.id)
                    expect(_story.hasCover).to.be.false
                    expect(_story.cover).not.to.be.undefined
                    expect(_story.inProcess).to.be.true
                    expect(_story.pages).not.to.be.undefined
                    expect(_story.pages.length).to.equal(0)
                })

                it('should succeed on changing only audio language', async () => {
                    const stories = await Story.find()

                    let [story] = stories

                    await logic.updateStory(story.id, title, newAudioLanguage, textLanguage)

                    const users = await User.find()

                    expect(users.length).to.equal(1)

                    const [user] = users

                    const _stories = await Story.find()

                    expect(_stories.length).to.equal(1)

                    const [_story] = _stories

                    expect(_story.id).to.equal(story.id)
                    expect(_story.title).to.equal(title)
                    expect(_story.audioLanguage).to.equal(newAudioLanguage)
                    expect(_story.textLanguage).to.equal(textLanguage)
                    expect(_story.author.toString()).to.equal(user.id)
                    expect(_story.hasCover).to.be.false
                    expect(_story.cover).not.to.be.undefined
                    expect(_story.inProcess).to.be.true
                    expect(_story.pages).not.to.be.undefined
                    expect(_story.pages.length).to.equal(0)
                })

                it('should succeed on changing only text language', async () => {
                    const stories = await Story.find()

                    let [story] = stories

                    await logic.updateStory(story.id, title, audioLanguage, newTextLanguage)

                    const users = await User.find()

                    expect(users.length).to.equal(1)

                    const [user] = users

                    const _stories = await Story.find()

                    expect(_stories.length).to.equal(1)

                    const [_story] = _stories

                    expect(_story.id).to.equal(story.id)
                    expect(_story.title).to.equal(title)
                    expect(_story.audioLanguage).to.equal(audioLanguage)
                    expect(_story.textLanguage).to.equal(newTextLanguage)
                    expect(_story.author.toString()).to.equal(user.id)
                    expect(_story.hasCover).to.be.false
                    expect(_story.cover).not.to.be.undefined
                    expect(_story.inProcess).to.be.true
                    expect(_story.pages).not.to.be.undefined
                    expect(_story.pages.length).to.equal(0)
                })

                // TODO other test cases

                it('should fail on undefined storyId', () => {
                    expect(() => logic.updateStory(undefined, newTitle, newAudioLanguage, newTextLanguage)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on empty storyId', () => {
                    expect(() => logic.updateStory('', newTitle, newAudioLanguage, newTextLanguage)).to.throw(ValueError, 'storyId is empty or blank')
                })

                it('should fail on blank storyId', () => {
                    expect(() => logic.updateStory('   \t\n', newTitle, newAudioLanguage, newTextLanguage)).to.throw(ValueError, 'storyId is empty or blank')
                })
                // TODO other test cases
            })
        })


        describe('finish story', () => {
            describe('with existing user', () => {
                let title, audioLanguage, textLanguage

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    title = `t-${Math.random()}`
                    audioLanguage = `a-${Math.random()}`
                    textLanguage = `tL-${Math.random()}`
  
                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                    await logic.addStory(title, audioLanguage, textLanguage)
                })

                it('should succeed on changing title, audio language and text language', async () => {
                    const stories = await Story.find()

                    let [story] = stories

                    await logic.finishStory(story.id)

                    const users = await User.find()

                    expect(users.length).to.equal(1)

                    const [user] = users

                    const _stories = await Story.find()

                    expect(_stories.length).to.equal(1)

                    const [_story] = _stories

                    expect(_story.id).to.equal(story.id)
                    expect(_story.inProcess).to.be.false
                    expect(_story.inProcess).not.to.equal(story.inProcess)
                })

                it('should fail on undefined storyId', () => {
                    expect(() => logic.finishStory(undefined)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on empty storyId', () => {
                    expect(() => logic.finishStory('')).to.throw(ValueError, 'storyId is empty or blank')
                })

                it('should fail on blank storyId', () => {
                    expect(() => logic.finishStory('   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
                })
                // TODO other test cases
            })
        })


        describe('save story cover', () => {
            let title, audioLanguage, textLanguage, story

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                title = `t-${Math.random()}`
                audioLanguage = `a-${Math.random()}`
                textLanguage = `tL-${Math.random()}`

                await logic.register(name, surname, username, password)
                await logic.login(username, password)
                await logic.addStory(title, audioLanguage, textLanguage)

                stories = await Story.find()

                story = stories[0]
            })

            it('should succeed on correct data', async () => {
                const processCwdPath = '/Users/maryamdot/bootcamp/collab/skylab-bootcamp-201809/staff/maryam-malek/stories-project'

                const pic = fs.existsSync(path.join(processCwdPath, `stories-app/src/components/Login.js`))

                const rs = await fs.createReadStream(path.join(processCwdPath, `stories-api/data/stories/default/cover.png`))

                await logic.saveStoryCover(story.id, rs)

                expect(fs.existsSync(path.join(processCwdPath, `stories-api/data/stories/${story.id}/cover/cover.png`))).to.be.true


                const _story = await Story.findById(story.id)

                expect(_story.hasCover).to.be.true
            })


            it('should fail on undefined storyId', () => {
                expect(() => logic.saveStoryCover(undefined, '')).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.saveStoryCover('', '')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank storyId', () => {
                expect(() => logic.saveStoryCover('   \t\n', '')).to.throw(ValueError, 'storyId is empty or blank')
            })
            // TODO other test cases

            // afterEach(() => fs.removeSync(`stories-api/data/stories/${story.id}`))
        })



        describe('retrieve story cover', () => {
            let title, audioLanguage, textLanguage, story

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                title = `t-${Math.random()}`
                audioLanguage = `a-${Math.random()}`
                textLanguage = `tL-${Math.random()}`

                await logic.register(name, surname, username, password)
                await logic.login(username, password)
                await logic.addStory(title, audioLanguage, textLanguage)

                stories = await Story.find()

                story = stories[0]

                // const processCwdPath = '/Users/maryamdot/bootcamp/collab/skylab-bootcamp-201809/staff/maryam-malek/stories-project'

                // const rs = fs.createReadStream(path.join(processCwdPath, `stories-api/data/stories/default/cover.png`))

                // await logic.saveStoryCover(story.id, rs)
            })

            //     it('should succeed on correct data', async () => {

            //         await logic.retrieveStoryCover(story.id)

            //         expect(fs.existsSync(path.join(processCwdPath, `stories-app/src/components/Login.js`))).to.be.true
            //         //stories-api/data/stories/${story.id}/cover/cover.png

            //         const _story = await Story.findById(story.id)

            //         expect(_story.hasCover).to.be.true
            //     })


            //     it('should fail on undefined storyId', () => {
            //         expect(() => logic.saveStoryCover(undefined, '')).to.throw(TypeError, 'undefined is not a string')
            //     })

            //     it('should fail on empty storyId', () => {
            //         expect(() => logic.saveStoryCover('', '')).to.throw(ValueError, 'storyId is empty or blank')
            //     })

            //     it('should fail on blank storyId', () => {
            //         expect(() => logic.saveStoryCover('   \t\n', '')).to.throw(ValueError, 'storyId is empty or blank')
            //     })
            //     // TODO other test cases

            //     // afterEach(() => fs.removeSync(`stories-api/data/stories/${story.id}`))
        })



        describe('remove story', () => {
            describe('with existing user', () => {
                let title, audioLanguage, textLanguage, story

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    title = `t-${Math.random()}`
                    audioLanguage = `a-${Math.random()}`
                    textLanguage = `tL-${Math.random()}`

                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                    await logic.addStory(title, audioLanguage, textLanguage)

                    stories = await Story.find()

                    story = stories[0]
                })

                it('should succeed on correct data', async () => {
                    await logic.removeStory(story.id)

                    const users = await User.find()

                    expect(users.length).to.equal(1)

                    const [user] = users

                    _stories = await Story.find()

                    expect(_stories.length).to.equal(0)
                })


                it('should fail on undefined storyId', () => {
                    expect(() => logic.removeStory(undefined)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on empty storyId', () => {
                    expect(() => logic.removeStory('')).to.throw(ValueError, 'storyId is empty or blank')
                })

                it('should fail on blank storyId', () => {
                    expect(() => logic.removeStory('   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
                })
                // TODO other test cases
            })
        })



        describe('add page', () => {
            describe('with existing user', () => {
                let title, audioLanguage, textLanguage, story, index, text

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    title = `t-${Math.random()}`
                    audioLanguage = `a-${Math.random()}`
                    textLanguage = `tL-${Math.random()}`

                    index = 1
                    text = `txt-${Math.random()}`

                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                    await logic.addStory(title, audioLanguage, textLanguage)

                    stories = await Story.find()

                    story = stories[0]
                })

                it('should succeed on correct data', async () => {
                    
                    await logic.addPage(story.id, index, text)

                    _story = await Story.findById(story.id)

                    expect(_story.pages.length).to.equal(1)
                    expect(_story.pages[0].index).to.equal(index)
                    expect(_story.pages[0].text).to.equal(text)

                    pages = await Page.find()

                    expect(pages.length).to.equal(1)

                    const [page] = pages

                    expect(page.id).to.equal(_story.pages[0].id)
                    expect(page.index).to.equal(index)
                    expect(page.text).to.equal(text)
                })

                it('should fail on undefined storyId', () => {
                    expect(() => logic.addPage(undefined, index, text)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on empty storyId', () => {
                    expect(() => logic.addPage('', index, text)).to.throw(ValueError, 'storyId is empty or blank')
                })

                it('should fail on blank storyId', () => {
                    expect(() => logic.addPage('   \t\n', index, text)).to.throw(ValueError, 'storyId is empty or blank')
                })
                // TODO other test cases
            })
        })



        describe('update page', () => {
            describe('with existing user', () => {
                let title, audioLanguage, textLanguage, story, index, text, newText, page

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    title = `t-${Math.random()}`
                    audioLanguage = `a-${Math.random()}`
                    textLanguage = `tL-${Math.random()}`

                    index = 1
                    text = `txt-${Math.random()}`
                    newText = `${text}-${Math.random()}`

                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                    await logic.addStory(title, audioLanguage, textLanguage)
                    
                    stories = await Story.find()
                    
                    story = stories[0]
                    
                    await logic.addPage(story.id, index, text)

                    const pages = await Page.find()
                    page = pages[0]
                })

                it('should succeed on correct data', async () => {
        
                    await logic.updatePage(page.id, story.id, index, newText)

                    _story = await Story.findById(story.id)

                    expect(_story.pages.length).to.equal(1)
                    expect(_story.pages[0].index).to.equal(index)
                    expect(_story.pages[0].text).to.equal(newText)

                    expect(page.id).to.equal(_story.pages[0].id)
                    expect(page.index).to.equal(_story.pages[0].index)
                    expect(page.text).not.to.equal(_story.pages[0].text)
                })

                it('should fail on repeted username', async () => {
                    try {
                        await logic.updatePage(page.id, story.id, 2, newText)
                        // expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`page with id ${page.id} not found`)
                    }
                })

                it('should fail on undefined storyId', () => {
                    expect(() => logic.updatePage(page.id, undefined, index, newText)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on empty storyId', () => {
                    expect(() => logic.updatePage(page.id, '', index, newText)).to.throw(ValueError, 'storyId is empty or blank')
                })

                it('should fail on blank storyId', () => {
                    expect(() => logic.updatePage(page.id, '   \t\n', index, newText)).to.throw(ValueError, 'storyId is empty or blank')
                })
                // TODO other test cases
            })
        })


        describe('remove page', () => {
            describe('with existing user', () => {
                let title, audioLanguage, textLanguage, story, index, text, page

                beforeEach(async () => {
                    name = `n-${Math.random()}`
                    surname = `s-${Math.random()}`
                    username = `u-${Math.random()}`
                    password = `p-${Math.random()}`

                    title = `t-${Math.random()}`
                    audioLanguage = `a-${Math.random()}`
                    textLanguage = `tL-${Math.random()}`

                    index = 1
                    text = `txt-${Math.random()}`

                    await logic.register(name, surname, username, password)
                    await logic.login(username, password)
                    await logic.addStory(title, audioLanguage, textLanguage)
                    
                    stories = await Story.find()
                    
                    story = stories[0]
                    
                    await logic.addPage(story.id, index, text)

                    const pages = await Page.find()
                    page = pages[0]
                })

                it('should succeed on correct data', async () => {
        
                    await logic.removePage(page.id, story.id)

                    _story = await Story.findById(story.id)

                    expect(_story.pages.length).to.equal(0)
                
                })

                it('should fail on undefined storyId', () => {
                    expect(() => logic.removePage(page.id, undefined)).to.throw(TypeError, 'undefined is not a string')
                })

                it('should fail on empty storyId', () => {
                    expect(() => logic.removePage(page.id, '')).to.throw(ValueError, 'storyId is empty or blank')
                })

                it('should fail on blank storyId', () => {
                    expect(() => logic.removePage(page.id, '   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
                })
                // TODO other test cases
            })
        })


    })
    afterEach(() => Promise.all([User.deleteMany(), Story.deleteMany(), Page.deleteMany()]))

    after(() => mongoose.disconnect())
})