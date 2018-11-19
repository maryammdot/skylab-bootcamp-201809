const express = require('express')
const bodyparser = require('body-parser')
const jwt = require('jsonwebtoken')

const logic = require('../logic')
const routHandler = require('./route-handler')
const bearerTokenParser = require('../utils/bearer-token-parser')
const jwtVerifier = require('./jwt-verifier')

const jsonBodyParser = bodyparser.json()
const router = express.Router()

const { env: { JWT_SECRET } } = process

// Routes refered to users

router.post('/users', jsonBodyParser, (req, res) => {
    routHandler(() => {
        const { name, surname, username, password } = req.body

        return logic.register(name, surname, username, password)
            .then(() => {
                res.status(201)

                res.json({
                    message: `${username} successfully registered`
                })
            })
    }, res)
})

router.post('/auth', jsonBodyParser, (req, res) => {
    routHandler(() => {
        const { username, password } = req.body

        return logic.authenticate(username, password)
            .then(id => {
                const token = jwt.sign({ sub: id }, JWT_SECRET)

                res.json({
                    data: {
                        id,
                        token
                    }
                })
            })
    }, res)
})

router.get('/users/:id', [bearerTokenParser, jwtVerifier], (req, res) => {
    routHandler(() => {
        const { params: { id }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrieveUser(id)
            .then(user => {
                res.json({
                    data: user

                })
            })
    }, res)
})

router.patch('/users/:id', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    routHandler(() => {
        const { params: { id }, sub, body: {name, surname, username, newPassword, password} } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.updateUser(id, name, surname, username, newPassword, password)
            .then(() => {
                res.json({
                    message: `${username} successfully updated`

                })
            })
    }, res)
})


// Routes refered to stories


router.post('/users/:id/stories', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    routHandler(() => {
        const { params: { id }, sub, body: { title, audioLanguage, textLanguage } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.addStory(title, id, audioLanguage, textLanguage)
            .then(() => {
                res.json({
                    message: `story with title ${title} of user with user id ${id} correctly added`
                })
            })
    }, res)
})

router.get('/users/:id/stories', [bearerTokenParser, jwtVerifier], (req, res) => {
    routHandler(() => {
        const { params: { id }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.listStories(id)
            .then(stories => {
                res.json({
                    data: stories
                })
            })
    }, res)
})

router.patch('/users/:id/stories/:storyId', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    routHandler(() => {
        const { params: { id, storyId }, sub, body: { title, audioLanguage, textLanguage } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.updateStory(storyId, title, id, audioLanguage, textLanguage)
            .then(() => {
                res.json({
                    message: `story with title ${title} of user with user id ${id} correctly updated`
                })
            })
    }, res)
})



// Routes refered to pages


router.post('/users/:id/stories/:storyId/pages', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    routHandler(() => {
        const { params: { id, storyId }, sub, body: { index, text } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.addPage(storyId, index, text)
            .then(() => {
                res.json({
                    message: `page ${index} of story with id ${storyId} of user with user id ${id} correctly added`
                })
            })
    }, res)
})

router.patch('/users/:id/stories/:storyId/pages/:pageId', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    routHandler(() => {
        const { params: { id, storyId, pageId }, sub, body: { index, text } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.updatePage(pageId, storyId, index, text)
            .then(() => {
                res.json({
                    message: `page ${index} of story with id ${storyId} of user with user id ${id} correctly updated`
                })
            })
    }, res)
})

router.delete('/users/:id/stories/:storyId/pages/:pageId', [bearerTokenParser, jwtVerifier], (req, res) => {
    routHandler(() => {
        const { params: { id, storyId, pageId }, sub} = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.removePage(pageId, storyId)
            .then(() => {
                res.json({
                    message: `page  with id ${pageId} of story with id ${storyId} correctly removed`
                })
            })
    }, res)
})


module.exports = router