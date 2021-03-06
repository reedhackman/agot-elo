require('dotenv').config()
const { Client, Pool } = require('pg')
const getJson = require('get-json')
const async = require('async')

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

let page = 1
let length = 0
const url = 'https://thejoustingpavilion.com/api/v3/games?page='
let newGames = []
let createPlayersArray = []
let playersToUpdate = []
let updatePlayersArray = []
let createDecksArray = []
let decksToUpdate = {}
let updateDecksArray = []
let createMatchupsArray = []
let matchupsToUpdate = {}
let updateMatchupsArray = []
let createGamesArray = []
let players = {}
let matchups = {}
let decks = {}
let exclude = ['draft', 'keyforge', 'destiny', 'l5r']
let tournamentsToExclude = []

pool.query('SELECT * FROM position', (err, data) => {
  if(err){
    console.log(err)
    createPositionTable()
    createPlayersTable()
    createMatchupsTable()
    createIncompleteTable()
    createDecksTable()
    createGamesTable()
  }
  else{
    page = data.rows[0].page
    length = data.rows[0].length
    console.log(`page: ${page}, length: ${length}`)
    populatePlayers()
    populateDecks()
    populateMatchups()
  }
  console.log(new Date().toUTCString() + ' checking thejoustingpavilion in 1 minute')
  setTimeout(() => {
    checkTJP()
  }, 1000 * 60 * 1)
  refresh()
})

const populateMatchups = () => {
  pool.query('SELECT * FROM matchups', (err, data) => {
    if(err){
      console.log(err)
      createMatchupsTable()
    }
    if(data.rows.length){
      data.rows.forEach((matchup) => {
        if(!(matchups[matchup.faction])){
          matchups[matchup.faction] = {
            [matchup.agenda]: {
              [matchup.oppfaction]: {
                [matchup.oppagenda]: {
                  wins: parseInt(matchup.wins),
                  losses: parseInt(matchup.losses)
                }
              }
            }
          }
        }
        else if(!(matchups[matchup.faction][matchup.agenda])){
          matchups[matchup.faction][matchup.agenda] = {
            [matchup.oppfaction]: {
              [matchup.oppagenda]: {
                wins: parseInt(matchup.wins),
                losses: parseInt(matchup.losses)
              }
            }
          }
        }
        else if(!(matchups[matchup.faction][matchup.agenda][matchup.oppfaction])){
          matchups[matchup.faction][matchup.agenda][matchup.oppfaction] = {
            [matchup.oppagenda]: {
              wins: parseInt(matchup.wins),
              losses: parseInt(matchup.losses)
            }
          }
        }
        else if(!(matchups[matchup.faction][matchup.agenda][matchup.oppfaction][matchup.oppagenda])){
          matchups[matchup.faction][matchup.agenda][matchup.oppfaction][matchup.oppagenda] = {
            wins: parseInt(matchup.wins),
            losses: parseInt(matchup.losses)
          }
        }
        else{
          console.log('duplicate matchup')
        }
      })
      console.log('loaded matchups from db')
    }
  })
}

const populateDecks = () => {
  pool.query('SELECT * FROM decks', (err, data) => {
    if(err){
      console.log(err)
      createDecksTable()
    }
    if(data.rows.length){
      data.rows.forEach((deck) => {
        if(!(decks[deck.faction])){
          decks[deck.faction] = {
            [deck.agenda]: {
              wins: parseInt(deck.wins),
              losses: parseInt(deck.losses)
            }
          }
        }
        else if(!(decks[deck.faction][deck.agenda])){
          decks[deck.faction][deck.agenda] = {
            wins: parseInt(deck.wins),
            losses: parseInt(deck.losses)
          }
        }
        else{
          console.log('duplicate deck')
        }
      })
      console.log('loaded decks from db')
    }
  })
}

const populatePlayers = () => {
  pool.query('SELECT * FROM players', (err, data) => {
    if(err){
      console.log(err)
      createPlayersTable()
    }
    if(data.rows.length){
      data.rows.forEach((player) => {
        if(!(players[player.id])){
          players[player.id] = {
            name: player.name,
            id: player.id,
            wins: parseInt(player.wins),
            losses: parseInt(player.losses),
            rating: parseFloat(player.rating),
            percent: parseFloat(player.percent),
            played: parseInt(player.played),
            peak: parseFloat(player.peak)
          }
        }
      })
      console.log('loaded players from db')
    }
  })
}

