import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { TrendingUp } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function LiveChart({ history }) {
  // Extract rolling sample slice (last 30 readings for clean real-time rendering)
  const recentHistory = history.slice(-30);

  const labels = recentHistory.map((item) => {
    if (!item.timestamp) return "";
    const date = new Date(item.timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  });

  const powerData = recentHistory.map((item) => item.power || 0);
  const currentData = recentHistory.map((item) => item.current || 0);
  const voltageData = recentHistory.map((item) => item.voltage || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Active Power (W)",
        data: powerData,
        borderColor: "#10b981", // Emerald green
        backgroundColor: "rgba(16, 185, 129, 0.15)",
        fill: true,
        tension: 0.3,
        yAxisID: "yPower",
        pointRadius: 2,
      },
      {
        label: "Current (A)",
        data: currentData,
        borderColor: "#f59e0b", // Amber yellow
        backgroundColor: "rgba(245, 158, 11, 0.0)",
        fill: false,
        tension: 0.3,
        yAxisID: "yCurrent",
        pointRadius: 2,
      },
      {
        label: "Voltage (V)",
        data: voltageData,
        borderColor: "#3b82f6", // Blue
        backgroundColor: "rgba(59, 130, 246, 0.0)",
        fill: false,
        tension: 0.3,
        yAxisID: "yVoltage",
        pointRadius: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 300,
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#94a3b8",
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        borderColor: "#334155",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#64748b", maxRotation: 0, autoSkip: true, maxTicksLimit: 6 },
      },
      yPower: {
        type: "linear",
        display: true,
        position: "left",
        title: { display: true, text: "Power (W)", color: "#10b981" },
        grid: { color: "rgba(51, 65, 85, 0.3)" },
        ticks: { color: "#10b981" },
        suggestedMin: 0,
      },
      yCurrent: {
        type: "linear",
        display: true,
        position: "right",
        title: { display: true, text: "Current (A)", color: "#f59e0b" },
        grid: { drawOnChartArea: false },
        ticks: { color: "#f59e0b" },
        suggestedMin: 0,
      },
      yVoltage: {
        type: "linear",
        display: false, // Hidden to avoid cluttering secondary Y-axis
        suggestedMin: 180,
        suggestedMax: 260,
      },
    },
  };

  return (
    <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-100">
          <TrendingUp className="text-emerald-400" /> Live Energy Consumption Telemetry
        </h3>
        <span className="text-xs text-slate-400">Rolling 30-sample Window</span>
      </div>
      <div className="h-72 w-full">
        {history.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Waiting for live ESP32 telemetry data stream...
          </div>
        )}
      </div>
    </div>
  );
}