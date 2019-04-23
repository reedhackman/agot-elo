const express = require('express')
const router = express.Router()

const db = require('./queries.js')

router.get('/', (req, res) => res.json({id: 4}))

router.get('/players', db.getPlayers)

router.get('/players/:id', db.getPlayerById)

router.get('/decks', db.allFactions)

router.get('/decks/:faction', db.getFaction)

router.get('/decks/:faction/:agenda', db.getAgenda)

router.get('/decks/:faction/:agenda/:oppfaction', db.getOppfaction)

router.get('/decks/:faction/:agenda/:oppfaction/:oppagenda', db.getOppagenda)


module.exports = router
