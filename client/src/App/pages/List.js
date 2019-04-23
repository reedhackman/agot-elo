import React, { Component } from 'react';
import { Route, Link } from "react-router-dom"

class List extends Component {
  // Initialize the state
  constructor(props){
    super(props);
    this.state = {
      list: []
    }
  }

  // Fetch the list on first mount
  componentDidMount() {
    this.getList();
  }

  // Retrieves the list of items from the Express app
  getList = () => {
    fetch('/api/getList')
    .then(res => res.json())
    .then(list => this.setState({ list }))
  }

  render() {
    const { list } = this.state;

    return (
      <div className="App">
        <h1>List of Items</h1>
        {/* Check to see if any items are found*/}
        <Route exact path='/list' render={() => (
          <div>
            {list.length ? (
              <div>
                <Table list={list}/>
              </div>
            ) : (
              <div><p>try again</p></div>
            )}
          </div>
        )}/>
        <Route path='/list/:id' component={Id}/>
      </div>
    );
  }
}

const Table = (props) => (
  <div>
    {props.list.map((item) => {
      return(
        <div>
          {item}
        </div>
      );
      })}
  </div>
)

const Id = ({ match }) => (
  <div>
    {match.params.id}
  </div>
)

export default List;