const createGamesTable = () => {
  pool.query('CREATE TABLE games (winner_id integer, winner_faction text, winner_agenda text, loser_id integer, loser_faction text, loser_agenda text, tournament_date date, tournament_id integer)', (err) => {
    if(err) throw err
    console.log('games table created in database')
  })
}

const createDecksTable = () => {
  pool.query('CREATE TABLE decks (faction text, agenda text, wins integer NOT NULL, losses integer NOT NULL)', (err) => {
    if(err) throw err
    console.log('decks table created in database')
  })
}

const createIncompleteTable = () => {
  pool.query('CREATE TABLE incomplete (game_id integer NOT NULL, tournament_id integer NOT NULL, tournament_date date)', (err) => {
    if(err) throw err
    console.log('incomplete table created in database')
  })
}

const createPositionTable = () => {
  pool.query('CREATE TABLE position (page integer NOT NULL, length integer NOT NULL)', (err) => {
    if(err) throw err
    console.log('position table created in database')
    pool.query('INSERT INTO position (page, length) VALUES (1, 0)', (err) => {
      if(err) throw err
      console.log('inserted (page: 1, length: 0) into position')
    })
  })
}

const createMatchupsTable = () => {
  pool.query('CREATE TABLE matchups (faction text, agenda text, oppfaction text, oppagenda text, wins integer NOT NULL, losses integer NOT NULL)', (err) => {
    if(err) throw err
    console.log('matchups table created in database')
  })
}

const createPlayersTable = () => {
  pool.query('CREATE TABLE players (id integer NOT NULL, name text NOT NULL, wins integer NOT NULL, losses integer NOT NULL, rating decimal NOT NULL, percent decimal NOT NULL, played integer NOT NULL, peak decimal NOT NULL)', (err) => {
    if(err) throw err
    console.log('players table created in database')
  })
}

const createDeck = (faction, agenda) => {
  if(!(decks[faction])){
    decks[faction] = {
      [agenda]: {
        wins: 0,
        losses: 0
      }
    }
  }
  else{
    decks[faction][agenda] = {
      wins: 0,
      losses: 0
    }
  }
  createDecksArray.push((callback) => {
    pool.query('INSERT INTO decks (faction, agenda, wins, losses) VALUES ($1, $2, $3, $4)', [faction, agenda, 0, 0], (err) => {
      if(err) throw err
    })
    callback()
  })
}

const createMatchup = (faction, agenda, oppfaction, oppagenda) => {
  if(!(matchups[faction])){
    matchups[faction] = {
      [agenda]: {
        [oppfaction]: {
          [oppagenda]: {
            wins: 0,
            losses: 0
          }
        }
      }
    }
  }
  else if(!(matchups[faction][agenda])){
    matchups[faction][agenda] = {
      [oppfaction]: {
        [oppagenda]: {
          wins: 0,
          losses: 0
        }
      }
    }
  }
  else if(!(matchups[faction][agenda][oppfaction])){
    matchups[faction][agenda][oppfaction] = {
      [oppagenda]: {
        wins: 0,
        losses: 0
      }
    }
  }
  else{
    matchups[faction][agenda][oppfaction][oppagenda] = {
      wins: 0,
      losses: 0
    }
  }
  createMatchupsArray.push((callback) => {
    pool.query('INSERT INTO matchups (faction, agenda, oppfaction, oppagenda, wins, losses) VALUES ($1, $2, $3, $4, $5, $6)', [faction, agenda, oppfaction, oppagenda, 0, 0], (err) => {
      if(err) throw err
    })
    callback()
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
    played: 0,
    peak: 1200
  }
  createPlayersArray.push((callback) => {
    pool.query('INSERT INTO players (id, name, rating, wins, losses, percent, played, peak) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [id, name, 1200, 0, 0, 0, 0, 1200], (err, data) => {
      if(err) throw err
    })
    callback()
  })
}

const updateAllDecks = () => {
  for(let faction in decksToUpdate){
    for(let agenda in decksToUpdate[faction]){
      updateDecksArray.push((callback) => {
        pool.query('UPDATE decks SET wins = $1, losses = $2 WHERE faction = $3 AND agenda = $4', [decks[faction][agenda].wins, decks[faction][agenda].losses, faction, agenda], (err) => {
          if(err) throw err
        })
        callback()
      })
    }
  }
  decksToUpdate = {}
}

