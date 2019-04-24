require('dotenv').config()
const { Client, Pool } = require('pg')
const getJson = require('get-json')
const async = require('async')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
})

let page = 1
let length = 0
const url = 'https://thejoustingpavilion.com/api/v3/games?page='
let newGames = []
let createPlayersArray = []
let playersToUpdate = []
let updatePlayersArray = []
let players = {}

pool.query('SELECT * FROM position', (err, data) => {
  if(err){
    console.log('position table missing from database. creating now')
    createPositionTable()
    createPlayersTable()
  }
  else{
    page = data.rows[0].page
    length = data.rows[0].length
    check()
    refresh()
  }
})

const createPositionTable = () => {
  pool.query('CREATE TABLE position (page integer, length integer)', (err) => {
    if(err) throw err
    console.log('position table created in database')
    pool.query('INSERT INTO position (page, length) VALUES (1, 0)', (err) => {
      if(err) throw err
      console.log('inserted (page: 1, length: 0) into position')
    })
  })
}

const createPlayersTable = () => {
  pool.query('CREATE TABLE players (id integer NOT NULL, name text NOT NULL, wins integer NOT NULL, losses integer NOT NULL, rating decimal NOT NULL, percent decimal NOT NULL, played integer NOT NULL)', (err) => {
    if(err) throw err
    console.log('players table created in database')
  })
}

const createPlayer = (id, name) => {
  players[id] = {
    name: name,
    id: id,
    wins: 0,
    losses: 0,
    rating: 1200,
    percent: 0,
    played: 0
  }
  createPlayersArray.push((callback) => {
    pool.query('INSERT INTO testplayers (id, name, rating, wins, losses, percent, played) VALUES ($1, $2, $3, $4, $5, $6, $7)', [id, name, 1200, 0, 0, 0, 0], (err, data) => {
      if(err) throw err
      console.log('created player id: ' + id)
    })
    callback()
  })
}

const updateAllPlayers = () => {
  playersToUpdate.forEach((id) => {
    updatePlayersArray.push((callback) => {
      let wins = players[id].wins
      let losses = players[id].losses
      pool.query('UPDATE testplayers SET wins = $1, losses = $2, rating = $3, percent = $5, played = $6 WHERE id = $4', [wins, losses, players[id].rating, id, wins / (wins + losses), wins + losses], (err, data) => {
        if(err) throw err
        console.log('updated player id: ' + id)
      })
      callback()
    })
  })
  playersToUpdate = new Array
}

const refresh = () => {
  const time = 1000 * 60 * 60 * 1 // 1 hour
  setTimeout(() => {
    console.log(new Date().toUTCString() + ' checking thejoustingpavilion')
    checkTJP()
    refresh()
  }, time)
}

const check = () => {
  getJson(url + page, (err, games) => {
    if(err) throw err
    console.log('page ' + page + ' length ' + games.length)
    if(games.length > length){
      for(var i = length; i < games.length; i++){
        newGames.push(games[i])
      }
      if(games.length == 50){
        length = 0
        page++
        check()
      }
      else{
        length = games.length
        newGames.forEach((game) => {
          processGame(game)
        })
        newGames = []
        console.log('done with thejoustingpavilion')
        updateAllPlayers()
        let updatePositionArray = [(callback) => {
          pool.query('UPDATE position SET page = $1, length = $2', [page, length], (err) => {
            if(err) throw err
            console.log('updated position')
          })
          callback()
        }]
        const asyncCreatePlayers = (callback) => {
          async.series(createPlayersArray, callback)
        }
        const asyncUpdatePlayers = (callback) => {
          async.series(updatePlayersArray, callback)
        }
        const asyncUpdatePosition = (callback) => {
          async.series(updatePositionArray, callback)
        }
        async.series([
          asyncCreatePlayers,
          asyncUpdatePosition,
          asyncUpdatePlayers
        ])
      }
    }
  })
}

const processGame = (game) => {
  if(game.p1_id < 1 || game.p2_id < 1){
    return
  }
  else if(game.game_status != 100){
    return
  }
  let winner = new Object
  let loser = new Object
  if(game.p1_points > game.p2_points){
    winner = {
      name: game.p1_name,
      id: game.p1_id,
      faction: game.p1_faction,
      agenda: game.p1_agenda
    }
    loser = {
      name: game.p2_name,
      id: game.p2_id,
      faction: game.p2_faction,
      agenda: game.p2_agenda
    }
  }
  else if(game.p1_points < game.p2_points){
    winner = {
      name: game.p2_name,
      id: game.p2_id,
      faction: game.p2_faction,
      agenda: game.p2_agenda
    }
    loser = {
      name: game.p1_name,
      id: game.p1_id,
      faction: game.p1_faction,
      agenda: game.p1_agenda
    }
  }
  else{
    return
  }
  if(!(players[winner.id])){
    createPlayer(winner.id, winner.name)
  }
  if(!(players[loser.id])){
    createPlayer(loser.id, loser.name)
  }
  let qW = Math.pow(10, (players[winner.id].rating / 400))
  let qL = Math.pow(10, (players[loser.id].rating / 400))
  let eW = qW / (qW + qL)
  let eL = qL / (qW + qL)
  let k = 40
  players[winner.id].rating += k * (1 - eW)
  players[loser.id].rating += k * (0 - eL)
  players[winner.id].wins++
  players[loser.id].losses++
  if(!(playersToUpdate.includes(winner.id))){
    playersToUpdate.push(winner.id)
  }
  if(!(playersToUpdate.includes(loser.id))){
    playersToUpdate.push(loser.id)
  }
}
