import React from 'react'
import { Route, Link } from 'react-router-dom'

import Top5Faction from '../components/Decks/Top5Faction'
import FactionDetailed from '../components/Decks/FactionDetailed'
import SpecificDeck from '../components/Decks/SpecificDeck'

class Decks extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      decks: {},
      deckRows: []
    }
  }
  async componentDidMount(){
    const res = await fetch('/api/decks')
    const data = await res.json()
    let decks = {}
    data.forEach((deck) => {
      if(!(decks[deck.faction])){
        decks[deck.faction] = {
          [deck.agenda]: {
            wins: deck.wins,
            losses: deck.losses
          }
        }
      }
      else if(!(decks[deck.faction][deck.agenda])){
        decks[deck.faction][deck.agenda] = {
          wins: deck.wins,
          losses: deck.losses
        }
      }
    })
    this.setState({
      deckRows: data,
      decks: decks
    })
  }
  render(){
    let list = []
    for(let faction in this.state.decks){
      list.push(
        <Top5Faction faction={faction} decks={this.state.decks}/>
      )
    }
    return(
      <div className='inline-wrapper'>
        <h1>Decks</h1>
        <Route exact path='/decks' render={() => list}/>
        <Route exact path='/decks/:faction' render={({ match }) => <FactionDetailed match={match} decks={this.state.decks}/>}/>
        <Route path='/decks/:faction/:agenda' render={({ match }) => <SpecificDeck match={match} decks={this.state.decks}/>}/>
      </div>
    )
  }
}

export default Decks
