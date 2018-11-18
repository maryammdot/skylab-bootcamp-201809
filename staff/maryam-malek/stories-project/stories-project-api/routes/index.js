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
        const { params: {id}, sub } = req

        if (id !== sub) throw Error('token sub does not match user id')

        return logic.retrieveUser(id)
            .then(user => {
                debugger
                res.json({
                    data: {
                        user   
                    }
                })
            })
    }, res)
})

// Routes refered to stories


// Routes refered to pages


module.exports = router