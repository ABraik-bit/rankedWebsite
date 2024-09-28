import React, { useState, useEffect, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Grid, ThemeProvider, createTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Leaderboard.css';

const Leaderboard = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [season, setSeason] = useState('');
    const [availableSeasons, setAvailableSeasons] = useState([]);
    const [minMatches, setMinMatches] = useState(0);
    const navigate = useNavigate();

    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            background: {
                default: '#121212',
                paper: '#1d1d1d',
            },
            text: {
                primary: '#ffffff',
                secondary: '#b0b0b0',
            },
        },
    });

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await fetch(process.env.NODE_ENV === 'production'
                    ? 'https://www.aupp.pro/api/available-seasons/'
                    : 'http://localhost:8000/api/available-seasons/');

                if (!response.ok) {
                    throw new Error(`Failed to fetch available seasons: ${response.statusText}`);
                }

                const seasons = await response.json();
                if (seasons.length > 0) {
                    setAvailableSeasons(seasons);
                    setSeason(seasons[0]);
                } else {
                    setAvailableSeasons([]);
                    setSeason('');
                }
            } catch (error) {
                console.error('Error fetching available seasons:', error);
            }
        };

        fetchSeasons();
    }, []);

    const apiURL = process.env.NODE_ENV === 'production'
        ? `https://www.aupp.pro/api/leaderboard/${season}`
        : `http://localhost:8000/api/leaderboard/${season}`;

    useEffect(() => {
        if (season) {
            fetch(apiURL)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    setData(data);
                    setFilteredData(data);
                })
                .catch(error => console.error('Error fetching leaderboard data:', error));
        }
    }, [apiURL, season]);

    const columns = useMemo(() => [
        {
            Header: 'Rank',
            accessor: 'Rank',
            Cell: ({ row }) => row.index + 1,  // Dynamic rank based on the sorting
        },
        {
            Header: '👤 Player Name',
            accessor: 'Player Name',
            Cell: ({ value }) => (
                <span
                    className="player-name"
                    onClick={() => navigate(`/player/${encodeURIComponent(season)}/${encodeURIComponent(value)}`)}
                >
                    {value}
                </span>
            ),
        },
        {
            Header: '🔥 MMR',
            accessor: 'MMR',
        },
        {
            Header: '🛠️ Crewmate MMR',
            accessor: 'Crewmate MMR',
        },
        {
            Header: '🔪 Impostor MMR',
            accessor: 'Impostor MMR',
        },
        {
            Header: '🎮 Games Played',
            accessor: 'Total Number Of Games Played',
            Cell: ({ value }) => Math.round(value),  // Display as an integer
        },
        {
            Header: '🗳️ Voting Accuracy (Crewmate games)',
            accessor: 'Voting Accuracy (Crewmate games)',
            Cell: ({ value }) => `${(value * 100).toFixed(2)}%`,
        },
        {
            Header: '🏅 Winning Percentage',
            accessor: 'Winning Percentage',
            Cell: ({ row }) => {
                const gamesWon = row.original["Number Of Games Won"];
                const gamesPlayed = row.original["Total Number Of Games Played"];
                return `${((gamesWon / gamesPlayed) * 100).toFixed(2)}%`;
            }
        }
    ], [navigate, season]);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow
    } = useTable({ columns, data: filteredData }, useSortBy);

    useEffect(() => {
        const results = data.filter(player =>
            player["Player Name"].toLowerCase().includes(searchTerm.toLowerCase()) &&
            player["Total Number Of Games Played"] >= Number(minMatches)  // Ensure numeric comparison
        );
        setFilteredData(results);
    }, [searchTerm, data, minMatches]);

    const handleSeasonChange = (event) => {
        setSeason(event.target.value);
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <div className="leaderboard-container">
                <div className="leaderboard-content">
                    <Grid container spacing={2} alignItems="center" justifyContent="space-between" sx={{ marginBottom: '20px' }}>
                        {/* Filters and Search */}
                        <Grid item xs={3}>
                            <TextField
                                label="🎮 Min Matches Played"
                                variant="outlined"
                                fullWidth
                                type="number"
                                value={minMatches}
                                onChange={(e) => setMinMatches(e.target.value)}
                                className="min-matches-input"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                label="🔍 Search players..."
                                variant="outlined"
                                fullWidth
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <FormControl variant="outlined" fullWidth>
                                <InputLabel style={{ color: '#fff' }}>Season</InputLabel>
                                <Select value={season} onChange={handleSeasonChange} label="Season">
                                    {availableSeasons.length > 0 ? (
                                        availableSeasons.map(season => (
                                            <MenuItem key={season} value={season}>{season}</MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="">No seasons available</MenuItem>
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>

                    <div className="table-wrapper">
                        <TableContainer component={Paper} style={{ backgroundColor: '#1d1d1d', margin: 'auto' }}>
                            <Table {...getTableProps()} sx={{ minWidth: 650 }}>
                                <TableHead>
                                    {headerGroups.map(headerGroup => (
                                        <TableRow key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                                            {headerGroup.headers.map(column => (
                                                <TableCell
                                                    key={column.id}
                                                    {...column.getHeaderProps(column.getSortByToggleProps())}
                                                    sx={{
                                                        backgroundColor: '#333',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    {column.render('Header')}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHead>
                                <TableBody {...getTableBodyProps()}>
                                    {rows.map(row => {
                                        prepareRow(row);
                                        return (
                                            <TableRow
                                                key={row.id}
                                                {...row.getRowProps()}
                                                className="player-row"
                                            >
                                                {row.cells.map(cell => (
                                                    <TableCell
                                                        key={cell.column.id}
                                                        {...cell.getCellProps()}
                                                        sx={{ textAlign: 'left', color: '#fff' }}
                                                    >
                                                        {cell.render('Cell')}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                </div>
            </div>
        </ThemeProvider>

    );
};

export default Leaderboard;