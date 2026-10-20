import React from "react";
import { TrendingUp, Zap, Activity, ShieldCheck, BarChart3 } from "lucide-react";

export default function AnalyticsSummary({ history = [], tariffRate = 7.3 }) {
  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-900/60 rounded-2xl p-8 border border-slate-800 text-center text-slate-400 shadow-sm">
        <Activity className="mx-auto mb-2 text-emerald-400 animate-bounce" size={24} />
        <p className="text-sm">Collecting live telemetry points to render analytics summary...</p>
      </div>
    );
  }

  // Session Summary Aggregates
  const peakPower = Math.max(...history.map((d) => d.power || 0));
  const avgPower = history.reduce((acc, curr) => acc + (curr.power || 0), 0) / history.length;
  const avgPF = history.reduce((acc, curr) => acc + (curr.powerFactor || 0), 0) / history.length;
  const totalEnergy = history.length > 0 ? history[history.length - 1].energy || 0 : 0;

  // Calculate percentage of 250W overload threshold for visual progress bars
  const overloadLimit = 250.0;
  const peakPercentage = Math.min(Math.round((peakPower / overloadLimit) * 100), 100);
  const avgPercentage = Math.min(Math.round((avgPower / overloadLimit) * 100), 100);

  return (
    <div className="space-y-6">
      {/* Aggregates Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Peak Load */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-900/90 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            <span>Session Peak Load</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Zap size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
            {peakPower.toFixed(1)} <span className="text-sm font-bold text-slate-400">W</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
            Highest recorded active power
          </div>
        </div>

        {/* Average Load */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-900/90 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            <span>Session Average Load</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
            {avgPower.toFixed(1)} <span className="text-sm font-bold text-slate-400">W</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
            Mean power consumption
          </div>
        </div>

        {/* Power Factor */}
        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-900/90 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500"></div>
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
            <span>Average Power Factor</span>
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
              <Activity size={16} />
            </div>
          </div>
          <div className="text-3xl font-black text-sky-400 font-mono tracking-tight">
            {avgPF.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
            {avgPF >= 0.85 ? "Optimal Grid Efficiency" : "Requires Correction"}
          </div>
        </div>
      </div>

      {/* NEW: Professional Load Distribution & Threshold Visualizer */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-400" /> Threshold & Load Distribution Analysis
          </h4>
          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            {history.length} Samples Evaluated
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Peak Load vs 250W Threshold Progress Bar */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Peak Load vs 250W Safety Cap</span>
              <span className="text-amber-400 font-mono">{peakPercentage}% of Limit</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${peakPercentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500">
              {peakPower > 250 ? "⚠️ Peak breached safety cutoff limit!" : "✓ Operating safely within threshold."}
            </p>
          </div>

          {/* Average Load vs 250W Threshold Progress Bar */}
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-3xl text-slate-300" style={{ fontSize: '12px' }}>Average Load Efficiency</span>
              <span className="text-emerald-400 font-mono">{avgPercentage}% Utilization</span>
            </div>
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${avgPercentage}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-500">
              Mean consumption relative to maximum allowable household load.
            </p>
          </div>
        </div>

        {/* Bottom Stat Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400 gap-2">
          <span className="flex items-center gap-1.5 font-mono text-emerald-400">
            <ShieldCheck size={16} /> Overload Protection Relay: Active & Armed (250W Limit)
          </span>
          <span className="font-mono text-slate-500">Total Accumulated Energy: {totalEnergy.toFixed(4)} kWh</span>
        </div>
      </div>
    </div>
  );
}