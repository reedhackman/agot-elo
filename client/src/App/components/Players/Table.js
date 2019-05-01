import React from 'react'
import { Link } from 'react-router-dom'

export default class extends React.Component{
  render(){
    let data = this.props.state.playerlist
    let rows = []
    let list = []
    let nav = (
      <div className='navbuttons'>
        <button onClick={this.props.handlers.first}>First</button>
        <button onClick={this.props.handlers.prev}>Prev</button>
        <span>Page {this.props.state.page} of {this.props.state.last}</span>
        <button onClick={this.props.handlers.next}>Next</button>
        <button onClick={this.props.handlers.last}>Last</button>
      </div>
    )
    let minbox = (
      <div className='minbox'>
        <input
          type='number'
          value={this.props.state.mingames}
          onChange={this.props.handlers.mingames}
        />
      </div>
    )
    let search = (
      <div className='searchbox'>
          <input
            type='text'
            placeholder='Search By Player Name...'
            value={this.props.state.input}
            onChange={this.props.handlers.search}
            change='input'
          />
      </div>
    )
    data.sort((a, b) => {
      if(this.props.state.ascending === true){
        if(this.props.state.sortby === 'name'){
          if(a[this.props.state.sortby] > b[this.props.state.sortby]){
            return 1
          }
          if(b[this.props.state.sortby] > a[this.props.state.sortby]){
            return -1
          }
          return 0
        }
        return b[this.props.state.sortby] - a[this.props.state.sortby]
      }
      if(this.props.state.sortby === 'name'){
        if(a[this.props.state.sortby] > b[this.props.state.sortby]){
          return -1
        }
        if(b[this.props.state.sortby] > a[this.props.state.sortby]){
          return 1
        }
        return 0
      }
      return a[this.props.state.sortby] - b[this.props.state.sortby]
    })
    data.forEach((player) => {
      if((player.name).toLowerCase().indexOf((this.props.state.input).toLowerCase()) !== -1 && player.played >= this.props.state.mingames){
        rows.push(player)
      }
    })
    let j = Math.max((this.props.state.page - 1) * 50, 0)
    let k = rows.length - j
    for(let i = 0; i < Math.min(k, 50); i++){
      let player = rows[j]
      list.push(
        <tr key={player.name} className='table-row'>
          <td className='tablename'><Link to={`/players/${player.id}`}>{player.name}</Link></td>
          <td className='tablerating'>{Math.round(player.rating)}</td>
          <td className='tablepercent'>{(player.percent * 100).toFixed(1)}</td>
          <td className='tableplayed'>{player.played}</td>
        </tr>
      )
      j++
    }
    return(
      <div>
        {search}
        {minbox}
        <table>
          <thead>
            <tr>
              <th className='tablename'><button onClick={this.props.handlers.sortby} value='name'>Name</button></th>
              <th className='tablerating'><button onClick={this.props.handlers.sortby} value='rating'>Rating</button></th>
              <th className='tablepercent'><button onClick={this.props.handlers.sortby} value='percent'>Win Percent</button></th>
              <th className='tableplayed'><button onClick={this.props.handlers.sortby} value='played'>Games Played</button></th>
            </tr>
          </thead>
          <tbody>
            {list}
          </tbody>
        </table>
        {nav}
      </div>

    )
  }
}
