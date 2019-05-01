import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class Home extends Component {
  render() {
    return (
    <div className="App">
      <h1>Welcome To "Name Forthcoming"</h1>
      <div>
        <p>"Name Forthcoming" collects data from <a target='_blank' href='https://thejoustingpavilion.com/'>The Jousting Pavilion</a>, which is a
        tournament interface for the A Game of Thrones LCG 2nd Edition, and ranks players based on the ELO algorithm (with a k = 40 for the statistic nerds who care). It also has basic
        deck tracking capabilities, with more features coming soon. For a list of planned upgrades, please see our <Link to='/faq'>FAQ</Link></p>
        <p>"Name Forthcoming" is in no way affiliated with Fantasy Flight Games (FFG) or The Jousting Pavilion (except for taking their data, permission pending)</p>
      </div>
    </div>
    );
  }
}
export default Home;
