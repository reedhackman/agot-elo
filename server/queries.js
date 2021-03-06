require('dotenv').config()
const { Pool } = require('pg')

/*
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
})
*/

const pool = new Pool({
  user: 'me',
  host: 'localhost',
  database: 'api',
  password: 'password',
  port: 5432
})

const getAllGames = (req, res) => {
  pool.query('SELECT * FROM games', (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getSpecificPlayerFromGames = (req, res) => {
  const id = parseInt(req.params.id)
  pool.query('SELECT * FROM games WHERE winner_id = $1 OR loser_id = $1', [id], (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getAllPlayers = (req, res) => {
  pool.query('SELECT * FROM players', (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getSpecificPlayer = (req, res) => {
  const id = parseInt(req.params.id)
  pool.query('SELECT * FROM players WHERE id = $1', [id], (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getAllDecks = (req, res) => {
  pool.query('SELECT * FROM decks', (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getDecksByFaction = (req, res) => {
  const faction = req.params.faction
  pool.query('SELECT * FROM decks WHERE faction = $1', [faction], (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getSpecificDeck = (req, res) => {
  const faction = req.params.faction
  const agenda = req.params.agenda
  pool.query('SELECT * FROM decks WHERE faction = $1 AND agenda = $2', [faction, agenda], (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getAllMatchups = (req, res) => {
  pool.query('SELECT * FROM matchups', (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getSpecificMatchup = (req, res) => {
  pool.query('SELECT * FROM matchups WHERE faction = $1 AND agenda = $2 AND oppfaction = $3 AND oppagenda = $4', [faction, agenda, oppfaction, oppagenda], (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

module.exports = {
  getAllPlayers,
  getSpecificPlayer,
  getAllDecks,
  getDecksByFaction,
  getSpecificDeck,
  getAllMatchups,
  getSpecificMatchup,
  getAllGames,
  getSpecificPlayerFromGames
}