const updateAllMatchups = () => {
  for(let faction in matchupsToUpdate){
    for(let agenda in matchupsToUpdate[faction]){
      for(let oppfaction in matchupsToUpdate[faction][agenda]){
        for(let oppagenda in matchupsToUpdate[faction][agenda][oppfaction]){
          updateMatchupsArray.push((callback) => {
            pool.query('UPDATE matchups SET wins = $1, losses = $2 WHERE faction = $3 AND agenda = $4 AND oppfaction = $5 AND oppagenda = $6', [matchups[faction][agenda][oppfaction][oppagenda].wins, matchups[faction][agenda][oppfaction][oppagenda].losses, faction, agenda, oppfaction, oppagenda], (err) => {
              if(err) throw err
            })
            callback()
          })
        }
      }
    }
  }
  matchupsToUpdate = {}
}

const updateAllPlayers = () => {
  playersToUpdate.forEach((id) => {
    updatePlayersArray.push((callback) => {
      let wins = players[id].wins
      let losses = players[id].losses
      pool.query('UPDATE players SET wins = $1, losses = $2, rating = $3, percent = $5, played = $6, peak = $7 WHERE id = $4', [wins, losses, players[id].rating, id, wins / (wins + losses), wins + losses, players[id].peak], (err, data) => {
        if(err) throw err
      })
      callback()
    })
  })
  playersToUpdate = []
}

const refresh = () => {
  const time = 1000 * 60 * 60 * 24 // 1 day
  setTimeout(() => {
    console.log(new Date().toUTCString() + ' checking thejoustingpavilion')
    checkTJP()
    refresh()
  }, time)
}

const checkTJP = () => {
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
        checkTJP()
      }
      else{
        length = games.length
        newGames.forEach((game) => {
          testGame(game)
        })
        newGames.forEach((game) => {
          processGame(game)
        })
        newGames = []
        console.log(new Date().toUTCString() + ' finished checking')
        updateAllPlayers()
        updateAllMatchups()
        updateAllDecks()
        const asyncCreatePlayers = (callback) => {
          async.series(createPlayersArray, callback)
        }
        const asyncCreateMatchups = (callback) => {
          async.series(createMatchupsArray, callback)
        }
        const asyncCreateDecks = (callback) => {
          async.series(createDecksArray, callback)
        }
        const asyncUpdatePlayers = (callback) => {
          async.series(updatePlayersArray, callback)
        }
        const asyncCreateGames = (callback) => {
          async.series(createGamesArray, callback)
        }
        const asyncUpdatePosition = (callback) => {
          pool.query('UPDATE position SET page = $1, length = $2', [page, length], (err) => {
            if(err) throw err
            console.log('updated position')
          })
          callback()
        }
        const asyncUpdateMatchups = (callback) => {
          async.series(updateMatchupsArray, callback)
        }
        const asyncUpdateDecks = (callback) => {
          async.series(updateDecksArray, callback)
        }
        async.series([
          asyncCreatePlayers,
          asyncCreateMatchups,
          asyncCreateDecks,
          asyncCreateGames
        ])
        setTimeout(() => {
          async.series([
            asyncUpdatePlayers,
            asyncUpdateDecks,
            asyncUpdateMatchups,
            asyncUpdatePosition
          ])
        }, 1000 * 60 * 1)
      }
    }
  })
}

const checkGameDecksAndMatchups = (faction, agenda, oppfaction, oppagenda) => {
  if(!(decks[faction]) || !(decks[faction][agenda])){
    createDeck(faction, agenda)
  }

  if(!(decks[oppfaction]) || !(decks[oppfaction][oppagenda])){
    createDeck(oppfaction, oppagenda)
  }
  if(faction === oppfaction && agenda === oppagenda){
    return
  }
  if(!(matchups[faction]) || !(matchups[faction][agenda]) || !(matchups[faction][agenda][oppfaction]) || !(matchups[faction][agenda][oppfaction][oppagenda])){
    createMatchup(faction, agenda, oppfaction, oppagenda)
  }
  if(!(matchups[oppfaction]) || !(matchups[oppfaction][oppagenda]) || !(matchups[oppfaction][oppagenda][faction]) || !(matchups[oppfaction][oppagenda][faction][agenda])){
    createMatchup(oppfaction, oppagenda, faction, agenda)
  }
}

