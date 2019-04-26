import React from 'react'

export default class extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      //
    }
  }
  render(){
    let rows = []
    let decks = {}
    if(this.props.games.length){
      this.props.games.forEach((game) => {
        if(game.winner_id === this.props.id){
          //
        }
        else{
          //
        }
      })
    }
    return(
      <div className='wrapper'>
        <table>
          <thead>
            <tr>
              <th>Faction</th>
              <th>Agenda</th>
              <th>Win Percent</th>
              <th>Games Played</th>
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
