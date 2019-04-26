import React from 'react'
import Decks from './PlayerSpecificDecks.js'
import Opponents from './PlayerSpecificOpponents.js'

class Playerspecific extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      player: {},
      games: []
    }
  }
  async componentDidMount(){
    const res = await fetch(`/api/players/${this.props.match.params.id}`)
    const data = await res.json()
    this.setState({
      player: data[0]
    })
    const res2 = await fetch(`/api/games/players/${this.props.match.params.id}`)
    const data2 = await res2.json()
    this.setState({
      games: data2
    })
  }
  render(){
    return(
      <div>
        <p>Name: {this.state.player.name}</p>
        <p>Rating: {Math.round(this.state.player.rating)}</p>
        <p>Highest Rating Achieved: {Math.round(this.state.player.peak)}</p>
        <p>Games Played: {this.state.player.played}</p>
        <p>Win Percent: {(this.state.player.percent * 100).toFixed(1)}</p>
        <Decks games={this.state.games} id={this.state.player.id}/>
        <Opponents/>
      </div>
    )
  }
}

export default Playerspecific