const checkUpdateDecksAndMatchups = (faction, agenda, oppfaction, oppagenda) => {
  if(!(decksToUpdate[faction])){
    decksToUpdate[faction] = {
      [agenda]: {
        wins: 0,
        losses: 0
      }
    }
  }
  else if(!(decksToUpdate[faction][agenda])){
    decksToUpdate[faction][agenda] = {
      wins: 0,
      losses: 0
    }
  }
  if(!(decksToUpdate[oppfaction])){
    decksToUpdate[oppfaction] = {
      [oppagenda]: {
        wins: 0,
        losses: 0
      }
    }
  }
  else if(!(decksToUpdate[oppfaction][oppagenda])){
    decksToUpdate[oppfaction][oppagenda] = {
      wins: 0,
      losses: 0
    }
  }
  if(!(matchupsToUpdate[faction])){
    matchupsToUpdate[faction] = {
      [agenda]: {
        [oppfaction]: {
          [oppagenda]: {
            wins: 0,
            losses: 0
          }
        }
      }
    }
  }
  else if(!(matchupsToUpdate[faction][agenda])){
    matchupsToUpdate[faction][agenda] = {
      [oppfaction]: {
        [oppagenda]: {
          wins: 0,
          losses: 0
        }
      }
    }
  }
  else if(!(matchupsToUpdate[faction][agenda][oppfaction])){
    matchupsToUpdate[faction][agenda][oppfaction] = {
      [oppagenda]: {
        wins: 0,
        losses: 0
      }
    }
  }
  else if(!(matchupsToUpdate[faction][agenda][oppfaction][oppagenda])){
    matchupsToUpdate[faction][agenda][oppfaction][oppagenda] = {
      wins: 0,
      losses: 0
    }
  }
  if(!(matchupsToUpdate[oppfaction])){
    matchupsToUpdate[oppfaction] = {
      [oppagenda]: {
        [faction]: {
          [agenda]: {
            wins: 0,
            losses: 0
          }
        }
      }
    }
  }
  else if(!(matchupsToUpdate[oppfaction][oppagenda])){
    matchupsToUpdate[oppfaction][oppagenda] = {
      [faction]: {
        [agenda]: {
          wins: 0,
          losses: 0
        }
      }
    }
  }
  else if(!(matchupsToUpdate[oppfaction][oppagenda][faction])){
    matchupsToUpdate[oppfaction][oppagenda][faction] = {
      [agenda]: {
        wins: 0,
        losses: 0
      }
    }
  }
  else if(!(matchupsToUpdate[oppfaction][oppagenda][faction][agenda])){
    matchupsToUpdate[oppfaction][oppagenda][faction][agenda] = {
      wins: 0,
      losses: 0
    }
  }
}

const processGameDecksAndMatchups = (faction, agenda, oppfaction, oppagenda) => {
  if(faction === oppfaction && agenda === oppagenda){
    return
  }
  checkUpdateDecksAndMatchups(faction, agenda, oppfaction, oppagenda)
  if(!(decksToUpdate[faction][agenda])){
    if(!(decksToUpdate[faction])){
      decksToUpdate[faction] = {
        [agenda]: {}
      }
    }
    else{
      decksToUpdate[faction][agenda] = {}
    }
  }
  if(!(decksToUpdate[oppfaction][oppagenda])){
    if(!(decksToUpdate[oppfaction])){
      decksToUpdate[oppfaction] = {
        [oppagenda]: {}
      }
    }
    else{
      decksToUpdate[oppfaction][oppagenda] = {}
    }
  }
  if(!(matchupsToUpdate[faction][agenda][oppfaction][oppagenda])){
    if(!(matchupsToUpdate[faction][agenda][oppfaction])){
      if(!(matchupsToUpdate[faction][agenda])){
        if(!(matchupsToUpdate[faction])){
          matchupsToUpdate[faction] = {
            [agenda]: {
              [oppfaction]: {
                [oppagenda]: {}
              }
            }
          }
        }
        else{
          matchupsToUpdate[faction][agenda] = {
            [oppfaction]: {
              [oppagenda]: {}
            }
          }
        }
      }
      else{
        matchupsToUpdate[faction][agenda][oppfaction] = {
          [oppagenda]: {}
        }
      }
    }
    else{
      matchupsToUpdate[faction][agenda][oppfaction][oppagenda] = {}
    }
  }
  if(!(matchupsToUpdate[oppfaction][oppagenda][faction][agenda])){
    if(!(matchupsToUpdate[oppfaction][oppagenda][faction])){
      if(!(matchupsToUpdate[oppfaction][oppagenda])){
        if(!(matchupsToUpdate[oppfaction])){
          matchupsToUpdate[oppfaction] = {
            [oppagenda]: {
              [faction]: {
                [agenda]: {}
              }
            }
          }
        }
        else{
          matchupsToUpdate[oppfaction][oppagenda] = {
            [faction]: {
              [agenda]: {}
            }
          }
        }
      }
      else{
        matchupsToUpdate[oppfaction][oppagenda][faction] = {
          [agenda]: {}
        }
      }
    }
    else{
      matchupsToUpdate[oppfaction][oppagenda][faction][agenda] = {}
    }
  }
  decks[faction][agenda].wins++
  decks[oppfaction][oppagenda].losses++
  matchups[faction][agenda][oppfaction][oppagenda].wins++
  matchups[oppfaction][oppagenda][faction][agenda].losses++
}

