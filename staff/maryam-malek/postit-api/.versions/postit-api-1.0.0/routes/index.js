const express = require('express')
const bodyParser = require('body-parser')
const logic = require('../logic')
const jwt = require('jsonwebtoken')

const bearerTokenParser = require('../utils/bearer-token-parser')
const jwtVerifier = require('./jwt-verifier')
const routeHandler = require('./route-handler')

const jsonBodyParser = bodyParser.json()

const router = express.Router()

const { env: { JWT_SECRET } } = process

router.post('/users', jsonBodyParser, (req, res) => {
    const { name, surname, username, password } = req.body

    routeHandler(() => {
        return logic.registerUser(name, surname, username, password)
            .then(() =>
                res.json({
                    message: `${username} successfully registered`
                })
            )
    }, res)
})

router.post('/auth', jsonBodyParser, (req, res) => {
    const { username, password } = req.body

    routeHandler(() => {
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
    const { params: { id }, sub } = req

    routeHandler(() => {

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrieveUser(id)
            .then(user =>
                res.json({
                    data: user
                })
            )
    }, res)
})

router.patch('/users/:id', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    const { params: { id }, sub } = req
    debugger
    const { name, surname, newPassword, currentPassword } = req.body

    routeHandler(() => {

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.updateUser(id, name, surname, newPassword, currentPassword)
            .then(() =>
                res.json({
                    message: 'user successfully updated'
                })
            )
    }, res)
})

router.post('/users/:id/postits', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    const { params: { id }, sub } = req

    const { text } = req.body

    routeHandler(() => {
        if (id !== sub) throw Error('token sub does not match user id')

        return logic.addPostit(id, text)
            .then(() =>
                res.json({
                    message: 'postit successfully added'
                })
            )
    }, res)
})

router.delete('/users/:id/postits/:postitId', [bearerTokenParser, jwtVerifier], (req, res) => {
    const { params: { id, postitId }, sub } = req

    routeHandler(() => {
        if (id !== sub) throw Error('token sub does not match user id')

        return logic.removePostit(id, postitId)
            .then(() =>
                res.json({
                    message: 'postit successfully deleted'
                })
            )
    }, res)
})

router.patch('/users/:id/postits/:postitId', [jsonBodyParser, bearerTokenParser, jwtVerifier], (req, res) => {
    const { params: { id, postitId }, sub } = req

    const { text } = req.body

    routeHandler(() => {
        if (id !== sub) throw Error('token sub does not match user id')

        return logic.modifyPostit(id, postitId, text)
            .then(() =>
                res.json({
                    message: 'postit successfully updated'
                })
            )
    }, res)
})

router.get('/users/:id/postits', [bearerTokenParser, jwtVerifier], (req, res) => {
    const { params: { id }, sub } = req

    routeHandler(() => {
        if (id !== sub) throw Error('token sub does not match user id')

        return logic.listPostits(id)
            .then(postits =>
                res.json({
                    data: postits
                })
            )
    }, res)
})

module.exports = router