import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Leaderboard from './components/Leaderboard';
import PlayerStats from './components/PlayerStats';
import MatchReplay from './components/MatchReplay';
import './App.css';
import { FaDiscord, FaGithub, FaTrophy, FaChartBar, FaPlay } from 'react-icons/fa';

const App = () => (
  <Router>
    <div className="App">
      <header className="App-header">
        <h1>AU++</h1>
        <p className="subtitle">The Ultimate Among Us Competitive Platform</p>
        <nav>
          <ul>
            <li><Link to="/"><FaPlay /> Home</Link></li>
            <li><Link to="/leaderboard"><FaTrophy /> Leaderboard</Link></li>
            <li><Link to="/match-replay"><FaChartBar /> Match Replay</Link></li>
          </ul>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/player/:season/:playerName" element={<PlayerStats />} />
          <Route path="/match-replay" element={<MatchReplay />} />
        </Routes>
      </main>
    </div>
  </Router>
);

const Home = () => (
  <div className="Home">
    <h2>Welcome to AU++</h2>
    <p>Elevate your Among Us experience with competitive play!</p>
    
    <div className="features">
      <h3>Features:</h3>
      <ul>
        <li>🏆 Competitive Leaderboard</li>
        <li>📊 Detailed Player Statistics</li>
        <li>🎬 Match Replay System</li>
        <li>🌟 Seasonal Rankings</li>
      </ul>
    </div>
    
    <div className="links">
      <h3>Quick Links:</h3>
      <ul>
        <li><Link to="/leaderboard">🏅 View Leaderboard</Link></li>
        <li><Link to="/match-replay">🎥 Watch Match Replays</Link></li>
      </ul>
    </div>
    
    <div className="social">
      <h3>Connect with Us:</h3>
      <p><FaDiscord /> <a href="https://discord.gg/aupp" target="_blank" rel="noopener noreferrer">Join our Discord</a></p>
      <p><FaGithub /> <a href="https://github.com/ABraik-bit" target="_blank" rel="noopener noreferrer">Follow on GitHub</a></p>
    </div>
  </div>
);

export default App;