const processGamePlayers = (winner, loser) => {
  let qW = Math.pow(10, (players[winner].rating / 400))
  let qL = Math.pow(10, (players[loser].rating / 400))
  let eW = qW / (qW + qL)
  let eL = qL / (qW + qL)
  let k = 40
  players[winner].rating += k * (1 - eW)
  players[loser].rating += k * (0 - eL)
  if(players[winner].rating > players[winner].peak){
    players[winner].peak = players[winner].rating
  }
  players[winner].wins++
  players[loser].losses++
  if(!(playersToUpdate.includes(winner))){
    playersToUpdate.push(winner)
  }
  if(!(playersToUpdate.includes(loser))){
    playersToUpdate.push(loser)
  }
}

const processGame = (game) => {
  if(tournamentsToExclude.includes(game.tournament_id)){
    return
  }
  if(game.p1_id < 1 || game.p2_id < 1 || (game.p1_name.toLowerCase().includes('bye')) || game.p2_name.toLowerCase().includes('bye') || game.p1_name.toLowerCase().includes('dummy') || game.p2_name.toLowerCase().includes('dummy')){
    return
  }
  if(game.game_status != 100){
    pool.query('INSERT INTO incomplete (game_id, tournament_id, tournament_date) VALUES ($1, $2, $3)', [game.game_id, game.tournament_id, game.tournament_date], (err, data) => {
      if(err) throw err
      console.log('incomplete game: ' + game.game_id)
    })
    return
  }
  let winner = {}
  let loser = {}
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
  processGamePlayers(winner.id, loser.id)
  if(game.p1_faction && game.p1_agenda && game.p2_faction && game.p2_agenda){
    checkGameDecksAndMatchups(winner.faction, winner.agenda, loser.faction, loser.agenda)
    processGameDecksAndMatchups(winner.faction, winner.agenda, loser.faction, loser.agenda)
  }
  createGamesArray.push((callback) => {
    pool.query('INSERT INTO games (winner_id, loser_id, winner_faction, winner_agenda, loser_faction, loser_agenda, tournament_date, tournament_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', [winner.id, loser.id, winner.faction, winner.agenda, loser.faction, loser.agenda, game.tournament_date, game.tournament_id], (err) => {
      if(err) throw err
    })
    callback()
  })
}

const testGame = (game) => {
  let t_name = game.tournament_name.toLowerCase()
  if(t_name.includes('keyforge') || t_name.includes('draft') || t_name.includes('destiny') || t_name.includes('l5r')){
    tournamentsToExclude.push(game.tournament_id)
  }
  else if(game.p1_agenda == 'The Power of Wealth' || game.p1_agenda == "Treaty" || game.p1_agenda == 'Uniting the Seven Kingdoms' || game.p1_agenda == 'Protectors of the Realm' || game.p2_agenda == 'The Power of Wealth' || game.p2_agenda == "Treaty" || game.p2_agenda == 'Uniting the Seven Kingdoms' || game.p2_agenda == 'Protectors of the Realm'){
    tournamentsToExclude.push(game.tournament_id)
  }
}
