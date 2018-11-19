const { User, Story, Page } = require('../data/index')
const validate = require('../utils/validate')
const { AlreadyExistsError, AuthError, NotFoundError } = require('../errors')

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

            if(user.password !== password) throw new AuthError ('wrong password')

            name != null && (user.name = name)
            surname != null && (user.surname = surname)
            username != null && (user.username = username)
            newPassword != null && (user.password = newPassword)

            await user.save()
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

            await story.save()
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

                story.author = story.author.toString()

                if (story.pages) {
                    story.pages.forEach(page => {
                        page.id = page._id.toString()
                        delete page._id
                        delete page.__v
                        delete page.image
                        delete page.audio
                        return page
                    })
                }
                return story
            })

            return stories
        })()
    },

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

    removeStory(storyId) {
        validate([
            { key: 'storyId', value: storyId, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            await story.remove()

        })()
    },

    addPage(storyId, index, text) {
        validate([
            { key: 'storyId', value: storyId, type: String },
            { key: 'index', value: index, type: Number },
            { key: 'text', value: text, type: String, optional: true }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            if (story.pages) {
                story.pages.forEach(page => {
                    if (page.index === index) throw new AlreadyExistsError(`page ${index} already exists`)
                })
            }
            page = new Page({ index, text })

            await page.save()

            story.pages.push(page)

            await story.save()
        })()
    },

    updatePage(pageId, storyId, index, text) {
        validate([
            { key: 'pageId', value: pageId, type: String },
            { key: 'storyId', value: storyId, type: String },
            { key: 'index', value: index, type: Number },
            { key: 'text', value: text, type: String }
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = await Page.findById(pageId)

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            if (page.index !== index) throw Error(`page with id ${pageId} not found`)

            //THINK ABOUT KIND OF ERROR I WANT TO THROW!!

            page.text = text

            await page.save()

            const _page = story.pages.find(page => page.id === pageId)

            _page.text = text

            await story.save()
        })()
    },

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

    addPageImage(storyId, pageId, img) {
        validate([
            { key: 'storyId', value: storyId, type: String },
            { key: 'pageId', value: pageId, type: String },
            { key: 'img', value: img, type: String } //TYPE¿????
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = await Page.findById(pageId)

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            //FS!!!!!!!

        })()
    },

    addPageAudio(storyId, pageId, audio) {
        validate([
            { key: 'storyId', value: storyId, type: String },
            { key: 'pageId', value: pageId, type: String },
            { key: 'audio', value: audio, type: String } //TYPE???
        ])

        return (async () => {

            let story = await Story.findById(storyId)

            if (!story) throw new NotFoundError(`story with id ${storyId} not found`)

            let page = await Page.findById(pageId)

            if (!page) throw new NotFoundError(`page with id ${pageId} not found`)

            //FS!!!!!!!

        })()
    }

}

module.exports = logic



