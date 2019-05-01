import React from 'react'
import Decks from './SpecificDecks.js'
import Opponents from './SpecificOpponents.js'

export default class extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      games: [],
      id: this.props.match.params.id
    }
  }
  async componentDidMount(){
    const res = await fetch(`/api/games/players/${this.props.match.params.id}`)
    const data = await res.json()
    this.setState({
      games: data
    })
  }
  async componentDidUpdate(prevProps, prevState){
    if(prevState.id !== this.props.match.params.id){
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
      const res = await fetch(`/api/games/players/${this.props.match.params.id}`)
      const data = await res.json()
      this.setState({
        id: this.props.match.params.id,
        games: data
      })
    }
  }
  render(){
    let id = this.state.id
    console.log(this.props.players)
    if(this.props.players[id]){
      return(
        <div>
          <p>Name: {this.props.players[id].name}</p>
          <p>Rating: {Math.round(this.props.players[id].rating)}</p>
          <p>Highest Rating Achieved: {Math.round(this.props.players[id].peak)}</p>
          <p>Games Played: {this.props.players[id].played}</p>
          <p>Win Percent: {(this.props.players[id].percent * 100).toFixed(1)}</p>
          <Decks games={this.state.games} id={this.props.players[id].id}/>
          <Opponents games={this.state.games} id={this.props.players[id].id} players={this.props.players}/>
        </div>
      )
    }
    return(
      <div>
        <h1>LOADING</h1>
      </div>
    )
  }
}
