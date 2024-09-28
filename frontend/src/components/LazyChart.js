import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const LazyChart = ({ data }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#ffffff'
                }
            },
            title: {
                display: true,
                text: 'MMR Progression',
                color: '#ffffff'
            },
        },
        scales: {
            x: {
                grid: {
                    color: '#333333'
                },
                ticks: {
                    color: '#ffffff'
                }
            },
            y: {
                grid: {
                    color: '#333333'
                },
                ticks: {
                    color: '#ffffff'
                }
            }
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '8px' }}>
            <Line options={options} data={data} />
        </div>
    );
};

export default LazyChart;
