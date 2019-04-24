require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
})

const getPlayers = (req, res) => {
  pool.query('SELECT * FROM players', (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

module.exports = {
  getPlayers
}
