import React, { useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ClickChart = ({ data }) => {
    const [detailLevel, setDetailLevel] = useState("hour");
    const chartRef = useRef(null);

    const processClickData = () => {
        if (!data.length) return { labels: [], data: [] };

        const groupedData = data.reduce((acc, timestamp) => {
            const date = new Date(timestamp);
            let key;

            switch (detailLevel) {
                case "minute":
                    key = `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
                    break;
                case "hour":
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:00`;
                    break;
                case "day":
                default:
                    key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
                    break;
            }

            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(groupedData).sort();
        const values = labels.map((label) => groupedData[label]);

        return { labels, values };
    };

    const { labels, values } = processClickData();

    const gradient = () => {
        const ctx = chartRef.current?.ctx;
        if (!ctx) return "rgb(75, 192, 192)";
        const gradientFill = ctx.createLinearGradient(0, 0, 0, 400);
        gradientFill.addColorStop(0, "rgba(75, 192, 192, 0.4)");
        gradientFill.addColorStop(1, "rgba(75, 192, 192, 0.1)");
        return gradientFill;
    };

    const chartData = {
        labels,
        datasets: [
            {
                label: "Clicks",
                data: values,
                fill: true,
                backgroundColor: gradient(),
                borderColor: "rgb(75, 192, 192)",
                pointBackgroundColor: "rgb(75, 192, 192)",
                pointBorderColor: "#fff",
                pointHoverBackgroundColor: "#fff",
                pointHoverBorderColor: "rgb(75, 192, 192)",
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => `Clicks: ${tooltipItem.raw}`,
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: "#6b7280",
                },
            },
            y: {
                grid: {
                    color: "#e5e7eb",
                },
                ticks: {
                    color: "#6b7280",
                    stepSize: 1,
                    callback: function(value) { return Number.isInteger(value) ? value : ''; }
                },
            },
        },
    };

    return (
        <div className="mb-6 flex-1 col bg-white p-4 border rounded">
            <div className="flex justify-center space-x-4 mb-4">
                {["day", "hour", "minute"].map((level) => (
                    <button
                        key={level}
                        onClick={() => setDetailLevel(level)}
                        className={`py-2 px-4 rounded font-medium ${
                            detailLevel === level
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                ))}
            </div>
            <div className="flex justify-center max-h-96">
                <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>
        </div>
    );
};

export default ClickChart;
