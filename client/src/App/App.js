import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import './App.css';

import Home from './pages/Home';
import Players from './pages/Players'
import Decks from './pages/Decks'
import Tournaments from './pages/Tournaments'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

class App extends Component {
  render() {
    const App = () => (
      <div id='app-wrapper'>
        <div id='content-wrapper'>
          <Navbar/>
          <Switch>
            <Route exact path='/' component={Home}/>
            <Route path='/players' component={Players}/>
            <Route path='/decks' component={Decks}/>
            <Route path='/tournaments' component={Tournaments}/>
          </Switch>
        </div>
        <Footer/>
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
