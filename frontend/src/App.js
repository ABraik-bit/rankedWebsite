import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Leaderboard from './components/Leaderboard';
import PlayerStats from './components/PlayerStats';  // Update this line
import MatchReplay from './components/MatchReplay';
import './App.css'; // Make sure to create and import the CSS file

const App = () => (
  <Router>
      <div className="App">
          <header className="App-header">
              <h1>Welcome to Among Us Leaderboard</h1>
              <nav>
                  <ul>
                      <li><Link to="/">Home</Link></li>
                      <li><Link to="/leaderboard">Leaderboard</Link></li>
                      <li><Link to="/match-replay">Match Replay</Link></li> {/* Add Match Replay Link */}
                  </ul>
              </nav>
          </header>
          <main>
              <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/player/:season/:playerName" element={<PlayerStats />} />
                  <Route path="/match-replay" element={<MatchReplay />} /> {/* Add the route */}
              </Routes>
          </main>
      </div>
  </Router>
);


const Home = () => (
    <div className="Home">
        <h2>Home Page</h2>
        <p>Sup you sussy beans</p>
    </div>
);

export default App;
