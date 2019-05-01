import React from 'react'
import { Link } from 'react-router-dom'

export default class extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      //
    }
  }
  async componentDidMount(){

  }
  render(){
    let list = []
    return(
      <div>
        <h2>{this.props.match.params.faction}</h2>
        <table>
          <thead>
            <tr>
              <th>Agenda</th>
              <th>Win Percent</th>
              <th>Games Played</th>
            </tr>
          </thead>
          <tbody>
            {list}
          </tbody>
        </table>
      </div>
    )
  }
}
