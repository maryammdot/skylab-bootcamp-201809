'use strict'
const { models: { User, Story, Page } } = require('stories-data')
const validate = require('../utils/validate')
const { AlreadyExistsError, AuthError, NotFoundError } = require('../errors')
const fs = require('fs')
const path = require('path')
const { env: { PORT, HOST } } = process

const logic = {
    /**
     * 
     * @param {String} name 
     * @param {String} surname 
     * @param {String} username 
     * @param {String} password 
     * 
     * @throws {TypeError} on non-string name, surname, username or password
     * @throws {ValueError} on empty or blank name, surname, username or password
     * @throws {AlreadyExistsError} on already registered username
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

            user = new User({ name, surname, username, password })

            await user.save()
        })()
    },

    /**
     * 
     * @param {String} username 
     * @param {String} password 
     * 
     * @throws {TypeError} on non-string username or password
     * @throws {ValueError} on empty or blank username or password
     * @throws {AuthError} on invalid username or password
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} id 
     * 
     * @throws {TypeError} on non-string id
     * @throws {ValueError} on empty or blank id
     * @throws {NotFoundError} on non existing user with that id
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

    /**
     * 
     * @param {String} userId 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string userId, storyId
     * @throws {ValueError} on empty or blank userId, storyId
     * @throws {NotFoundError} on unexisting user with id userId
     * @throws {NotFoundError} on unexisting story with id storyId
     * @throws {AlreadyExistsError} on story with id storyId already tagged as favourite
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */

    addFavourites(userId, storyId) {
        validate([
            { key: 'userId', value: userId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let user = await User.findById(userId)

            if (!user) throw new NotFoundError(`user with id ${userId} not found`)

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            const index = user.favourites.findIndex(__story => __story.toString() === story.id.toString())

            if (index >= 0) throw new AlreadyExistsError(`story with id ${storyId} already marked as favourite`)

            user.favourites.push(story.id)

            await user.save()
        })()
    },

    /**
     * 
     * @param {String} userId 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string userId, storyId
     * @throws {ValueError} on empty or blank userId, storyId
     * @throws {NotFoundError} on unexisting user with id userId
     * @throws {NotFoundError} on unexisting story with id storyId
     * @throws {NotFoundError} on story with id storyId tagged as favourite
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    removeFavourites(userId, storyId) {
        validate([
            { key: 'userId', value: userId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let user = await User.findById(userId)

            if (!user) throw new NotFoundError(`user with id ${userId} not found`)

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            const index = user.favourites.findIndex(__story => __story.toString() === story.id.toString())

            if (index < 0) throw new NotFoundError(`story with id ${storyId} not found as favourite`)

            story.pages.splice(index, 1)

            user.favourites.splice(index, 1)

            await user.save()
        })()
    },

    /**
     * 
     * @param {String} userId 
     * 
     * @throws {TypeError} on non-string userId
     * @throws {ValueError} on empty or blank userId
     * @throws {NotFoundError} on unexisting user with id userId
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */

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
                delete story.vectors
                delete story.cover
                delete story.inProcess
                story.author = story.author.toString()

                return favourites.push(story)
            })
            return favourites
        })()

    },

