'use strict'
const express = require('express')
const bodyparser = require('body-parser')
const jwt = require('jsonwebtoken')

const logic = require('../logic')
const routeHandler = require('./route-handler')
const bearerTokenParser = require('../utils/bearer-token-parser')
const jwtVerifier = require('./jwt-verifier')
const Busboy = require('busboy')

const jsonBodyParser = bodyparser.json({ limit: '50mb' })
const router = express.Router()

// app.use(bodyParser.json({ limit: '50mb' }))
// app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

const { env: { JWT_SECRET } } = process

// Routes refered to users

router.post('/users', jsonBodyParser, (req, res) => {
    routeHandler(() => {
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
    routeHandler(() => {
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
    routeHandler(() => {
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

// router.patch('/users/:id', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
//     routeHandler(() => {
//         const { params: { id }, sub, body: { name, surname, username, newPassword, password } } = req

//         if (id !== sub) throw Error('token sub does not match user id')

//         return logic.updateUser(id, name, surname, username, newPassword, password)
//             .then(() => {
//                 res.json({
//                     message: `${username} successfully updated`

//                 })
//             })
//     }, res)
// })

router.post('/users/:id/stories/:storyId/favourites', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id, storyId }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.addFavourites(id, storyId)
            .then(() => {
                res.json({
                    message: ` story with id ${storyId} successfully added to favourites`
                })
            })
    }, res)
})

router.delete('/users/:id/stories/:storyId/favourites', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id, storyId }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.removeFavourites(id, storyId)
            .then(() => {
                res.json({
                    message: ` story with id ${storyId} successfully removed from favourites`
                })
            })
    }, res)
})

router.get('/users/:id/favourites', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.listFavourites(id)
            .then(stories => {
                res.json({
                    data: stories
                })
            })
    }, res)
})

// Routes refered to stories


router.post('/users/:id/stories', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub, body: { title, audioLanguage, textLanguage } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.addStory(title, id, audioLanguage, textLanguage)
            .then(storyId => {
                res.json({
                    data: { storyId },
                    message: `story with title ${title} of user with user id ${id} correctly added`
                })
            })
    }, res)
})

router.get('/users/:id/stories', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
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

router.get('/users/:id/stories/:storyId', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id, storyId }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrieveStory(id, storyId)
            .then(story => {
                res.json({
                    data: story
                })
            })
    }, res)
})

router.patch('/users/:id/stories/:storyId', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
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

router.patch('/users/:id/stories/:storyId/finish', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id, storyId }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.finishStory(storyId, id)
            .then(() => {
                res.json({
                    message: `story with id ${storyId} of user with user id ${id} correctly tagged as finished`
                })
            })
    }, res)
})

router.patch('/users/:id/stories/:storyId/process', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id, storyId }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.workInStory(storyId, id)
            .then(() => {
                res.json({
                    message: `story with id ${storyId} of user with user id ${id} correctly tagged as in working process`
                })
            })
    }, res)
})

router.post('/users/:id/stories/:storyId/cover', jsonBodyParser, (req, res) => {
    routeHandler(() => {
        const { params: { storyId }, body: { dataURL, vectors } } = req

        return logic.saveStoryCover(storyId, dataURL, vectors)
            .then(() => {
                res.json({
                    message: `cover of story with id ${storyId} correctly added`
                })
            })
    }, res)
})

router.get('/users/:id/stories/:storyId/cover', (req, res) => {
    routeHandler(() => {
        const { params: { storyId } } = req

        return logic.retrieveStoryCover(storyId)
            .then(({ dataURL, vectors, hasCover }) => {

                res.json({
                    data: { dataURL, vectors, hasCover }
                })
            })
    }, res)
})

// router.post('/users/:id/stories/:storyId/cover', (req, res) => {
//     routeHandler(() => {
//         const { params: { id, storyId } } = req

//         return new Promise((resolve, reject) => {
//             const busboy = new Busboy({ headers: req.headers })

//             busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {

//                 logic.saveStoryCover(id, storyId, file)
//             })

//             busboy.on('finish', () => resolve())

//             busboy.on('error', err => reject(err))

//             req.pipe(busboy)
//         })
//             .then(() => res.json({
//                 message: `cover from story with id ${storyId} correctly saved`
//             }))
//     }, res)
// })

// router.get('/users/:id/stories/:storyId/cover', (req, res) => {
//     routeHandler(() => {
//         const { params: { id, storyId } } = req

//         return Promise.resolve()
//             .then(() => logic.retrieveStoryCover(id, storyId))
//             .then(coverStream => coverStream.pipe(res))
//     }, res)
// })

router.delete('/users/:id/stories/:storyId', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id, storyId }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.removeStory(id, storyId)
            .then(() => {
                res.json({
                    message: `story with id ${storyId} correctly removed`
                })
            })
    }, res)
})

router.get('/users/:id/stories/find/:query', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id, query }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.searchStoriesByTitle(query)
            .then(stories => {
                res.json({
                    data: stories
                })
            })
    }, res)
})

