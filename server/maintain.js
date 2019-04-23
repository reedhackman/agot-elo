require('dotenv').config()
const { Client, Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
})

let page = 1
let length = 0

pool.query('SELECT * FROM position', (err, data) => {
  if(err){
    console.log('position table missing from database. creating now')
    createPositionTable()
  }
  else{
    page = data.rows[0].page
    length = data.rows[0].length
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
