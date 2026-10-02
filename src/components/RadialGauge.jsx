import React from "react";
import { Zap, Activity, Gauge, Cpu } from "lucide-react";

function ArcGauge({ value = 0, min = 0, max = 100, color = "#10b981" }) {
  const radius = 26;
  const strokeWidth = 5;
  const circumference = Math.PI * radius; // Half arc (180 degrees)
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className="relative w-20 h-12 flex items-end justify-center">
      <svg className="w-20 h-12">
        {/* Background Arc */}
        <path
          d="M 10,40 A 26,26 0 0,1 70,40"
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value Arc */}
        <path
          d="M 10,40 A 26,26 0 0,1 70,40"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <span className="absolute bottom-0 text-[10px] font-mono font-bold text-slate-300">
        {Math.round(percentage * 100)}%
      </span>
    </div>
  );
}

export default function LiveGaugeMetrics({ data }) {
  const current = data || { power: 0, current: 0, voltage: 230, powerFactor: 0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Active Power Card */}
      <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Zap size={14} className="text-emerald-400" />
            <span>Active Power</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {current.power.toFixed(1)} <span className="text-sm font-normal text-slate-400">W</span>
          </div>
        </div>
        <ArcGauge value={current.power} max={3000} color="#10b981" />
      </div>

      {/* Current Load Card */}
      <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Activity size={14} className="text-amber-400" />
            <span>Current Load</span>
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {current.current.toFixed(2)} <span className="text-sm font-normal text-slate-400">A</span>
          </div>
        </div>
        <ArcGauge value={current.current} max={15} color="#fbbf24" />
      </div>

      {/* Grid Voltage Card */}
      <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Gauge size={14} className="text-sky-400" />
            <span>Grid Voltage</span>
          </div>
          <div className="text-2xl font-bold text-sky-400 font-mono">
            {current.voltage.toFixed(1)} <span className="text-sm font-normal text-slate-400">V</span>
          </div>
        </div>
        <ArcGauge value={current.voltage} min={180} max={260} color="#38bdf8" />
      </div>

      {/* Power Factor Card */}
      <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/80 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Cpu size={14} className="text-indigo-400" />
            <span>Power Factor</span>
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {current.powerFactor.toFixed(2)}
          </div>
        </div>
        <ArcGauge value={current.powerFactor} max={1.0} color="#818cf8" />
      </div>
    </div>
  );
}