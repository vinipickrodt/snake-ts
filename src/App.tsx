import * as React from 'react';
import './App.css';
import { SnakeGame } from './Snake';

const logo = require('./logo.svg');

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Snake Game</h1>
        </header>
        <br />
        <div>
          <SnakeGame canvasSize={30} />
        </div>
      </div>
    );
  }
}

export default App;
