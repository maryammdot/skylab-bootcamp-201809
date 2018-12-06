require('dotenv').config()
global.sessionStorage = require('sessionstorage')
const logic = require('./logic')
const { mongoose, models: { User, Story, Page } } = require('stories-data')

require('isomorphic-fetch')
const { expect } = require('chai')
const fs = require('fs-extra')
const path = require('path')

const { ValueError } = require('./errors')

const MONGO_URL = process.env.REACT_APP_MONGO_URL

logic.url = process.env.REACT_APP_API_URL

describe('logic', () => {
    before(() => mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true }))

    beforeEach(() => Promise.all([User.deleteMany(), Story.deleteMany()]))

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

            it('should fail on undefined name', () => {
                expect(() => logic.register(undefined, surname, username, password)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty name', () => {
                expect(() => logic.register('', surname, username, password)).to.throw(ValueError, 'name is empty or blank')
            })

            it('should fail on blank name', () => {
                expect(() => logic.register('   \t\n', surname, username, password)).to.throw(ValueError, 'name is empty or blank')
            })

            it('should fail on undefined surname', () => {
                expect(() => logic.register(name, undefined, username, password)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty surname', () => {
                expect(() => logic.register(name, '', username, password)).to.throw(ValueError, 'surname is empty or blank')
            })

            it('should fail on blank surname', () => {
                expect(() => logic.register(name, '   \t\n', username, password)).to.throw(ValueError, 'surname is empty or blank')
            })

            it('should fail on undefined username', () => {
                expect(() => logic.register(name, surname, undefined, password)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty username', () => {
                expect(() => logic.register(name, surname, '', password)).to.throw(ValueError, 'username is empty or blank')
            })

            it('should fail on blank username', () => {
                expect(() => logic.register(name, surname, '   \t\n', password)).to.throw(ValueError, 'username is empty or blank')
            })

            it('should fail on undefined password', () => {
                expect(() => logic.register(name, surname, username, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty password', () => {
                expect(() => logic.register(name, surname, username, '')).to.throw(ValueError, 'password is empty or blank')
            })

            it('should fail on blank password', () => {
                expect(() => logic.register(name, surname, username, '   \t\n')).to.throw(ValueError, 'password is empty or blank')
            })

            describe('with already registered user', () => {
                beforeEach(async () => user = await new User({ name, surname, username, password }).save())

                it('should fail on repeted username', async () => {
                    try {
                        await logic.register(name, surname, username, password)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`username ${username} already registered`)
                    }
                })
            })
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
                await logic.login(username, password)

                const _user = await User.findOne({ username })

                expect(logic._token).to.be.a('string')
                expect(logic._userId).to.equal(_user.id)
            })

            it('should fail on incorrect password', async () => {
                try {
                    await logic.login(username, 'password')
                    expect(true).to.be.false
                } catch (err) {
                    expect(err).to.be.instanceof(Error)
                    expect(err.message).to.equal(`invalid username or password`)
                }
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


            it('should fail on undefined password', () => {
                expect(() => logic.login(username, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty password', () => {
                expect(() => logic.login(username, '')).to.throw(ValueError, 'password is empty or blank')
            })

            it('should fail on blank password', () => {
                expect(() => logic.login(username, '   \t\n')).to.throw(ValueError, 'password is empty or blank')
            })
        })

        describe('retrieve user', () => {
            let user

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()

                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {
                const _user = await logic.retrieveUser()

                const { name, surname, username, id } = _user

                expect(_user).not.to.be.instanceof(User)

                expect(user.id).to.equal(id)
                expect(user.name).to.equal(name)
                expect(user.surname).to.equal(surname)
                expect(user.username).to.equal(username)
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail on incorrect password', async () => {
                    try {
                        await logic.retrieveUser()
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })
        })


        describe('logout', () => {
            let user

            beforeEach(async () => {
                name = `n-${Math.random()}`
                surname = `s-${Math.random()}`
                username = `u-${Math.random()}`
                password = `p-${Math.random()}`

                user = await new User({ name, surname, username, password }).save()

                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {
                await logic.logout()

                expect(logic._userId).to.be.null
                expect(logic._token).to.be.null
                
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

                    await logic.login(username, password)
                })
    
                it('should succeed on correct data', async () => {
    
                    await logic.addStory(title, audioLanguage, textLanguage)
    
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
    
                describe('without existing user', () => {
                    beforeEach(async () => await User.deleteMany())
    
                    it('should fail unexisting user ', async () => {
                        try {
                            await logic.addStory(title, audioLanguage, textLanguage)
                            expect(true).to.be.false
                        } catch (err) {
                            expect(err).to.be.instanceof(Error)
                            expect(err.message).to.equal(`user with id ${user.id} not found`)
                        }
                    })
                })
    
                describe('with already created story with same title', () => {
                    beforeEach(async () => {
                        story = await new Story({ title, author: user.id, audioLanguage, textLanguage }).save()
                    })
    
                    it('should fail unexisting user ', async () => {
                        try {
                            await logic.addStory(title, audioLanguage, textLanguage)
                            expect(true).to.be.false
                        } catch (err) {
                            expect(err).to.be.instanceof(Error)
                            expect(err.message).to.equal(`story with title ${title} already created by user with id ${user.id}`)
                        }
                    })
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
    
                it('should fail on undefined audio language', () => {
                    expect(() => logic.addStory(title, undefined, textLanguage)).to.throw(TypeError, 'undefined is not a string')
                })
    
                it('should fail on empty audio language', () => {
                    expect(() => logic.addStory(title, '', textLanguage)).to.throw(ValueError, 'audioLanguage is empty or blank')
                })
    
                it('should fail on blank audio language', () => {
                    expect(() => logic.addStory(title, '   \t\n', textLanguage)).to.throw(ValueError, 'audioLanguage is empty or blank')
                })
    
                it('should fail on undefined text language', () => {
                    expect(() => logic.addStory(title, audioLanguage, undefined)).to.throw(TypeError, 'undefined is not a string')
                })
    
                it('should fail on empty text language', () => {
                    expect(() => logic.addStory(title, audioLanguage, '')).to.throw(ValueError, 'textLanguage is empty or blank')
                })
    
                it('should fail on blank text language', () => {
                    expect(() => logic.addStory(title, audioLanguage, '   \t\n')).to.throw(ValueError, 'textLanguage is empty or blank')
                })
            })
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

                await logic.login(username, password)
            })

            it('should succeed on correct author', async () => {

                const stories = await logic.listStories()

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

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail unexisting user ', async () => {
                    try {
                        await logic.listStories()
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })
        })

        describe('retrieve story', () => {
            let title, audioLanguage, textLanguage, user, story, page, text

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

                text = `text-${Math.random()}`

                page = new Page({ text })

                story = await new Story({ title, author: id, audioLanguage, textLanguage, pages: [page] }).save()

                await logic.login(username, password)
            })

            it('should succeed on correct author', async () => {

                const _story = await logic.retrieveStory(story.id.toString())


                expect(_story.id).to.be.a('string')
                expect(_story.author.toString()).to.equal(user.name)
                expect(_story.title).to.equal(title)
                expect(_story.audioLanguage).to.equal(audioLanguage)
                expect(_story.textLanguage).to.equal(textLanguage)
                expect(_story.cover).to.be.undefined
                expect(_story.hasCover).to.be.false
                expect(_story.pages.length).to.equal(1)
                expect(_story.pages[0].text).to.equal(text)
                expect(_story.pages[0].id).to.equal(page.id)
                expect(_story.pages[0].hasImage).to.be.false
                expect(_story.pages[0].hasAudio).to.be.false

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
                expect(_story.pages[0].text).to.equal(__story.pages[0].text)
                expect(_story.pages[0].id).to.equal(__story.pages[0].id)
                expect(__story.pages[0].hasImage).to.be.false
                expect(__story.pages[0].hasAudio).to.be.false
                expect(__story.pages[0].image).to.be.undefined
                expect(__story.pages[0].audio).to.be.undefined

            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail unexisting user ', async () => {
                    try {
                        await logic.retrieveStory(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

            describe('without existing user', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail unexisting user ', async () => {
                    try {
                        await logic.retrieveStory(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found in user with id ${user.id} stories`)
                    }
                })
            })

            it('should fail on undefined storyId', () => {
                expect(() => logic.retrieveStory(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.retrieveStory('')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.retrieveStory('   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
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

                await logic.login(username, password)
            })

            it('should succeed on new title', async () => {

                await logic.updateStory(story.id, newTitle, null, null)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(newTitle)
                expect(_story.audioLanguage).to.equal(audioLanguage)
                expect(_story.textLanguage).to.equal(textLanguage)
            })

            it('should succeed on new audio language', async () => {

                await logic.updateStory(story.id, null, newAudioLanguage, null)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(title)
                expect(_story.audioLanguage).to.equal(newAudioLanguage)
                expect(_story.textLanguage).to.equal(textLanguage)
            })

            it('should succeed on new text language', async () => {

                await logic.updateStory(story.id, null, null, newTextLanguage)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(title)
                expect(_story.audioLanguage).to.equal(audioLanguage)
                expect(_story.textLanguage).to.equal(newTextLanguage)
            })

            it('should succeed on new title, audio language and text language', async () => {

                await logic.updateStory(story.id, newTitle, newAudioLanguage, newTextLanguage)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(newTitle)
                expect(_story.audioLanguage).to.equal(newAudioLanguage)
                expect(_story.textLanguage).to.equal(newTextLanguage)
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail with unexisting user', async () => {
                    try {
                        await logic.updateStory(story.id, newTitle, newAudioLanguage, newTextLanguage)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail with unexisting story', async () => {
                    try {
                        await logic.updateStory(story.id, newTitle, newAudioLanguage, newTextLanguage)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found in user with id ${user.id} stories`)
                    }
                })
            })

            it('should fail on undefined storyId', () => {
                expect(() => logic.updateStory(undefined, title, null, null)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.updateStory('', title, null, null)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.updateStory('   \t\n', title, null, null)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should not fail on undefined title', async () => {
                try {
                    await logic.updateStory(story.id, undefined, null, null)
                } catch(err) {
                    throw err
                }
            })

            it('should fail on empty title', () => {
                expect(() => logic.updateStory(story.id, '', null, null)).to.throw(ValueError, 'title is empty or blank')
            })

            it('should fail on empty title', () => {
                expect(() => logic.updateStory(story.id, '   \t\n', null, null)).to.throw(ValueError, 'title is empty or blank')
            })

            it('should not fail on undefined audioLanguage', async() => {
                try {
                    await logic.updateStory(story.id, null, undefined, null)
                }catch(err) {
                    throw err
                }
            })

            it('should fail on empty audioLanguage', () => {
                expect(() => logic.updateStory(story.id, null, '', null)).to.throw(ValueError, 'audioLanguage is empty or blank')
            })

            it('should fail on empty audioLanguage', () => {
                expect(() => logic.updateStory(story.id, null, '   \t\n', null)).to.throw(ValueError, 'audioLanguage is empty or blank')
            })

            it('should not fail on undefined textLanguage', async () => {
                try {
                    await logic.updateStory(story.id, null, audioLanguage, undefined)
                }catch(err) {
                    throw err
                }
            })

            it('should fail on empty textLanguage', () => {
                expect(() => logic.updateStory(story.id, null, audioLanguage, '')).to.throw(ValueError, 'textLanguage is empty or blank')
            })

            it('should fail on empty textLanguage', () => {
                expect(() => logic.updateStory(story.id, null, audioLanguage, '   \t\n')).to.throw(ValueError, 'textLanguage is empty or blank')
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

                await logic.login(username, password)
            })

            it('should succeed on correct query', async () => {
                await logic.addFavourite(story.id)

                let __user = await User.findById(user.id)

                expect(__user.favourites.length).to.equal(1)

                const [storyFav] = __user.favourites

                expect(storyFav.toString()).to.equal(story.id.toString())

            })

            // describe('without true inProcess user', () => {
            //     beforeEach( async () => {
            //         story.inProcess = true
            //         await story.save()    
            //     })

            //     it('should fail on incorrect password', async () => {
            //         try {
            //             await logic.addFavourite(story.id)
            //             expect(true).to.be.false
            //         } catch (err) {
            //             expect(err).to.be.instanceof(Error)
            //             expect(err.message).to.equal(`story with id ${story.id} still in process`)
            //         }
            //     })
            // })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail unexisting user ', async () => {
                    try {
                        await logic.addFavourite(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail unexisting story ', async () => {
                    try {
                        await logic.addFavourite(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found`)
                    }
                })
            })

            describe('with already favourite story', () => {
                beforeEach(async () => {
                    user.favourites.push(story.id)
                    
                    await user.save()
                })

                it('should fail with already tagged as favourite story ', async () => {
                    try {
                        await logic.addFavourite(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} already marked as favourite`)
                    }
                })
            })

            it('should fail on undefined storyId', () => {
                expect(() => logic.addFavourite(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.addFavourite('')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.addFavourite('   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
            })

        })


        describe('remove story from favourites', () => {
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

                await logic.login(username, password)
            })

            it('should succeed on correct query', async () => {
                await logic.removeFavourite(story.id)

                const __user = await User.findById(user.id)

                expect(__user.favourites.length).to.equal(0)
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail unexisting user ', async () => {
                    try {
                        await logic.removeFavourite(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail unexisting story ', async () => {
                    try {
                        await logic.removeFavourite(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found`)
                    }
                })
            })

            describe('without already favourite story', () => {
                beforeEach(async () => {
                    user.favourites = []
                    await user.save()
                })

                it('should fail with already tagged as favourite story ', async () => {
                    try {
                        await logic.removeFavourite(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found as favourite`)
                    }
                })
            })

            it('should fail on undefined storyId', () => {
                expect(() => logic.removeFavourite(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.removeFavourite('')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.removeFavourite('   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
            })

        })

        describe('list favourite stories', () => {
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

                await logic.login(username, password)
            })

            it('should succeed on correct user id', async () => {
                const favourites = await logic.listFavourites()

                const _user = await User.findById(user.id)

                expect(_user.favourites.length).to.equal(favourites.length)

                const [favourite] = favourites

                const [_favourite] = _user.favourites

                expect(favourite.id).to.equal(_favourite.toString())
                expect(favourite.author).to.equal(user.id.toString())
                expect(favourite.hasCover).to.be.false
                expect(favourite.title).to.equal(title)
                expect(favourite.audioLanguage).to.equal(audioLanguage)
                expect(favourite.textLanguage).to.equal(textLanguage)
                expect(favourite.dataURL).to.be.undefined
                expect(favourite.pages.length).to.equal(0)
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail unexisting user ', async () => {
                    try {
                        await logic.listFavourites()
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })
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

                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {

                await logic.finishStory(story.id)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(title)
                expect(_story.audioLanguage).to.equal(audioLanguage)
                expect(_story.textLanguage).to.equal(textLanguage)
                expect(_story.inProcess).to.be.false
            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail with unexisting user', async () => {
                    try {
                        await logic.finishStory(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail with unexisting story', async () => {
                    try {
                        await logic.finishStory(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found in user with id ${user.id} stories`)
                    }
                })
            })

            it('should fail on undefined storyId', () => {
                expect(() => logic.finishStory(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.finishStory('')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.finishStory('   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
            })
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

                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {

                await logic.workInStory(story.id)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id).to.be.a('string')
                expect(_story.title).to.equal(title)
                expect(_story.audioLanguage).to.equal(audioLanguage)
                expect(_story.textLanguage).to.equal(textLanguage)
                expect(_story.inProcess).to.be.true
            })
            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail with unexisting user', async () => {
                    try {
                        await logic.workInStory(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail with unexisting story', async () => {
                    try {
                        await logic.workInStory(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found in user with id ${user.id} stories`)
                    }
                })
            })

            it('should fail on undefined storyId', () => {
                expect(() => logic.workInStory(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.workInStory('')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.workInStory('   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
            })
        })

        describe('save story cover', () => {
            let user, story, dataURL, vectors

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

                dataURL = 'dataURL....'
                vectors = [{
                    start: { offsetX: 10, offsetY: 10 },
                    stop: { offsetX: 20, offsetY: 15 },
                    strokeStyle: 'fff',
                    width: 4
                }]

                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {

                await logic.saveStoryCover(story.id, dataURL, vectors)

                let _story = await Story.findById(story.id)

                expect(_story.hasCover).to.be.true
                expect(_story.dataURL).to.equal(dataURL)
                expect(_story.vectors.length).to.equal(vectors.length)
                expect(_story.vectors[0].strokeStyle).to.equal(vectors[0].strokeStyle)
                expect(_story.vectors[0].width).to.equal(vectors[0].width)
                expect(_story.vectors[0].start.offsetX).to.equal(vectors[0].start.offsetX)
                expect(_story.vectors[0].start.offsetY).to.equal(vectors[0].start.offsetY)
                expect(_story.vectors[0].stop.offsetX).to.equal(vectors[0].stop.offsetX)
                expect(_story.vectors[0].stop.offsetY).to.equal(vectors[0].stop.offsetY)
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail with unexisting story', async () => {
                    try {
                        await logic.saveStoryCover(story.id, dataURL, vectors)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found`)
                    }
                })
            })

            it('should fail on undefined story id', () => {
                expect(() => logic.saveStoryCover(undefined, dataURL, vectors)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.saveStoryCover('', dataURL, vectors)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.saveStoryCover('   \t\n', dataURL, vectors)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on undefined dataURL', () => {
                expect(() => logic.saveStoryCover(story.id, undefined, vectors)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty dataURL', () => {
                expect(() => logic.saveStoryCover(story.id, '', vectors)).to.throw(ValueError, 'dataURL is empty or blank')
            })

            it('should fail on blank dataURL', () => {
                expect(() => logic.saveStoryCover(story.id, '   \t\n', vectors)).to.throw(ValueError, 'dataURL is empty or blank')
            })

            it('should fail on undefined vectors', () => {
                expect(() => logic.saveStoryCover(story.id, dataURL, undefined)).to.throw(TypeError, 'undefined is not an array')
            })

            // it('should fail on empty vectors', () => {
            //     expect(() => logic.saveStoryCover(story.id, dataURL, '')).to.throw(ValueError, 'vectors is empty or blank')
            // })

            // it('should fail on blank vectors', () => {
            //     expect(() => logic.saveStoryCover(story.id, dataURL, '   \t\n')).to.throw(ValueError, 'vectors is empty or blank')
            // })
        })


        describe('retrieve story cover', () => {
            let user, story, vectors, dataURL

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
                dataURL = 'dataURL....'
                vectors = [{
                    start: { offsetX: 10, offsetY: 10 },
                    stop: { offsetX: 20, offsetY: 15 },
                    strokeStyle: 'fff',
                    width: 4
                }]

                story = await new Story({ title, author: id, audioLanguage, textLanguage, hasCover: true, vectors, dataURL }).save()

                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {

                const cover = await logic.retrieveStoryCover(story.id)

                let _story = await Story.findById(story.id)

                expect(_story.hasCover).to.be.true
                expect(_story.hasCover).to.equal(cover.hasCover)
                expect(_story.dataURL).to.equal(cover.dataURL)
                expect(_story.vectors.length).to.equal(cover.vectors.length)
                expect(_story.vectors[0].strokeStyle).to.equal(cover.vectors[0].strokeStyle)
                expect(_story.vectors[0].width).to.equal(cover.vectors[0].width)
                expect(_story.vectors[0].start.offsetX).to.equal(cover.vectors[0].start.offsetX)
                expect(_story.vectors[0].start.offsetY).to.equal(cover.vectors[0].start.offsetY)
                expect(_story.vectors[0].stop.offsetX).to.equal(cover.vectors[0].stop.offsetX)
                expect(_story.vectors[0].stop.offsetY).to.equal(cover.vectors[0].stop.offsetY)
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail with unexisting story', async () => {
                    try {
                        await logic.retrieveStoryCover(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found`)
                    }
                })
            })

            it('should fail on undefined story id', () => {
                expect(() => logic.retrieveStoryCover(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.retrieveStoryCover('')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.retrieveStoryCover('   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
            })
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

                await logic.login(username, password)

            })

            it('should succeed on correct data', async () => {

                await logic.removeStory(story.id)

                const stories = await Story.find()

                expect(stories.length).to.equal(0)

            })

            describe('without existing user', () => {
                beforeEach(async () => await User.deleteMany())

                it('should fail with unexisting user', async () => {
                    try {
                        await logic.removeStory(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`user with id ${user.id} not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail with unexisting story', async () => {
                    try {
                        await logic.removeStory(story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found`)
                    }
                })
            })

            it('should fail on undefined storyId', () => {
                expect(() => logic.removeStory(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.removeStory('')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on empty storyId', () => {
                expect(() => logic.removeStory('   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
            })
        })


        describe('search stories by title', () => {
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

                await logic.login(username, password)

            })

            it('should succeed on correct query', async () => {

                const stories = await logic.searchStory(title)

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.id.toString()).to.equal(story.id.toString())
                expect(_story.title).to.equal(story.title)
                expect(_story.hasCover).to.equal(story.hasCover)
                expect(_story.author.toString()).to.equal(story.author.toString())
                expect(_story.audioLanguage).to.equal(story.audioLanguage)
                expect(_story.textLanguage).to.equal(story.textLanguage)

            })

            // describe('without true inProcess user', () => {
            //     beforeEach( async () => {
            //         story.inProcess = true
            //         await story.save()    
            //     })

            //     it('should fail on incorrect password', async () => {
            //         try {
            //             await logic.searchStory(story.title)
            //             expect(true).to.be.false
            //         } catch (err) {
            //             expect(err).to.be.instanceof(Error)
            //             expect(err.message).to.equal(`story with id ${story.id} still in process`)
            //         }
            //     })

            // })

            describe('without existing stories', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail with unexisting story', async () => {
                    try {
                        await logic.searchStory(title)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`stories with query ${title} not found`)
                    }
                })
            })

            it('should fail on undefined title', () => {
                expect(() => logic.searchStory(undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty title', () => {
                expect(() => logic.searchStory('')).to.throw(ValueError, 'query is empty or blank')
            })

            it('should fail on empty title', () => {
                expect(() => logic.searchStory('   \t\n')).to.throw(ValueError, 'query is empty or blank')
            })
        })


        describe('search random stories', () => {
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

                await logic.login(username, password)
            })

            it('should succeed', async () => {

                const stories = await logic.searchRandomStories()

                expect(stories.length).to.equal(2)

                const _story = stories[0]

                expect(_story.id).to.exist
                expect(_story.title).to.exist
                expect(_story.hasCover).to.exist
                expect(_story.author).to.exist
                expect(_story.audioLanguage).to.exist
                expect(_story.textLanguage).to.exist
            })

            describe('without existing stories', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail with unexisting story', async () => {
                    try {
                        await logic.searchRandomStories()
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`stories not found`)
                    }
                })
            })
        })
    })

    describe('page', () => {
        describe('add page', () => {
            let title, audioLanguage, textLanguage, user, story, text

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

                text = `text-${Math.random()}`

                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {

                await logic.addPage(story.id, text)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.pages.length).to.equal(1)

                const [page] = _story.pages

                expect(page.id).to.be.a('string')
                expect(page.text).to.equal(text)

                // const pages = await Page.find()

                // expect(pages.length).to.equal(1)

                // const [_page] = pages

                // expect(_page.id).to.equal(page.id)
                // expect(_page.text).to.equal(text)
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail with unexisting user ', async () => {
                    try {
                        await logic.addPage(story.id, text)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found`)
                    }
                })
            })

            it('should fail on undefined story id', () => {
                expect(() => logic.addPage(undefined, text)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.addPage('', text)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.addPage('   \t\n', text)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should not fail on undefined text', async () => {
                try {
                    await logic.addPage(story.id, undefined, text)
                }catch(err){
                    throw err
                }
            })

            it('should fail on empty text', () => {
                expect(() => logic.addPage(story.id, '')).to.throw(ValueError, 'text is empty or blank')
            })

            it('should fail on blank text', () => {
                expect(() => logic.addPage(story.id, '   \t\n')).to.throw(ValueError, 'text is empty or blank')
            })
        })

        describe('save page picture', () => {
            let user, story, page, dataURL, vectors

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

                text = `text-${Math.random()}`
                dataURL = 'dataURL....'
                vectors = [{
                    start: { offsetX: 10, offsetY: 10 },
                    stop: { offsetX: 20, offsetY: 15 },
                    strokeStyle: 'fff',
                    width: 4
                }]

                page = new Page({ text })
                story = await new Story({ title, author: id, audioLanguage, textLanguage, pages: [page] }).save()

                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {

                await logic.savePagePicture(page.id, story.id, dataURL, vectors)
                const stories = await Story.find()
                
                const [_story] = stories
            
                let _page =_story.pages.id(page.id)

                expect(_page.hasImage).to.be.true
                expect(_page.dataURL).to.equal(dataURL)
                expect(_page.vectors.length).to.equal(vectors.length)
                expect(_page.vectors[0].strokeStyle).to.equal(vectors[0].strokeStyle)
                expect(_page.vectors[0].width).to.equal(vectors[0].width)
                expect(_page.vectors[0].start.offsetX).to.equal(vectors[0].start.offsetX)
                expect(_page.vectors[0].start.offsetY).to.equal(vectors[0].start.offsetY)
                expect(_page.vectors[0].stop.offsetX).to.equal(vectors[0].stop.offsetX)
                expect(_page.vectors[0].stop.offsetY).to.equal(vectors[0].stop.offsetY)
            })

            describe('without existing page', () => {
                it('should fail unexisting story ', async () => {
                    try {
                        await logic.savePagePicture('page.id', story.id, dataURL, vectors)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`page with id page.id not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail unexisting story ', async () => {
                    try {
                        await logic.savePagePicture(page.id, story.id, dataURL, vectors)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found`)
                    }
                })
            })

            it('should fail on undefined page id', () => {
                expect(() => logic.savePagePicture(undefined, story.id, dataURL, vectors)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty page id', () => {
                expect(() => logic.savePagePicture('', story.id, dataURL, vectors)).to.throw(ValueError, 'pageId is empty or blank')
            })

            it('should fail on blank page id', () => {
                expect(() => logic.savePagePicture('   \t\n', story.id, dataURL, vectors)).to.throw(ValueError, 'pageId is empty or blank')
            })

            it('should fail on undefined story id', () => {
                expect(() => logic.savePagePicture(page.id, undefined, dataURL, vectors)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.savePagePicture(page.id, '', dataURL, vectors)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.savePagePicture(page.id, '   \t\n', dataURL, vectors)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on undefined dataURL', () => {
                expect(() => logic.savePagePicture(page.id, story.id, undefined, vectors)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty dataURL', () => {
                expect(() => logic.savePagePicture(page.id, story.id, '', vectors)).to.throw(ValueError, 'dataURL is empty or blank')
            })

            it('should fail on blank dataURL', () => {
                expect(() => logic.savePagePicture(page.id, story.id, '   \t\n', vectors)).to.throw(ValueError, 'dataURL is empty or blank')
            })

            it('should fail on undefined vectors', () => {
                expect(() => logic.savePagePicture(page.id, story.id, dataURL, undefined)).to.throw(TypeError, 'undefined is not an array')
            })

            // it('should fail on empty vectors', () => {
            //     expect(() => logic.savePagePicture(page.id, story.id, dataURL, '')).to.throw(ValueError, 'vectors is empty or blank')
            // })

            // it('should fail on blank vectors', () => {
            //     expect(() => logic.savePagePicture(page.id, story.id, dataURL, '   \t\n')).to.throw(ValueError, 'vectors is empty or blank')
            // })
        })

        describe('retrieve picture', () => {
            let user, story, page, dataURL, vectors

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
                text = `text-${Math.random()}`
                dataURL = 'dataURL....'
                vectors = [{
                    start: { offsetX: 10, offsetY: 10 },
                    stop: { offsetX: 20, offsetY: 15 },
                    strokeStyle: 'fff',
                    width: 4
                }]

                page = new Page({ text, hasImage: true, dataURL, vectors })
                story = await new Story({ title, author: id, audioLanguage, textLanguage, pages: [page] }).save()

                await logic.login(username, password)
            })
            it('should succeed on correct data', async () => {

                const image = await logic.retrievePagePicture(page.id, story.id)

                const stories = await Story.find()
                
                const [_story] = stories
            
                let _page =_story.pages.id(page.id)

                expect(_page.hasImage).to.be.true
                expect(_page.hasImage).to.equal(image.hasImage)
                expect(_page.dataURL).to.equal(image.dataURL)
                expect(_page.vectors.length).to.equal(image.vectors.length)
                expect(_page.vectors[0].strokeStyle).to.equal(image.vectors[0].strokeStyle)
                expect(_page.vectors[0].width).to.equal(image.vectors[0].width)
                expect(_page.vectors[0].start.offsetX).to.equal(image.vectors[0].start.offsetX)
                expect(_page.vectors[0].start.offsetY).to.equal(image.vectors[0].start.offsetY)
                expect(_page.vectors[0].stop.offsetX).to.equal(image.vectors[0].stop.offsetX)
                expect(_page.vectors[0].stop.offsetY).to.equal(image.vectors[0].stop.offsetY)
            })
            describe('without existing page', () => {
                it('should fail unexisting story ', async () => {
                    try {
                        await logic.retrievePagePicture('page.id', story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`page with id page.id not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail unexisting story ', async () => {
                    try {
                        await logic.retrievePagePicture(page.id, story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found`)
                    }
                })
            })

            it('should fail on undefined page id', () => {
                expect(() => logic.retrievePagePicture(undefined, story.id)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty page id', () => {
                expect(() => logic.retrievePagePicture('', story.id)).to.throw(ValueError, 'pageId is empty or blank')
            })

            it('should fail on blank page id', () => {
                expect(() => logic.retrievePagePicture('   \t\n', story.id)).to.throw(ValueError, 'pageId is empty or blank')
            })

            it('should fail on undefined story id', () => {
                expect(() => logic.retrievePagePicture(page.id, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.retrievePagePicture(page.id, '')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.retrievePagePicture(page.id, '   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
            })
        })

        describe('save page audio', () => {
            
            
            // !!!!!!!!


        })

        describe('update page', () => {
            let title, audioLanguage, textLanguage, user, story, text, newText, page

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


                text = `text-${Math.random()}`
                newText = `text-${Math.random()}`

                page = new Page({ text })

                story = new Story({ title, author: id, audioLanguage, textLanguage, pages: [page] })
                await story.save()

                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {

                await logic.updatePage(page.id, story.id, newText)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.pages.length).to.equal(1)

                const [__page] = _story.pages

                expect(__page.id).to.be.a('string')
                expect(__page.text).to.equal(newText)

                // const pages = await Page.find()

                // expect(pages.length).to.equal(1)

                // const [_page] = pages

                // expect(_page.id).to.equal(page.id)
                // expect(_page.text).to.equal(newText)
            })

            describe('without existing page', () => {
                it('should fail unexisting story ', async () => {
                    try {
                        await logic.updatePage('page.id', story.id, text)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`page with id page.id not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail unexisting story ', async () => {
                    try {
                        await logic.updatePage(page.id, story.id, text)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found`)
                    }
                })
            })

            it('should fail on undefined page id', () => {
                expect(() => logic.updatePage(undefined, story.id, text)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty page id', () => {
                expect(() => logic.updatePage('', story.id, text)).to.throw(ValueError, 'pageId is empty or blank')
            })

            it('should fail on blank page id', () => {
                expect(() => logic.updatePage('   \t\n', story.id, text)).to.throw(ValueError, 'pageId is empty or blank')
            })

            it('should fail on undefined story id', () => {
                expect(() => logic.updatePage(page.id, undefined, text)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.updatePage(page.id, '', text)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.updatePage(page.id, '   \t\n', text)).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on undefined story id', () => {
                expect(() => logic.updatePage(page.id, story.id, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.updatePage(page.id, story.id, '')).to.throw(ValueError, 'text is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.updatePage(page.id, story.id, '   \t\n')).to.throw(ValueError, 'text is empty or blank')
            })
        })


        describe('retrieve page', () => {
            let title, audioLanguage, textLanguage, user, story, text, page

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

                text = `text-${Math.random()}`

                page = new Page({ text })

                story = new Story({ title, author: id, audioLanguage, textLanguage, pages: [page] })
                await story.save()

                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {

                const _page = await logic.retrievePage(page.id, story.id)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.pages.length).to.equal(1)

                const [__page] = _story.pages

                expect(__page.id).to.equal(_page.id)
                expect(__page.text).to.equal(_page.text)

                // const pages = await Page.find()

                // expect(pages.length).to.equal(1)

                // const [___page] = pages

                // expect(___page.id).to.equal(_page.id)
                // expect(___page.text).to.equal(_page.text)
            })

            describe('without existing page', () => {
                it('should fail unexisting page ', async () => {
                    try {
                        await logic.retrievePage('page.id', story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`page with id page.id not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail unexisting story ', async () => {
                    try {
                        await logic.retrievePage(page.id, story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found`)
                    }
                })
            })

            it('should fail on undefined page id', () => {
                expect(() => logic.retrievePage(undefined, story.id)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty page id', () => {
                expect(() => logic.retrievePage('', story.id)).to.throw(ValueError, 'pageId is empty or blank')
            })

            it('should fail on blank page id', () => {
                expect(() => logic.retrievePage('   \t\n', story.id)).to.throw(ValueError, 'pageId is empty or blank')
            })

            it('should fail on undefined story id', () => {
                expect(() => logic.retrievePage(page.id, undefined)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty story id', () => {
                expect(() => logic.retrievePage(page.id, '')).to.throw(ValueError, 'storyId is empty or blank')
            })

            it('should fail on blank story id', () => {
                expect(() => logic.retrievePage(page.id, '   \t\n')).to.throw(ValueError, 'storyId is empty or blank')
            })
        })

        describe('remove page', () => {
            let title, audioLanguage, textLanguage, user, story, text, page

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

                text = `text-${Math.random()}`

                page = new Page({ text })

                story = new Story({ title, author: id, audioLanguage, textLanguage, pages: [page] })
                await story.save()

                await logic.login(username, password)
            })

            it('should succeed on correct data', async () => {

                await logic.removePage(page.id, story.id)

                const stories = await Story.find()

                expect(stories.length).to.equal(1)

                const [_story] = stories

                expect(_story.pages.length).to.equal(0)

                // const pages = await Page.find()

                // expect(pages.length).to.equal(0)

            })

            describe('without existing page', () => {
                it('should fail unexisting page ', async () => {
                    try {
                        await logic.removePage('page.id', story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`page with id page.id not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => await Story.deleteMany())

                it('should fail unexisting story ', async () => {
                    try {
                        await logic.removePage(page.id, story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`story with id ${story.id} not found`)
                    }
                })
            })

            describe('without existing story', () => {
                beforeEach(async () => {
                    story.pages = []
                    await story.save()
                })

                it('should fail unexisting story ', async () => {
                    try {
                        await logic.removePage(page.id, story.id)
                        expect(true).to.be.false
                    } catch (err) {
                        expect(err).to.be.instanceof(Error)
                        expect(err.message).to.equal(`page with id ${page.id} not found`)
                    }
                })
            })

            it('should fail on undefined page id', () => {
                expect(() => logic.removePage(undefined, story.id)).to.throw(TypeError, 'undefined is not a string')
            })

            it('should fail on empty page id', () => {
                expect(() => logic.removePage('', story.id)).to.throw(ValueError, 'pageId is empty or blank')
            })

            it('should fail on blank page id', () => {
                expect(() => logic.removePage('   \t\n', story.id)).to.throw(ValueError, 'pageId is empty or blank')
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
        })
    })

    afterEach(() => Promise.all([User.deleteMany(), Story.deleteMany()]))

    after(() => mongoose.disconnect())
})