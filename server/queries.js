const Pool = require('pg').Pool
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

const getPlayerFromGames = (req, res) => {
  const id = parseInt(req.params.id)
  pool.query('SELECT * FROM games WHERE winnerid = $1 OR loserid = $1', [id], (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getPlayers = (req, res) => {
  pool.query('SELECT * FROM players', (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getPlayerById = (req, res) => {
  const id = parseInt(req.params.id)
  pool.query('SELECT * FROM players WHERE id = $1', [id], (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const allFactions = (req, res) => {
  pool.query('SELECT * FROM factions', (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getFaction = (req, res) => {
  const faction = req.params.faction
  pool.query('SELECT * FROM agendas WHERE faction = $1', [faction], (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getAgenda = (req, res) => {
  const faction = req.params.faction
  const agenda = req.params.agenda
  pool.query('SELECT * FROM oppfactions WHERE faction = $1 AND agenda = $2', [faction, agenda], (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getOppfaction = (req, res) => {
  const faction = req.params.faction
  const agenda = req.params.agenda
  const oppfaction = req.params.oppfaction
  pool.query('SELECT * FROM oppagendas WHERE faction = $1 AND agenda = $2 AND oppfaction = $3', [faction, agenda, oppfaction], (err, data) => {
    if(err) throw err
    res.status(200).json(data.rows)
  })
}

const getOppagenda = (req, res) => {
  const faction = req.params.faction
  const agenda = req.params.agenda
  const oppfaction = req.params.oppfaction
  const oppagenda = req.params.oppagenda
  const fulldata = new Array
  pool.query('SELECT * FROM games WHERE winnerfaction = $1 AND winneragenda = $2 AND loserfaction = $3 AND loseragenda = $4', [faction, agenda, oppfaction, oppagenda], (err, data) => {
    if(err) throw err
    data.rows.forEach((d) => {
      fulldata.push(d)
    })
    pool.query('SELECT * FROM games WHERE winnerfaction = $3 AND winneragenda = $4 AND loserfaction = $1 AND loseragenda = $2', [faction, agenda, oppfaction, oppagenda], (err, data) => {
      if(err) throw err
      data.rows.forEach((d) => {
        fulldata.push(d)
      })
      res.status(200).json(fulldata)
    })
  })

}

module.exports = {
  getPlayers,
  getPlayerById,
  allFactions,
  getFaction,
  getAgenda,
  getOppfaction,
  getOppagenda,
  getPlayerFromGames,
  getAllGames
}