/**
 * 
 * @param {String} title 
 * @param {String} author 
 * @param {String} audioLanguage 
 * @param {String} textLanguage 
 * 
 * @throws {TypeError} on non-string title, author, audioLanguage, textLanguage
 * @throws {ValueError} on empty or blank title, author, audioLanguage, textLanguage
 * @throws {NotFoundError} on unexisting user with id author
 * @throws {AlreadyExistsError} on stroy with title title already created by user with id author
 * 
 * @returns {Promise} resolves on correct data rejects on wrong data
 */
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

            story.cover = `${HOST}/api/users/${author}/stories/${story.id}/cover`

            await story.save()

            return story.id
        })()
    },

    /**
     * 
     * @param {String} author 
     * 
     * @throws {TypeError} on non-string author
     * @throws {ValueError} on empty or blank author
     * @throws {NotFoundError} on unexiting user with id author
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

                story.author = story.author.toString()

                return story
            })
            return stories
        })()

    },

    /**
     * 
     * @param {String} author 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string author, storyId
     * @throws {ValueError} on empty or blank author, storyId
     * @throws {NotFoundError} on unexisting user with id author
     * @throws {NotFoundError} on unexisting story with id storyId
     * @throws {NotFoundError} on unexisting story with id storyId inside user with id author
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    retrieveStory(author, storyId) {
        validate([
            { key: 'authorId', value: author, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let user = await User.findById(author)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let story = await Story.findById(storyId).populate('author').lean().exec()

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            // if(story.author.id !== author) throw new NotFoundError(`story with id ${storyId} not found in user with id ${author} stories`)

            story.id = story._id.toString()
            delete story._id
            delete story.__v

            story.author = story.author.name

            if (story.pages) {
                story.pages.forEach(page => {
                    page.id = page._id.toString()
                    delete page._id
                    delete page.__v
    
                    return page
                })
            }

            return story
        })()
    },
    
    /**
     * 
     * @param {String} storyId 
     * @param {String} dataURL 
     * @param {Array} vectors 
     * 
     * @throws {TypeError} on non-string storyId, dataURL, vectors
     * @throws {ValueError} on empty or blank storyId, dataURL
     * @throws {NotFoundError} on unexisting story with id storyId
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    saveStoryCover(storyId, dataURL, vectors) {
        validate([
            { key: 'storyId', value: storyId, type: String },
            { key: 'dataURL', value: dataURL, type: String },
            { key: 'vectors', value: vectors, type: Array}
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

    /**
     *          
     * @param {string} storyId 
     * 
     * @throws {TypeError} on non-string storyId
     * @throws {ValueError} on empty or blank storyId
     * @throws {NotFoundError} on unexisting story with id stoyId
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    retrieveStoryCover(storyId) {
        validate([
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

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

    /**
     * 
     * @param {String} id 
     * @param {String} title 
     * @param {String} author 
     * @param {String} audioLanguage 
     * @param {String} textLanguage 
     * 
     * @throws {TypeError} on non-string title, author, audioLanguage, textLanguage
     * @throws {ValueError} on empty or blank title, author, audioLanguage, textLanguage
     * @throws {NotFoundError} on unexisting user with id author
     * @throws {NotFoundError} on unexisting story with id id
     * @throws {NotFoundError} on unexisting story with id id inside user with id author
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

            //check if the stroy has userId as author. check it with mongo directly

            if (!story) throw new NotFoundError(`story with id ${id} not found`)

            // if(story.author.id !== author) throw new NotFoundError(`story with id ${id} not found in user with id ${author} stories`)


            title != null && (story.title = title)
            audioLanguage != null && (story.audioLanguage = audioLanguage)
            textLanguage != null && (story.textLanguage = textLanguage)

            await story.save()
        })()
    },

    /**
     * 
     * @param {String} id 
     * @param {String} author 
     * 
     * @throws {TypeError} on non-string id, author
     * @throws {ValueError} on empty or blank id, author
     * @throws {NotFoundError} on unexisting user with id author
     * @throws {NotFoundError} on unexisting story with id id
     * @throws {NotFoundError} on unexisting story with id id inside user with id author
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    finishStory(id, author) {
        validate([
            { key: 'id', value: id, type: String },
            { key: 'authorId', value: author, type: String }
        ])

        return (async () => {

            let user = await User.findById(author)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let story = await Story.findById(id)

            //check if the stroy has userId as author. check it with mongo directly

            if (!story) throw new NotFoundError(`story with id ${id} not found`)

            // if(story.author.id !== author) throw new NotFoundError(`story with id ${id} not found in user with id ${author} stories`)

            story.inProcess = false

            await story.save()
        })()
    },

    /**
     * 
     * @param {String} id 
     * @param {String} author 
     * 
     * @throws {TypeError} on non-string id, author
     * @throws {ValueError} on empty or blank id, author
     * @throws {NotFoundError} on unexisting user with id author
     * @throws {NotFoundError} on unexisting story with id id
     * @throws {NotFoundError} on unexisting story with id id inside user with id author
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    workInStory(id, author) {
        validate([
            { key: 'id', value: id, type: String },
            { key: 'authorId', value: author, type: String }
        ])

        return (async () => {

            let user = await User.findById(author)

            if (!user) throw new NotFoundError(`user with id ${author} not found`)

            let story = await Story.findById(id)

            if (!story) throw new NotFoundError(`story with id ${id} not found`)
            // if (!story) throw new NotFoundError(`story with id ${id} not found in user with id ${author} stories`)


            story.inProcess = true

            await story.save()
        })()
    },

    /**
     * 
     * @param {String} author 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string author, storyId
     * @throws {ValueError} on empty or blank author, storyId
     * @throws {NotFoundError} on unexisting user with id author
     * @throws {NotFoundError} on unexisting story with id storyId
     * @throws {NotFoundError} on unexisting story with id storyId inside user with id author
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
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

            // if(story.author.id !== author) throw new NotFoundError(`story with id ${storyId} not found in user with id ${author} stories`)

            await story.remove()

        })()
    },

    /**
     * 
     * @param {String} query 
     * 
     * @throws {TypeError} on non-string query
     * @throws {ValueError} on empty or blank query
     * @throws {NotFoundError} on unnexisting stories containing query in title
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    searchStoriesByTitle(query) {
        validate([
            { key: 'query', value: query, type: String }
        ])
        return (async () => {

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

    /**
     * @throws {NotFoundError} on unexisting stories in the database
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    searchRandomStories() {

        return (async () => {

            let stories = await Story.find({ inProcess: false }).lean()

            if (!stories.length) throw new NotFoundError(`stories not found`)

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

    /**
     * 
     * @param {String} storyId 
     * @param {String} text 
     * 
     * @throws {TypeError} on non-string storyId, text
     * @throws {ValueError} on empty or blank storyId, text
     * @throws {NotFoundError} on unexisting story with id storyId
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    addPage(storyId, text) {
        validate([
            { key: 'storyId', value: storyId, type: String },
            { key: 'text', value: text, type: String, optional: true }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = new Page({ text })

            page.image = `${HOST}/api/users/${story.author.toString()}/stories/${storyId}/pages/${page.id.toString()}/picture`

            page.audioURL = `${HOST}/api/users/${story.author.toString()}/stories/${storyId}/pages/${page.id.toString()}/audio`

            story.pages.push(page)

            await story.save()

            return page.id
        })()
    },

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId 
     * @param {String} text 
     * 
     * @throws {TypeError} on non-string pageId,storyId, text
     * @throws {ValueError} on empty or blank pageId, storyId, text
     * @throws {NotFoundError} on unexisting page with id pageId
     * @throws {NotFoundError} on unexisting story with id storyId
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    updatePage(pageId, storyId, text) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String },
            { key: 'text', value: text, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = story.pages.id(pageId)

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            page.text = text

            // const _page = story.pages.find(page => page.id === pageId)

            // _page.text = text

            await story.save()
        })()
    },

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string pageId, storyId
     * @throws {ValueError} on empty or blank pageId, storyId
     * @throws {NotFoundError} on unexisting page with id pageId
     * @throws {NotFoundError} on unexisting story with id storyId
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    retrievePage(pageId, storyId) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {
            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = story.pages.id(pageId)

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            return {id:page._id.toString(), hasImage: page.hasImage, hasAudio: page.hasAudio, vectors: page.vectors, dataURL: page.dataURL, audioURL: page.audioURL, text: page.text}
        })()
    },

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId 
     * @param {String} dataURL 
     * @param {String} vectors 
     *
     * @throws {TypeError} on non-string pageId, storyId, dataURL, vectors
     * @throws {ValueError} on empty or blank pageId, storyId, dataURL 
     * @throws {NotFoundError} on unexisting story with id storyId
     * @throws {NotFoundError} on unexisting page with id pageId
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    savePagePicture(pageId, storyId, dataURL, vectors) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String },
            { key: 'dataURL', value: dataURL, type: String },
            { key: 'vectors', value: vectors, type: Array}
        ])

        return (async () => {
            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = story.pages.id(pageId)

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            page.dataURL = dataURL

            page.vectors = vectors

            page.hasImage = true

            // const _page = story.pages.find(page => page.id === pageId)

            // _page.dataURL = dataURL

            // _page.vectors = vectors

            // _page.hasImage = true

            await story.save()
        })()
    },

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string pageId, storyId
     * @throws {ValueError} on empty or blank pageId, storyId
     * @throws {NotFoundError} on unexisting page with id pageId
     * @throws {NotFoundError} on unexisting story with id storyId
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    retrievePagePicture(pageId, storyId) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = story.pages.id(pageId)

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            return {id:page._id.toString(), hasImage: page.hasImage, vectors: page.vectors, dataURL: page.dataURL}
        })()
    },

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId
     * 
     * @throws {TypeError} on non-string pageId, storyId
     * @throws {ValueError} on empty or blank pageId, storyId
     * @throws {NotFoundError} on unexisting page with id pageId
     * @throws {NotFoundError} on unexisting story with id storyId
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data 
     */
    removePage(pageId, storyId) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = story.pages.id(pageId)

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            const index = story.pages.findIndex(page => page.id === pageId)

            story.pages.splice(index, 1)

            await story.save()
        })()
    },

    /**
     *      
     * @param {String} pageId 
     * @param {String} storyId 
     * @param {Object} audioFile 
     * 
     * @throws {TypeError} on non-string pageId, storyId
     * @throws {ValueError} on empty or blank pageId, storyId
     * @throws {NotFoundError} on unexisting page with id pageId
     * @throws {NotFoundError} on unexisting story with id storyId
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    savePageAudio(pageId, storyId, audioFile) {

        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
            // { key: 'audioFile', value: audioFile, type: String }
        ])

        const folder = `data/stories/${storyId}`

        const pathToFile = path.join(`${folder}/pages/${pageId}`, 'audio.ogg')

        return Story.findById(storyId)
            .then(story => {
                if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

                const page = story.pages.id(pageId)

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
                    fs.unlinkSync(pathToFile)
                }

                const ws = fs.createWriteStream(pathToFile)

                audioFile.pipe(ws)

                page.hasAudio = true

                return story.save()
            })
    },

    /**
     * 
     * @param {String} pageId 
     * @param {String} storyId 
     * 
     * @throws {TypeError} on non-string pageId, storyId
     * @throws {ValueError} on empty or blank pageId, storyId
     * @throws {NotFoundError} on unexisting page with id pageId
     * @throws {NotFoundError} on unexisting story with id storyId
     * 
     * @returns {Promise} resolves on correct data rejects on wrong data
     */
    retrievePageAudio(pageId, storyId) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String }
        ])

        return Story.findById(storyId)
            .then(story => {
                if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

                let page = story.pages.id(pageId)

                if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

                let file

                if (page.hasAudio) {
                    file = `data/stories/${storyId}/pages/${pageId}/audio.ogg`
                } else {
                    file = null
                }

                const rs = fs.createReadStream(file)

                return rs
            })
    },

}

module.exports = logic



