import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PerformanceChart = ({ data = [] }) => {
    // Transform data to Recharts format
    const chartData = data.map((value, index) => ({
        name: `${index + 1}`,
        points: value || 0,
        index: index
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: 'rgba(26, 26, 46, 0.95)',
                    border: '1px solid rgba(78, 204, 163, 0.3)',
                    borderRadius: '8px',
                    padding: '10px',
                    color: '#e0e0e0'
                }}>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                        Feladat {payload[0].payload.name}
                    </p>
                    <p style={{ margin: '5px 0 0 0', color: '#4ecca3' }}>
                        Pontszám: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Dynamic bar colors based on performance
    const getBarColor = (value, index) => {
        if (value === 0) return 'rgba(255, 255, 255, 0.1)';
        if (value >= 40) return '#4ecca3'; // High - green
        if (value >= 20) return '#00d4ff'; // Medium - cyan
        return '#ff8c42'; // Low - orange
    };

    return (
        <div style={{ width: '100%', height: '200px', paddingTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255, 255, 255, 0.05)"
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        stroke="#e0e0e0"
                        tick={{ fill: '#e0e0e0', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                    />
                    <YAxis
                        stroke="#e0e0e0"
                        tick={{ fill: '#e0e0e0', fontSize: 12 }}
                        axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                        domain={[0, 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                    <Bar
                        dataKey="points"
                        radius={[8, 8, 0, 0]}
                        maxBarSize={50}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getBarColor(entry.points, index)} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>

            {/* Legend below chart */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '10px',
                fontSize: '11px',
                color: '#a0a0a0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#4ecca3', borderRadius: '2px' }}></div>
                    <span>Kiváló (40+)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#00d4ff', borderRadius: '2px' }}></div>
                    <span>Jó (20-39)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '12px', height: '12px', background: '#ff8c42', borderRadius: '2px' }}></div>
                    <span>Gyenge (0-19)</span>
                </div>
            </div>
        </div>
    );
};

export default PerformanceChart;
