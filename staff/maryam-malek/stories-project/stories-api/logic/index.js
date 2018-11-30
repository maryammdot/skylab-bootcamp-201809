const { models: { User, Story, Page } } = require('stories-data')
const validate = require('../utils/validate')
const { AlreadyExistsError, AuthError, NotFoundError } = require('../errors')
const fs = require('fs')
const path = require('path')
const { env: { PORT } } = process

const logic = {
    register(name, surname, username, password) {
        validate([
            { key: 'name', value: name, type: String },
            { key: 'surname', value: surname, type: String },
            { key: 'username', value: username, type: String },
            { key: 'password', value: password, type: String }]
        )

        return (async () => {
            let user = await User.findOne({ username })

            if (user) throw new AlreadyExistsError(`username ${username} already registered`)

            // user = new User({ name: name.toUpperCase(), surname: surname.toUpperCase(), username: username.toUpperCase(), password: password.toUpperCase() })

            user = new User({ name, surname, username, password })

            await user.save()
        })()
    },

    authenticate(username, password) {
        validate([
            { key: 'username', value: username, type: String },
            { key: 'password', value: password, type: String }]
        )

        return (async () => {
            let user = await User.findOne({ username })

            if (!user || password !== user.password) throw new AuthError('invalid username or password')

            return user.id
        })()
    },

    retrieveUser(id) {
        validate(
            [{ key: 'id', value: id, type: String }]
        )

        return (async () => {
            const user = await User.findById(id, { '_id': 0, password: 0, __v: 0 }).lean()

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            user.id = id

            return user
        })()
    },

    updateUser(id, name, surname, username, newPassword, password) {
        validate([
            { key: 'name', value: name, type: String, optional: true },
            { key: 'surname', value: surname, type: String, optional: true },
            { key: 'username', value: username, type: String, optional: true },
            { key: 'password', value: password, type: String },
            { key: 'newPassword', value: newPassword, type: String, optional: true }
        ])

        return (async () => {
            const user = await User.findById(id)

            if (!user) throw new NotFoundError(`user with id ${id} not found`)

            if (user.password !== password) throw new AuthError('wrong password')

            name != null && (user.name = name)
            surname != null && (user.surname = surname)
            username != null && (user.username = username)
            newPassword != null && (user.password = newPassword)

            await user.save()
        })()
    },

    addFavourites(userId, storyId) {
        validate([
            { key: 'userId', value: userId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let user = await User.findById(userId)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            // Si és un conte del mateix usuari, si que l'ha de poder posar com a preferit, encara que no estigui acabat, no?

            // if(story.inProcess === true) throw Error(`story with id ${storyId} still in process`)

            const index = user.favourites.findIndex(__story => __story.toString() === story.id.toString())

            if (index >= 0) throw new AlreadyExistsError(`story with id ${storyId} already marked as favourite`)

            user.favourites.push(story.id)

            await user.save()
        })()
    },

    removeFavourites(userId, storyId) {
        validate([
            { key: 'userId', value: userId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let user = await User.findById(userId)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            const index = user.favourites.findIndex(__story => __story.toString() === story.id.toString())

            if (index < 0) throw new NotFoundError(`story with id ${storyId} not found as favourite`)

            story.pages.splice(index, 1)

            user.favourites.splice(index, 1)

            await user.save()
        })()
    },

    listFavourites(userId) {
        validate([
            { key: 'userId', value: userId, type: String }
        ])

        return (async () => {

            let user = await User.findById(userId).populate('favourites').lean().exec()

            if (!user) throw new NotFoundError(`user with id ${userId} not found`)

            let favourites = []

            user.favourites.forEach(async story => {

                story.id = story._id.toString()
                delete story._id
                delete story.__v
                // delete story.pages
                delete story.vectors
                delete story.cover
                delete story.inProcess
                story.author = story.author.toString()

                return favourites.push(story)
            })
            return favourites
        })()

    },


    addStory(title, author, audioLanguage, textLanguage) {
        validate([
            { key: 'title', value: title, type: String },
            { key: 'authorId', value: author, type: String },
            { key: 'audioLanguage', value: audioLanguage, type: String, optional: true },
            { key: 'textLanguage', value: textLanguage, type: String, optional: true }
        ])

        return (async () => {

            let user = await User.findById(author)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let story = await Story.findOne({ $and: [{ author }, { title }] })

            if (story) throw new AlreadyExistsError(`story with title ${title} already created by user with id ${author}`)

            story = new Story({ title, author })

            audioLanguage != null && (story.audioLanguage = audioLanguage)
            textLanguage != null && (story.textLanguage = textLanguage)

            story.cover = `http://localhost:${PORT}/api/users/${author}/stories/${story.id}/cover`

            await story.save()

            return story.id
        })()
    },

    listStories(author) {
        validate([
            { key: 'authorId', value: author, type: String }
        ])

        return (async () => {

            let user = await User.findById(author)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let stories = await Story.find({ author }).lean()

            stories.forEach(story => {
                story.id = story._id.toString()
                delete story._id
                delete story.__v
                delete story.pages
                // delete story.hasCover

                story.author = story.author.toString()

                return story
            })
            return stories
        })()

    },

    retrieveStory(author, storyId) {
        validate([
            { key: 'authorId', value: author, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let user = await User.findById(author)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let story = await Story.findById(storyId).populate('author').lean().exec()

            if (!story) throw new NotFoundError(`story with id ${storyId} not found in user with id ${author} stories`)

            story.id = story._id.toString()
            delete story._id
            delete story.__v
            // delete story.hasCover

            story.author = story.author.name

            if (story.pages) {
                story.pages.forEach(page => {
                    page.id = page._id.toString()
                    delete page._id
                    delete page.__v
                    // delete page.hasImage
                    // delete page.hasAudio
                    return page
                })
            }

            return story
        })()
    },

    saveStoryCover(storyId, dataURL, vectors) {
        validate([
            { key: 'storyId', value: storyId, type: String },
            { key: 'dataURL', value: dataURL, type: String },
            // { key: 'vectors', value: vectors, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            story.dataURL = dataURL

            story.vectors = vectors

            story.hasCover = true

            await story.save()

        })()
    },

    retrieveStoryCover(storyId) {
        validate([
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId).lean()

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            delete story._id
            delete story.__v
            delete story.title
            delete story.author
            delete story.audioLanguage
            delete story.textLanguage
            delete story.cover
            delete story.inProcess
            delete story.pages

            return story
        })()
    },

    // saveStoryCover(author, storyId, cover) {
    //     validate([
    //         { key: 'authorId', value: author, type: String },
    //         { key: 'storyId', value: storyId, type: String }
    //         // { key: 'coverUrl', value: cover, type: String }
    //     ])

    //     const folder = `data/stories/${storyId}`

    //     return new Promise((resolve, reject) => {
    //         try {
    //             User.findById(author)
    //                 .then(user => {
    //                     if (!user) throw new NotFoundError(`user with id ${author} not found`)

    //                     return Story.findById(storyId)
    //                 })
    //                 .then(story => {
    //                     if (!story) throw new NotFoundError(`story with id ${storyId} not found in user with id ${author} stories`)

    //                     if (!fs.existsSync(folder)) {
    //                         fs.mkdirSync(folder)
    //                         fs.mkdirSync(`${folder}/cover`)


    //                     } else {
    //                         // const files = fs.readdirSync(`${folder}/cover`)

    //                         // files.forEach(file => fs.unlinkSync(path.join(`${folder}/cover`, file)))

    //                         fs.unlinkSync(path.join(`${folder}/cover`, 'cover.png'))
    //                     }

    //                     const pathToFile = path.join(`${folder}/cover`, 'cover.png')

    //                     const ws = fs.createWriteStream(pathToFile)

    //                     cover.pipe(ws)

    //                     story.hasCover = true

    //                     return story.save()
    //                 })
    //                 .then(() => {

    //                     resolve()
    //                 })

    //         } catch (err) {

    //             reject(err)
    //         }
    //     })
    // },

    // retrieveStoryCover(author, storyId) {
    //     validate([
    //         { key: 'authorId', value: author, type: String },
    //         { key: 'storyId', value: storyId, type: String }
    //     ])

    //     return new Promise((resolve, reject) => {
    //         try {
    //             User.findById(author)
    //                 .then(user => {
    //                     if (!user) throw new NotFoundError(`user with id ${author} not found`)
    //                     return Story.findById(storyId)
    //                 })
    //                 .then(story => {
    //                     if (!story) throw new NotFoundError(`story with id ${storyId} not found in user with id ${author} stories`)

    //                     if (story.hasCover) {

    //                         file = `data/stories/${story.id}/cover/cover.png`

    //                     } else {
    //                         file = `data/stories/default/cover.png`
    //                     }

    //                     const rs = fs.createReadStream(file)

    //                     resolve(rs)
    //                 })
    //         } catch (err) {
    //             reject(err)
    //         }
    //     })
    // },

    updateStory(id, title, author, audioLanguage, textLanguage) {
        validate([
            { key: 'id', value: id, type: String },
            { key: 'title', value: title, type: String, optional: true },
            { key: 'authorId', value: author, type: String },
            { key: 'audioLanguage', value: audioLanguage, type: String, optional: true },
            { key: 'textLanguage', value: textLanguage, type: String, optional: true }
        ])

        return (async () => {

            let user = await User.findById(author)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let story = await Story.findById(id)

            if (!story) throw new NotFoundError(`story with title ${title} not found in user with id ${author} stories`)

            title != null && (story.title = title)
            audioLanguage != null && (story.audioLanguage = audioLanguage)
            textLanguage != null && (story.textLanguage = textLanguage)

            await story.save()
        })()
    },

    finishStory(id, author) {
        validate([
            { key: 'id', value: id, type: String },
            { key: 'authorId', value: author, type: String }
        ])

        return (async () => {

            let user = await User.findById(author)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let story = await Story.findById(id)

            if (!story) throw new NotFoundError(`story with id ${id} not found in user with id ${author} stories`)

            story.inProcess = false

            await story.save()
        })()
    },

    workInStory(id, author) {
        validate([
            { key: 'id', value: id, type: String },
            { key: 'authorId', value: author, type: String }
        ])

        return (async () => {

            let user = await User.findById(author)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let story = await Story.findById(id)

            if (!story) throw new NotFoundError(`story with id ${id} not found in user with id ${author} stories`)

            story.inProcess = true

            await story.save()
        })()
    },

    removeStory(author, storyId) {
        validate([
            { key: 'authorId', value: author, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let user = await User.findById(author)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            await story.remove()

        })()
    },

    searchStoriesByTitle(query) {
        validate([
            { key: 'query', value: query, type: String }
        ])
        return (async () => {

            // let newQuery = query.toUpperCase()
            // let newQuery = query.replace(/[-[\]{}()*+?.,\\^$|#]/g, "")
            let test = new RegExp(query, 'i')
            const regQuery = {
                title: { $regex: test },
                inProcess: false
            }

            let stories = await Story.find(regQuery).lean()

            if (!stories.length) throw new NotFoundError(`stories with query ${query} not found`)

            stories.forEach(story => {
                story.id = story._id.toString()
                delete story._id
                delete story.__v
                delete story.pages
                story.author = story.author.toString()

                return story
            })

            return stories

        })()
    },

    searchRandomStories() {

        return (async () => {

            let stories = await Story.find({ inProcess: false }).lean()

            let randomStories = []

            if (stories.length > 6) {
                for (i = 0; i < 6; i++) {
                    const randomNum = Math.floor(Math.random() * (stories.length))
                    
                    randomStories.push(stories[randomNum])
                    
                    stories.splice(randomNum, 1)
                }
            } else {
                randomStories = stories
            }

            randomStories.forEach(story => {
                story.id = story._id.toString()
                delete story._id
                delete story.__v
                delete story.pages
                story.author = story.author.toString()
                
                return story
            })

            return randomStories

        })()
    },

    addPage(storyId, text) {
        validate([
            { key: 'storyId', value: storyId, type: String },
            { key: 'text', value: text, type: String, optional: true }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            page = new Page({ text })

            page.image = `http://localhost:${PORT}/api/users/${story.author.toString()}/stories/${storyId}/pages/${page.id.toString()}/picture`

            page.audioURL = `http://localhost:${PORT}/api/users/${story.author.toString()}/stories/${storyId}/pages/${page.id.toString()}/audio`

            await page.save()

            story.pages.push(page)

            await story.save()

            return page.id
        })()
    },

    updatePage(pageId, storyId, text) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String },
            { key: 'text', value: text, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = await Page.findById(pageId)

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            //THINK ABOUT KIND OF ERROR I WANT TO THROW!!

            page.text = text

            await page.save()

            const _page = story.pages.find(page => page.id === pageId)

            _page.text = text

            await story.save()
        })()
    },

    retrievePage(pageId, storyId) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = await Page.findById(pageId).lean()

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            page.id = page._id.toString()
            delete page._id
            delete page.__v
            // delete page.hasImage
            // delete page.hasAudio

            return page
        })()
    },

    savePagePicture(pageId, storyId, dataURL, vectors) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String },
            { key: 'dataURL', value: dataURL, type: String },
            // { key: 'vectors', value: vectors, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = await Page.findById(pageId)

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            page.dataURL = dataURL

            page.vectors = vectors

            page.hasImage = true

            await page.save()

            const _page = story.pages.find(page => page.id === pageId)

            _page.dataURL = dataURL

            _page.vectors = vectors

            _page.hasImage = true

            await story.save()
        })()
    },

    retrievePagePicture(pageId, storyId) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = await Page.findById(pageId).lean()

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            delete page._id
            delete page.__v
            delete page.hasAudio
            delete page.audio
            delete page.image
            delete page.text

            return page
        })()
    },

    // savePicPage(pageId, storyId, picture) {
    //     validate([
    //         { key: 'pageId', value: pageId, type: String },
    //         { key: 'storyId', value: storyId, type: String }
    //         // { key: 'picture', value: picture, type: String }
    //     ])

    //     const folder = `data/stories/${storyId}`

    //     return new Promise((resolve, reject) => {
    //         try {
    //             Story.findById(storyId)
    //                 .then(story => {
    //                     if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

    //                     return Page.findById(pageId)
    //                 })
    //                 .then(page => {
    //                     if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

    //                     if (!fs.existsSync(`${folder}/pages/${pageId}`)) {
    //                         if (!fs.existsSync(`${folder}`)) {

    //                             fs.mkdirSync(folder)
    //                         }
    //                         if (!fs.existsSync(`${folder}pages`)) {

    //                             fs.mkdirSync(`${folder}/pages`)
    //                         }
    //                         fs.mkdirSync(`${folder}/pages/${pageId}`)

    //                     } else {
    //                         // const files = fs.readdirSync(`${folder}/pages/${pageId}`)

    //                         // files.forEach(file => fs.unlinkSync(path.join(`${folder}/pages/${pageId}`, file)))
    //                         fs.unlinkSync(path.join(`${folder}/pages/${pageId}`, 'picture.png'))
    //                     }

    //                     const pathToFile = path.join(`${folder}/pages/${pageId}`, 'picture.png')

    //                     const ws = fs.createWriteStream(pathToFile)

    //                     picture.pipe(ws)

    //                     page.hasImage = true

    //                     return page.save()
    //                 })
    //                 .then(() => {
    //                     resolve()
    //                 })

    //         } catch (err) {
    //             reject(err)
    //         }
    //     })
    // },

    // retrievePagePic(pageId, storyId) {
    //     validate([
    //         { key: 'pageId', value: pageId, type: String },
    //         { key: 'storyId', value: storyId, type: String }
    //     ])

    //     return new Promise((resolve, reject) => {
    //         try {
    //             Story.findById(storyId)
    //                 .then(story => {
    //                     if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

    //                     return Page.findById(pageId)
    //                 })
    //                 .then(page => {
    //                     if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

    //                     if (page.hasImage) {

    //                         file = `data/stories/${storyId}/pages/${pageId}/picture.png`

    //                     } else {
    //                         file = `data/stories/default/picture.png`
    //                     }

    //                     const rs = fs.createReadStream(file)

    //                     resolve(rs)
    //                 })
    //         } catch (err) {
    //             reject(err)
    //         }
    //     })
    // },

    removePage(pageId, storyId) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = await Page.findById(pageId)

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            await page.remove()

            const index = story.pages.findIndex(page => page.id === pageId)

            if (index < 0) throw new NotFoundError(`page with id ${pageId} not found in story with id ${storyId}`)

            story.pages.splice(index, 1)

            await story.save()
        })()
    },

    //MAYBE I WILL NEED RETRIEVE PAGE, INSTEAD OF LIST BOOKS, OR RETRIEVE BOOK ALSO!!!!

    //     addPageAudio(storyId, pageId, audioUrl, audioBlob) {
    //         validate([
    //             { key: 'pageId', value: pageId, type: String },
    //             { key: 'storyId', value: storyId, type: String },
    //             { key: 'audioUrl', value: audioUrl, type: String },
    //             // { key: 'audioBlob', value: audioBlob, type: String }
    //         ])

    //         return (async () => {

    //             let story = await Story.findById(storyId)

    //             if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

    //             let page = await Page.findById(pageId)

    //             if (!page) throw new NotFoundError(`page with id ${pageId} not found`)
    // debugger
    //             page.audioURL = audioUrl

    //             page.audioBlob = audioBlob

    //             page.hasAudio = true

    //             await page.save()

    //             const _page = story.pages.find(page => page.id === pageId)

    //             _page.audioURL = audioURL

    //             _page.audioBlob = audioBlob

    //             _page.hasAudio = true

    //             await story.save()
    //         })()
    //     },

    //     retrievePageAudio(pageId, storyId) {
    //         validate([
    //             { key: 'pageId', value: pageId, type: String },
    //             { key: 'storyId', value: storyId, type: String }
    //         ])

    //         return (async () => {

    //             let story = await Story.findById(storyId)

    //             if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

    //             let page = await Page.findById(pageId).lean()

    //             if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

    //             page.id = page._id.toString()
    //             delete page._id
    //             delete page.__v
    //             delete page.hasImage
    //             delete page.dataURL
    //             delete page.vectors
    //             delete page.image
    //             delete page.text
    // debugger
    //             return page
    //         })()
    //     }

    savePageAudio(userId, pageId, storyId, audioFile) {

        validate([
            { key: 'userId', value: userId, type: String },
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
            // { key: 'audioFile', value: audioFile, type: String }
        ])

        const folder = `data/stories/${storyId}`

        const pathToFile = path.join(`${folder}/pages/${pageId}`, 'audio.ogg')

        return new Promise((resolve, reject) => {
            try {
                Story.findById(storyId)
                    .then(story => {
                        if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

                        return Page.findById(pageId)
                    })
                    .then(page => {
                        if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

                        if (!fs.existsSync(`${folder}/pages/${pageId}`)) {
                            if (!fs.existsSync(`${folder}`)) {

                                fs.mkdirSync(folder)
                            }
                            if (!fs.existsSync(`${folder}/pages`)) {

                                fs.mkdirSync(`${folder}/pages`)
                            }
                            fs.mkdirSync(`${folder}/pages/${pageId}`)

                        } else {
                            // const files = fs.readdirSync(`${folder}/pages/${pageId}`)

                            // files.forEach(file => fs.unlinkSync(path.join(`${folder}/pages/${pageId}`, file)))
                            fs.unlinkSync(pathToFile)
                        }

                        const ws = fs.createWriteStream(pathToFile)

                        audioFile.pipe(ws)

                        page.hasAudio = true

                        return page.save()
                    })
                    .then(() => {
                        resolve()
                    })

            } catch (err) {
                reject(err)
            }
        })
    },

    retrievePageAudio(pageId, storyId) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return new Promise((resolve, reject) => {
            try {
                Story.findById(storyId)
                    .then(story => {
                        if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

                        return Page.findById(pageId)
                    })
                    .then(page => {
                        if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

                        let file

                        if (page.hasAudio) {

                            file = `data/stories/${storyId}/pages/${pageId}/audio.ogg`
                        } else {
                            file = null
                        }

                        const rs = fs.createReadStream(file)

                        resolve(rs)
                    })
            } catch (err) {
                reject(err)
            }
        })
    },

}

module.exports = logic



