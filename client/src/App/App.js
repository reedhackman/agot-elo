import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Players from './pages/Players'
import Decks from './pages/Decks'
import Navbar from './components/Navbar'

class App extends Component {
  render() {
    const App = () => (
      <div>
        <Navbar/>
        <Switch>
          <Route exact path='/' component={Home}/>
          <Route path='/players' component={Players}/>
          <Route path='/decks' component={Decks}/>
        </Switch>
      </div>
    )
    return (
      <Switch>
        <App/>
      </Switch>
    );
  }
}

export default App;
