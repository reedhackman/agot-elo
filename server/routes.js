const express = require('express')
const router = express.Router()

const db = require('./queries.js')

router.get('/', (req, res) => res.json({id: 4}))

router.get('/players', db.getPlayers)

module.exports = router
