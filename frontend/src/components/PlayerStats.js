import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import './PlayerStats.css';
import { Radar, Line, PolarArea, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, RadialLinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, RadialLinearScale, BarElement);

const PlayerStats = () => {
    const { playerName, season } = useParams();
    const [playerStats, setPlayerStats] = useState(null);
    const [mmrData, setMmrData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlayerStats = async () => {
            try {
                const statsResponse = await fetch(`/api/player-stats/${season}/${playerName}/`);
                const mmrResponse = await fetch(`/api/player-matches/${season}/${playerName}/`);
                if (!statsResponse.ok || !mmrResponse.ok) {
                    throw new Error('Failed to fetch player data');
                }
                const playerData = await statsResponse.json();
                setPlayerStats(playerData);
                const mmrData = await mmrResponse.json();
                setMmrData(mmrData);
            } catch (error) {
                console.error('Error fetching player data:', error);
                setError('Failed to load player data. Please try again later.');
            }
        };

        fetchPlayerStats();
    }, [playerName, season]);

    const mmrChartData = useMemo(() => {
        if (!mmrData || mmrData.length === 0) return null;
        return {
            labels: mmrData.map((_, index) => index + 1),
            datasets: [
                {
                    label: 'Overall MMR',
                    data: mmrData.map(data => data.mmr),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                },
                {
                    label: 'Impostor MMR',
                    data: mmrData.map(data => data.impostorMmr),
                    borderColor: 'rgb(255, 99, 132)',
                    tension: 0.1
                },
                {
                    label: 'Crewmate MMR',
                    data: mmrData.map(data => data.crewmateMmr),
                    borderColor: 'rgb(54, 162, 235)',
                    tension: 0.1
                }
            ]
        };
    }, [mmrData]);

    const radarChartData = useMemo(() => {
        if (!playerStats) return null;
        return {
            labels: ['Win Rate', 'Survivability', 'Voting Accuracy', 'Critical Votes'],
            datasets: [
                {
                    label: 'Crewmate',
                    data: [
                        playerStats['Number Of Crewmate Games Won'] / playerStats['Number Of Crewmate Games Played'],
                        playerStats['Survivability (Crewmate)'],
                        playerStats['Voting Accuracy (Crewmate games)'],
                        1 - (playerStats['Voted Wrong on Crit'] / playerStats['Number Of Crewmate Games Played'])
                    ],
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgb(54, 162, 235)',
                    pointBackgroundColor: 'rgb(54, 162, 235)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(54, 162, 235)'
                },
                {
                    label: 'Impostor',
                    data: [
                        playerStats['Number Of Impostor Games Won'] / playerStats['Number Of Impostor Games Played'],
                        playerStats['Survivability (Impostor)'],
                        0, // No voting accuracy for Impostor
                        0  // No critical votes for Impostor
                    ],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgb(255, 99, 132)',
                    pointBackgroundColor: 'rgb(255, 99, 132)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(255, 99, 132)'
                }
            ]
        };
    }, [playerStats]);

    const polarAreaData = useMemo(() => {
        if (!playerStats) return null;
        return {
            labels: ['Crewmate Games', 'Impostor Games', 'Games Won', 'Games Lost'],
            datasets: [{
                data: [
                    playerStats['Number Of Crewmate Games Played'],
                    playerStats['Number Of Impostor Games Played'],
                    playerStats['Number Of Games Won'],
                    playerStats['Total Number Of Games Played'] - playerStats['Number Of Games Won']
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(255, 206, 86, 0.5)'
                ]
            }]
        };
    }, [playerStats]);

    const winRateChartData = useMemo(() => {
        if (!playerStats) return null;
        return {
            labels: ['Overall', 'Crewmate', 'Impostor'],
            datasets: [{
                label: 'Win Rate',
                data: [
                    (playerStats['Number Of Games Won'] / playerStats['Total Number Of Games Played']) * 100,
                    (playerStats['Number Of Crewmate Games Won'] / playerStats['Number Of Crewmate Games Played']) * 100,
                    (playerStats['Number Of Impostor Games Won'] / playerStats['Number Of Impostor Games Played']) * 100
                ],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ]
            }]
        };
    }, [playerStats]);

    const gameCountChartData = useMemo(() => {
        if (!playerStats) return null;
        return {
            labels: ['Crewmate Games', 'Impostor Games'],
            datasets: [{
                label: 'Game Count',
                data: [
                    playerStats['Number Of Crewmate Games Played'],
                    playerStats['Number Of Impostor Games Played']
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ]
            }]
        };
    }, [playerStats]);

    const commonChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
    };

    const mmrChartOptions = {
        ...commonChartOptions,
        scales: {
            x: {
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 20
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'MMR Progression'
            }
        }
    };

    const radarChartOptions = {
        ...commonChartOptions,
        scales: {
            r: {
                angleLines: {
                    display: false
                },
                suggestedMin: 0,
                suggestedMax: 1
            }
        }
    };

    const polarAreaOptions = {
        ...commonChartOptions,
        plugins: {
            legend: {
                position: 'right',
            }
        },
    };

    const winRateChartOptions = {
        ...commonChartOptions,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Win Rate (%)'
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Win Rates Comparison'
            }
        }
    };

    const gameCountChartOptions = {
        ...commonChartOptions,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Game Count by Role'
            }
        },
    };

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!playerStats || !mmrData) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="player-stats-container">
            <div className="player-stats-content">
                <h2>Player Stats for {playerName} - {season}</h2>
                {mmrChartData && (
                    <div className="chart-container mmr-chart">
                        <Line data={mmrChartData} options={mmrChartOptions} />
                    </div>
                )}
                <div className="stats-grid">
                    <div className="stat-item role-performance">
                        <h3>Role Performance</h3>
                        <div className="chart-wrapper">
                            <Radar data={radarChartData} options={radarChartOptions} />
                        </div>
                    </div>
                    <div className="stat-item game-distribution">
                        <h3>Game Distribution</h3>
                        <div className="chart-wrapper">
                            <PolarArea data={polarAreaData} options={polarAreaOptions} />
                        </div>
                    </div>
                    <div className="stat-item">
                        <h3>Win Rates</h3>
                        <div className="chart-wrapper">
                            <Bar data={winRateChartData} options={winRateChartOptions} />
                        </div>
                    </div>
                    <div className="stat-item">
                        <h3>Game Count by Role</h3>
                        <div className="chart-wrapper">
                            {gameCountChartData && (
                                <Bar data={gameCountChartData} options={gameCountChartOptions} />
                            )}
                        </div>
                    </div>
                </div>
                <div className="general-stats">
                    <h3>General Stats</h3>
                    <div className="stats-columns">
                        <div className="stats-column">
                            <h4>🌟 Overall</h4>
                            <p><span className="stat-label">Rank:</span> <span className="stat-value">{parseInt(playerStats['Rank']) + 1}</span></p>
                            <p><span className="stat-label">Total Games:</span> <span className="stat-value">{parseInt(playerStats['Total Number Of Games Played'])}</span></p>
                            <p><span className="stat-label">Overall Win Rate:</span> <span className="stat-value">{((playerStats['Number Of Games Won'] / playerStats['Total Number Of Games Played']) * 100).toFixed(2)}%</span></p>
                            <p><span className="stat-label">Current MMR:</span> <span className="stat-value overall-mmr">{parseFloat(playerStats['MMR']).toFixed(2)}</span></p>
                            <p><span className="stat-label">Games Died First:</span> <span className="stat-value">{parseInt(playerStats['Number Of Games Died First'])}</span></p>
                        </div>
                        <div className="stats-column crewmate-stats">
                            <h4>👨‍🚀 Crewmate</h4>
                            <p><span className="stat-label">Crewmate Games:</span> <span className="stat-value">{parseInt(playerStats['Number Of Crewmate Games Played'])}</span></p>
                            <p><span className="stat-label">Crewmate Win Rate:</span> <span className="stat-value">{((playerStats['Number Of Crewmate Games Won'] / playerStats['Number Of Crewmate Games Played']) * 100).toFixed(2)}%</span></p>
                            <p><span className="stat-label">Crewmate MMR:</span> <span className="stat-value crewmate-mmr">{parseFloat(playerStats['Crewmate MMR']).toFixed(2)}</span></p>
                            <p><span className="stat-label">Voting Accuracy:</span> <span className="stat-value">{(playerStats['Voting Accuracy (Crewmate games)'] * 100).toFixed(2)}%</span></p>
                            <p><span className="stat-label">Crewmate Win Streak:</span> <span className="stat-value">{parseInt(playerStats['Crewmate Win Streak'])}</span></p>
                            <p><span className="stat-label">Best Crewmate Streak:</span> <span className="stat-value">{parseInt(playerStats['Best Crewmate Win Streak'])}</span></p>
                            <p><span className="stat-label">Crewmate Survivability:</span> <span className="stat-value">{(playerStats['Survivability (Crewmate)'] * 100).toFixed(2)}%</span></p>
                        </div>
                        <div className="stats-column impostor-stats">
                            <h4>🔪 Impostor</h4>
                            <p><span className="stat-label">Impostor Games:</span> <span className="stat-value">{parseInt(playerStats['Number Of Impostor Games Played'])}</span></p>
                            <p><span className="stat-label">Impostor Win Rate:</span> <span className="stat-value">{((playerStats['Number Of Impostor Games Won'] / playerStats['Number Of Impostor Games Played']) * 100).toFixed(2)}%</span></p>
                            <p><span className="stat-label">Impostor MMR:</span> <span className="stat-value impostor-mmr">{parseFloat(playerStats['Impostor MMR']).toFixed(2)}</span></p>
                            <p><span className="stat-label">Impostor Win Streak:</span> <span className="stat-value">{parseInt(playerStats['Impostor Win Streak'])}</span></p>
                            <p><span className="stat-label">Best Impostor Streak:</span> <span className="stat-value">{parseInt(playerStats['Best Impostor Win Streak'])}</span></p>
                            <p><span className="stat-label">Impostor Survivability:</span> <span className="stat-value">{(playerStats['Survivability (Impostor)'] * 100).toFixed(2)}%</span></p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="top-teammates">
                <h3>Top Teammates</h3>
                {playerStats.top_teammates ? (
                    <div className="teammates-grid">
                        <div>
                            <h4>Overall</h4>
                            <ul>
                                {playerStats.top_teammates.overall && playerStats.top_teammates.overall.map(([name, count]) => (
                                    <li key={name}>
                                        <a href={`/player/${season}/${name}`}>{name}</a>: {count} games
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4>As Crewmate</h4>
                            <ul>
                                {playerStats.top_teammates.crewmate && playerStats.top_teammates.crewmate.map(([name, count]) => (
                                    <li key={name}>
                                        <a href={`/player/${season}/${name}`}>{name}</a>: {count} games
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4>As Impostor</h4>
                            <ul>
                                {playerStats.top_teammates.impostor && playerStats.top_teammates.impostor.map(([name, count]) => (
                                    <li key={name}>
                                        <a href={`/player/${season}/${name}`}>{name}</a>: {count} games
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p>No top teammates data available</p>
                )}
            </div>
        </div>
    );
};

export default PlayerStats;