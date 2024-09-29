import React, { useState, useEffect, useRef } from 'react';
import './MatchReplay.css';
import * as d3 from 'd3';
import { FaPlay, FaPause, FaFastForward, FaFastBackward } from 'react-icons/fa';

const MAP_IMAGE = '/images/polus.jpg';
const PLAYER_IMAGE_BASE = '/images/players/';
const DEAD_PLAYER_IMAGE_BASE = '/images/deadPlayers/';
const KNIFE_IMAGE = '/images/events/knife.png';
const VENT_IMAGE = '/images/events/vent.png';
const REPORT_IMAGE = '/images/events/report.png';

const MatchReplay = () => {
    const [movements, setMovements] = useState([]);
    const [matchData, setMatchData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playSpeed, setPlaySpeed] = useState(100);
    const [matchId, setMatchId] = useState('');
    const [currentEventIndex, setCurrentEventIndex] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [eventIcons, setEventIcons] = useState({});

    const svgRef = useRef();
    const playerIcons = useRef({});
    const playerNames = useRef({});
    const playAnimationRef = useRef(null);
    const currentEventIndexRef = useRef(0);
    const lastEventTimeRef = useRef(0);

    const fetchMovements = async (matchId) => {
        try {
            const res = await fetch(`/api/match/${matchId}/movements/`);
            const data = await res.json();
            console.log('Movements Data:', data);
            setMovements(data);
        } catch (error) {
            console.error('Error loading movements:', error);
        }
    };

    const fetchMatchData = async (matchId) => {
        try {
            const res = await fetch(`/api/match/${matchId}/data/`);
            const data = await res.json();
            console.log('Match Data:', data);
            setMatchData(data);
        } catch (error) {
            console.error('Error loading match data:', error);
        }
    };

    const renderMap = () => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.append('image')
            .attr('xlink:href', MAP_IMAGE)
            .attr('width', 800)
            .attr('height', 600)
            .attr('class', 'map-image');

        console.log('Map rendered');
    };

    const removePlayer = (Player) => {
        if (playerIcons.current[Player]) {
            const playerColor = playerIcons.current[Player].attr('data-color');
            const deadBodyIcon = `${DEAD_PLAYER_IMAGE_BASE}${playerColor}_dead.png`;
            
            playerIcons.current[Player]
                .attr('xlink:href', deadBodyIcon)
                .attr('width', 30)
                .attr('height', 30);

            playerNames.current[Player].remove();
            delete playerNames.current[Player];
            
            console.log(`Player ${Player} changed to dead body`);
        }
    };

    const updatePlayerPositions = (movementEvent) => {
        if (!matchData) {
            console.log('Match data not loaded yet');
            return;
        }

        const { Player, Location, Event } = movementEvent;
        if (Event === 'Death') {
            removePlayer(Player);
            return;
        }

        if (!Player || !Location) {
            console.log('Skipping invalid movement event:', movementEvent);
            return;
        }

        const [x, y] = Location.split(',').map(Number);
        if (isNaN(x) || isNaN(y)) {
            console.log('Invalid coordinates for player:', Player, 'Location:', Location);
            return;
        }

        const playerColorMap = {};
        const players = matchData.Players.split(',').map((player) => player.trim());
        const colors = matchData.Colors.split(',').map((color) => color.trim());

        players.forEach((player, index) => {
            playerColorMap[player] = colors[index];
        });

        const playerColor = playerColorMap[Player.trim()];
        if (!playerColor) {
            console.log(`No color found for player: ${Player}`);
            return;
        }

        const playerIcon = `${PLAYER_IMAGE_BASE}${playerColor}_crewmate.png`;
        console.log(`Player: ${Player}, Color: ${playerColor}, Icon: ${playerIcon}, Position: (${x}, ${y})`);

        const svg = d3.select(svgRef.current);

        if (!playerIcons.current[Player]) {
            console.log(`Creating player icon for ${Player}`);
            playerIcons.current[Player] = svg.append('image')
                .attr('xlink:href', playerIcon)
                .attr('width', 20)
                .attr('height', 20)
                .attr('x', mapXToCanvas(x))
                .attr('y', mapYToCanvas(y))
                .attr('class', 'player-icon')
                .attr('data-color', playerColor);

            playerNames.current[Player] = svg.append('text')
                .attr('x', mapXToCanvas(x) + 10)
                .attr('y', mapYToCanvas(y) + 30)
                .attr('fill', playerColor)
                .attr('font-size', '12px')
                .attr('text-anchor', 'middle')
                .text(Player);
        } else {
            console.log(`Updating position for player ${Player}`);
            playerIcons.current[Player]
                .transition()
                .duration(playSpeed - 20)
                .attr('x', mapXToCanvas(x))
                .attr('y', mapYToCanvas(y));

            playerNames.current[Player]
                .transition()
                .duration(playSpeed - 20)
                .attr('x', mapXToCanvas(x) + 10)
                .attr('y', mapYToCanvas(y) + 30);
        }
    };

    const mapXToCanvas = (x) => {
        const xLeftBorder = 0;
        const xRightBorder = 0;
        const mapWidth = 800;
        const leftX = 0;
        const rightX = 42.00;

        const mappedX = ((x - (leftX + xLeftBorder)) / (rightX - xRightBorder - leftX - xLeftBorder)) * mapWidth;

        console.log(`Mapping X: ${x} to Canvas X: ${mappedX}`);
        return mappedX;
    };

    const mapYToCanvas = (y) => {
        const yTopBorder = 0;
        const yBottomBorder = 0;
        const mapHeight = 600;
        const topY = 3;
        const bottomY = -28.0;

        const mappedY = ((topY + yTopBorder - y) / (topY + yTopBorder - (bottomY - yBottomBorder))) * mapHeight;

        console.log(`Mapping Y: ${y} to Canvas Y: ${mappedY}`);
        return mappedY;
    };

    const handleSpeedChange = (speed) => {
        setPlaybackSpeed(speed);
        setPlaySpeed(100 / speed);
    };

    const displayEventIcon = (event, x, y) => {
        const svg = d3.select(svgRef.current);
        let iconImage;
        
        switch (event) {
            case 'Death':
                iconImage = KNIFE_IMAGE;
                break;
            case 'Vent':
                iconImage = VENT_IMAGE;
                break;
            case 'Report':
                iconImage = REPORT_IMAGE;
                break;
            default:
                console.log('Unknown event for icon display:', event);
                return;
        }
        
        const icon = svg.append('image')
            .attr('xlink:href', iconImage)
            .attr('x', x - 15)
            .attr('y', y - 15)
            .attr('width', 30)
            .attr('height', 30)
            .attr('class', 'event-icon');

        setEventIcons(prev => ({...prev, [event]: icon}));

        setTimeout(() => {
            icon.remove();
            setEventIcons(prev => {
                const newIcons = {...prev};
                delete newIcons[event];
                return newIcons;
            });
        }, 3000);
    };

    const playMatch = () => {
        const eventIndex = currentEventIndexRef.current;

        if (eventIndex >= movements.length) {
            cancelAnimationFrame(playAnimationRef.current);
            setIsPlaying(false);
            return;
        }

        const currentEvent = movements[eventIndex];
        const currentTime = Date.now();
        const timeSinceLastEvent = currentTime - lastEventTimeRef.current;

        if (timeSinceLastEvent < (currentEvent.TimeSinceStart - (movements[eventIndex - 1]?.TimeSinceStart || 0))) {
            playAnimationRef.current = requestAnimationFrame(playMatch);
            return;
        }

        console.log(`Current Event Index: ${eventIndex}`, currentEvent);

        switch (currentEvent.Event) {
            case 'Movement':
                updatePlayerPositions(currentEvent);
                break;
            case 'StartGame':
                if (!gameStarted) setGameStarted(true);
                break;
            case 'Death':
                removePlayer(currentEvent.Player);
                displayEventIcon('Death', mapXToCanvas(currentEvent.Location.split(',')[0]), mapYToCanvas(currentEvent.Location.split(',')[1]));
                break;
            case 'Vent':
                displayEventIcon('Vent', mapXToCanvas(currentEvent.Location.split(',')[0]), mapYToCanvas(currentEvent.Location.split(',')[1]));
                break;
            case 'Report':
                displayEventIcon('Report', mapXToCanvas(currentEvent.Location.split(',')[0]), mapYToCanvas(currentEvent.Location.split(',')[1]));
                break;
            case 'MeetingStart':
            case 'MeetingEnd':
                // Handle meeting events if needed
                break;
            default:
                console.log('Unhandled event:', currentEvent);
        }

        currentEventIndexRef.current += 1;
        setCurrentEventIndex(currentEventIndexRef.current);
        lastEventTimeRef.current = currentTime;

        playAnimationRef.current = requestAnimationFrame(playMatch);
    };
    
    const handleMatchSubmit = (e) => {
        e.preventDefault();
        if (matchId) {
            setMovements([]);
            setMatchData(null);
            setCurrentEventIndex(0);
            currentEventIndexRef.current = 0;
            setIsPlaying(false);
            setGameStarted(false);
            playerIcons.current = {};
            playerNames.current = {};

            console.log(`Fetching data for match ID: ${matchId}`);
            fetchMatchData(matchId);
            fetchMovements(matchId);
        }
    };

    const handlePlay = () => {
        if (!isPlaying) {
            playAnimationRef.current = requestAnimationFrame(playMatch);
        } else {
            cancelAnimationFrame(playAnimationRef.current);
        }
        setIsPlaying(!isPlaying);
    };

    const updateSvgViewBox = () => {
        const svg = d3.select(svgRef.current);
        const container = svg.node().parentNode;
        const width = container.clientWidth;
        const height = width * (600 / 800); // Maintain aspect ratio
        svg.attr('viewBox', `0 0 800 600`)
           .attr('width', width)
           .attr('height', height);
    };

    useEffect(() => {
        if (matchData) {
            renderMap();
            lastEventTimeRef.current = Date.now();
        }
    }, [matchData]);

    useEffect(() => {
        updateSvgViewBox();
        window.addEventListener('resize', updateSvgViewBox);
        return () => window.removeEventListener('resize', updateSvgViewBox);
    }, []);

    return (
        <div className="match-replay-container">
            <h1>Match Replay</h1>

            <form onSubmit={handleMatchSubmit} className="match-selector">
                <label htmlFor="matchId">Enter Match ID:</label>
                <input
                    type="number"
                    id="matchId"
                    value={matchId}
                    onChange={(e) => setMatchId(e.target.value)}
                    placeholder="Enter match ID"
                    required
                />
                <button type="submit">Load Match</button>
            </form>

            <div className="map-container">
                <svg ref={svgRef} width="800" height="600" />
            </div>

            <div className="video-controls">
                <button onClick={() => handleSpeedChange(0.5)} disabled={playbackSpeed === 0.5}>
                    <FaFastBackward />
                </button>
                <button onClick={handlePlay}>
                    {isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button onClick={() => handleSpeedChange(2)} disabled={playbackSpeed === 2}>
                    <FaFastForward />
                </button>
                <span>Speed: {playbackSpeed}x</span>
            </div>

            <div className="progress-bar">
                <input
                    type="range"
                    min="0"
                    max={movements.length - 1}
                    value={currentEventIndex}
                    onChange={(e) => {
                        const newIndex = parseInt(e.target.value, 10);
                        currentEventIndexRef.current = newIndex;
                        setCurrentEventIndex(newIndex);
                    }}
                />
            </div>
        </div>
    );
};

export default MatchReplay;