router.get('/users/:id/findRandomStories', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.searchRandomStories()
            .then(stories => {
                
                res.json({
                    data: stories
                })
            })
    }, res)
})


// Routes refered to pages


router.post('/users/:id/stories/:storyId/pages', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id, storyId }, sub, body: { text } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.addPage(storyId, text)
            .then(pageId => {
                res.json({
                    data: { pageId },
                    message: `page of story with id ${storyId} of user with user id ${id} correctly added`
                })
            })
    }, res)
})

router.patch('/users/:id/stories/:storyId/pages/:pageId', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id, storyId, pageId }, sub, body: { text } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.updatePage(pageId, storyId, text)
            .then(() => {
                res.json({
                    message: `page of story with id ${storyId} of user with user id ${id} correctly updated`
                })
            })
    }, res)
})

router.get('/users/:id/stories/:storyId/pages/:pageId', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id, storyId, pageId }, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrievePage(pageId, storyId)
            .then(page => {
                res.json({
                    data: page
                })
            })
    }, res)
})

// router.post('/users/:id/stories/:storyId/pages/:pageId/picture', (req, res) => {
//     routeHandler(() => {
//         const { params: { storyId, pageId }} = req

//         return new Promise((resolve, reject) => {
//             const busboy = new Busboy({ headers: req.headers })

//             busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
//                 logic.savePicPage(pageId, storyId, file)
//             })

//             busboy.on('finish', () => resolve())

//             busboy.on('error', err => reject(err))

//             req.pipe(busboy)
//         })
//             .then(() => res.json({
//                 message: `picture from page with id ${pageId} of correctly saved`
//             }))
//     }, res)
// })

router.post('/users/:id/stories/:storyId/pages/:pageId/picture', jsonBodyParser, (req, res) => {
    routeHandler(() => {
        const { params: { storyId, pageId }, body: { dataURL, vectors } } = req

        return logic.savePagePicture(pageId, storyId, dataURL, vectors)
            .then(() => {
                res.json({
                    message: `picture of page with id ${pageId} of story with id ${storyId} correctly added`
                })
            })
    }, res)
})


// router.get('/users/:id/stories/:storyId/pages/:pageId/picture', (req, res) => {
//     routeHandler(() => {
//         const { params: { storyId, pageId }} = req

//         return Promise.resolve()
//             .then(() => logic.retrievePagePic(pageId, storyId))
//             .then(pictureStream => pictureStream.pipe(res))
//     }, res)
// })

router.get('/users/:id/stories/:storyId/pages/:pageId/picture', (req, res) => {
    routeHandler(() => {
        const { params: { storyId, pageId } } = req

        return logic.retrievePagePicture(pageId, storyId)
            .then(({ dataURL, vectors, hasImage }) => {
                
                res.json({
                    data: { dataURL, vectors, hasImage }
                })
            })
    }, res)
})

// router.post('/users/:id/stories/:storyId/pages/:pageId/audio', jsonBodyParser, (req, res) => {
//     routeHandler(() => {
//         const { params: { storyId, pageId }, body: { audioBlob } } = req
// debugger
//         return logic.savePageAudio(pageId, storyId, audioBlob)
//             .then(() => {
//                 res.json({
//                     message: `audio of page with id ${pageId} of story with id ${storyId} correctly added`
//                 })
//             })
//     }, res)
// })

router.post('/users/:id/stories/:storyId/pages/:pageId/audio', (req, res) => {
    routeHandler(() => {
        const { params: { id, storyId, pageId } } = req

        return new Promise((resolve, reject) => {
            const busboy = new Busboy({ headers: req.headers })

            busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
                
                logic.savePageAudio(pageId, storyId, file)
            })

            busboy.on('finish', () => resolve())

            busboy.on('error', err => reject(err))

            req.pipe(busboy)
        })
            .then((audioURL) => {
                
                res.json({
                    data: audioURL,
                    message: `picture from page with id ${pageId} of correctly saved`
                })
            })
    }, res)
})

// router.get('/users/:id/stories/:storyId/pages/:pageId/audio', (req, res) => {
//     routeHandler(() => {
//         const { params: { storyId, pageId } } = req

//         return logic.retrievePagePicture(pageId, storyId)
//             .then(({audioUrl, audioBlob, hasAudio}) => {

//                 res.json({
//                     data: {audioUrl, audioBlob, hasAudio}
//                 })
//             })
//     }, res)
// })

router.get('/users/:id/stories/:storyId/pages/:pageId/audio', (req, res) => {
    routeHandler(() => {
        const { params: { storyId, pageId } } = req

        return Promise.resolve()
            .then(() => logic.retrievePageAudio(pageId, storyId))
            .then(audioStream => audioStream.pipe(res))
    }, res)
})

router.delete('/users/:id/stories/:storyId/pages/:pageId', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { params: { id, storyId, pageId }, sub } = req

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