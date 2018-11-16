const express = require('express')
const bodyParser = require('body-parser')
const logic = require('../logic')
const jwt = require('jsonwebtoken')
const bearerTokenParser = require('../utils/bearer-token-parser')
const jwtVerifier = require('./jwt-verifier')
const routeHandler = require('./route-handler')
const fs = require('fs')
const jsonBodyParser = bodyParser.json()
const multer = require('multer')

// let storage = multer.diskStorage({
//     destination: (req, file, cb) => {

//         const path = __dirname + `/../data/users/${req.params.id}`

//         if (!(fs.existsSync(path))) {

//             fs.mkdirSync(path)
//         }
//         cb(null, path)
//     },

//     filename: (req, file, cb) => {
//         cb(null, file.originalname)
//     }
// })

// const upload = multer({ storage: storage })

const upload = multer()

const router = express.Router()

const { env: { JWT_SECRET } } = process

router.post('/users', jsonBodyParser, (req, res) => {
    routeHandler(() => {
        const { name, surname, username, password } = req.body

        return logic.registerUser(name, surname, username, password)
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

        return logic.authenticateUser(username, password)
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
            .then(user =>
                res.json({
                    data: user
                })
            )
    }, res)
})

router.patch('/users/:id', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub, body: { name, surname, username, newPassword, password } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.updateUser(id, name ? name : null, surname ? surname : null, username ? username : null, newPassword ? newPassword : null, password)
            .then(() =>
                res.json({
                    message: 'user updated'
                })
            )
    }, res)
})

router.post('/users/:id/colaborator', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { sub, params: { id }, body: { colaborator } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.addColaborator(id, colaborator)
            .then(() => res.json({
                message: 'colaborator added'
            }))

    }, res)
})

// router.post('/users/:id/file', [bearerTokenParser, jwtVerifier, jsonBodyParser, upload.single('file')], (req, res) => {
//     routeHandler(() => {
//         const { params: { id }, sub, file } = req

//         if (id !== sub) throw Error('token sub does not match user id')

//         return res.json({
//             message: 'picture uploaded'
//         })

//     }, res)
// })

router.get('/users/:id/file', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub } = req
        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrievePicture(id)
            .then(file => {
                var bitmap = fs.readFileSync(__dirname + `/../data/users/${req.params.id}/` + `${file}`);
                let data = new Buffer(bitmap).toString('base64')
                
                return data = `data:image/jpeg;base64,${data}`
            })
            .then(file =>
                res.json({
                    data: file
                })
            )
    }, res)
})

router.post('/users/:id/file', [bearerTokenParser, jwtVerifier, upload.single('file')], (req, res) => {
    routeHandler(() => {
        const { params: { id }, sub, file } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.addPicture(id, file)
            .then(() =>
                res.json({
                    message: 'picture uploaded'
                })
            )
    }, res)
})


router.post('/users/:id/postits', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { sub, params: { id }, body: { text } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.addPostit(id, text)
            .then(() => res.json({
                message: 'postit added'
            }))

    }, res)
})

router.get('/users/:id/postits', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { sub, params: { id } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.listPostits(id)
            .then(postits => res.json({
                data: postits
            }))
    }, res)
})

router.put('/users/:id/postits/:postitId', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { sub, params: { id, postitId }, body: { text } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.modifyPostit(postitId, text)
            .then(() => res.json({
                message: 'postit modified'
            }))
    }, res)
})

router.patch('/users/:id/postits/:postitId', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { sub, params: { id, postitId }, body: { status } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.modifyStatus(postitId, status)
            .then(() => res.json({
                message: 'postit status modified'
            }))
    }, res)
})

router.delete('/users/:id/postits/:postitId', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { sub, params: { id, postitId } } = req

        if (id !== sub) throw Error('token sub does not match user id')
        return logic.removePostit(postitId)
            .then(() => res.json({
                message: 'postit removed'
            }))
    }, res)

})

router.patch('/users/:id/postits/:postitId/asign', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { sub, params: { id, postitId }, body: { colaborator } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.asignPostit(id, postitId, colaborator)
            .then(() => res.json({
                message: 'postit asigned'
            }))
    }, res)
})

router.delete('/users/:id/postits/:postitId/asign', [bearerTokenParser, jwtVerifier, jsonBodyParser], (req, res) => {
    routeHandler(() => {
        const { sub, params: { id, postitId } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.removeAsigned(id, postitId)
            .then(() => res.json({
                message: 'postit removed'
            }))
    }, res)
})

router.get('/users/:id/postitsAsigned', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { sub, params: { id } } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.listAsignedPostits(id)
            .then(postits => res.json({
                data: postits
            }))
    }, res)
})

router.get('/users/:id/colaborators', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { sub, params: { id } } = req

        if (id !== sub) throw Error('token sub does not match user id')
        return logic.listColaborators(id)
            .then(colaborators => {

                return res.json({
                    data: colaborators
                })
            })
    }, res)
})

router.get('/users/:id/username/:queryId', [bearerTokenParser, jwtVerifier], (req, res) => {
    routeHandler(() => {
        const { sub, params: { id, queryId } } = req

        if (id !== sub) throw Error('token sub does not match user id')
        return logic.getUsername(queryId)
            .then(username => res.json({
                data: username
            }))
    }, res)
})
module.exports = router