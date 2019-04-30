import React from 'react'
import { Link } from 'react-router-dom'

export default class extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      //
    }
  }
  render(){
    let id = this.props.id
    let opponents = {}
    let rows = []
    const addOpponent = (p_id) => {
      opponents[p_id] = {
        wins: 0,
        losses: 0
      }
    }
    this.props.games.forEach((game) => {
        if(id === game.winner_id){
          if(!(opponents[game.loser_id])){
            addOpponent(game.loser_id)
          }
          opponents[game.loser_id].wins++
        }
        else if(id === game.loser_id){
          if(!(opponents[game.winner_id])){
            addOpponent(game.winner_id)
          }
          opponents[game.winner_id].losses++
        }
        else{
          console.log('this is a bug')
        }
    })
    for(let p_id in opponents){
      let opponent = opponents[p_id]
      rows.push(
        <tr key={p_id}>
          <td><Link to={`/players/${p_id}`} onClick={this.props.updateId} value={p_id}>{this.props.players[p_id].name}</Link></td>
          <td>{(100 * opponent.wins / (opponent.wins + opponent.losses)).toFixed(1)}</td>
          <td>{opponent.wins + opponent.losses}</td>
          <td>{Math.round(this.props.players[p_id].rating)}</td>
        </tr>
      )
    }
    return(
      <div className='wrapper'>
        <h2>Opponents</h2>
        <table>
          <thead>
            <tr>
              <th>Opponent Name</th>
              <th>Win Percent</th>
              <th>Times Played</th>
              <th>Current Rating</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    )
  }
}
