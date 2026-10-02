import React, { useRef, useEffect } from "react";
import { TrendingUp, Zap, Activity, Clock } from "lucide-react";

export default function AnalyticsSummary({ history = [], tariffRate = 7.3 }) {
  const scrollContainerRef = useRef(null);

  // Auto-scroll to the far right as new live history samples arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: "smooth",
      });
    }
  }, [history.length]);

  if (!history || history.length === 0) {
    return (
      <div className="bg-slate-800/60 rounded-xl p-8 border border-slate-700 text-center text-slate-400 shadow-sm">
        <Activity className="mx-auto mb-2 text-emerald-400 animate-bounce" size={24} />
        <p className="text-sm">Collecting live telemetry points to render real-time line chart...</p>
      </div>
    );
  }

  // Session Summary Aggregates
  const peakPower = Math.max(...history.map((d) => d.power || 0));
  const avgPower = history.reduce((acc, curr) => acc + (curr.power || 0), 0) / history.length;
  const avgPF = history.reduce((acc, curr) => acc + (curr.powerFactor || 0), 0) / history.length;

  const maxPower = Math.max(peakPower, 50);
  const chartHeight = 160;
  const containerWidth = Math.max(history.length * 48, 650);

  // Map Data Points to SVG Space
  const points = history.map((item, idx) => {
    const x = history.length === 1 ? 30 : (idx / (history.length - 1)) * (containerWidth - 60) + 30;
    const y = chartHeight - (item.power / maxPower) * (chartHeight - 40) - 20;
    return { x, y, ...item };
  });

  const pathD = points.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - 15} L ${points[0].x} ${chartHeight - 15} Z`
    : "";

  return (
    <div className="space-y-6">
      {/* Aggregates Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Session Peak Load</span>
            <Zap size={14} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{peakPower.toFixed(1)} W</div>
          <div className="text-[11px] text-slate-500 mt-1">Highest recorded active power</div>
        </div>

        <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Session Average Load</span>
            <TrendingUp size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{avgPower.toFixed(1)} W</div>
          <div className="text-[11px] text-slate-500 mt-1">Mean power consumption</div>
        </div>

        <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Average Power Factor</span>
            <Activity size={14} className="text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-sky-400">{avgPF.toFixed(2)}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {avgPF >= 0.85 ? "Optimal Grid Efficiency" : "Requires Correction"}
          </div>
        </div>
      </div>

      {/* Real-time Line Graph Panel */}
      <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Clock size={16} className="text-emerald-400" /> Session Telemetry Line Chart
          </h4>
          <span className="text-xs text-slate-400 font-mono bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
            {history.length} Live Samples
          </span>
        </div>

        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
        >
          <div style={{ width: `${containerWidth}px`, height: `${chartHeight + 35}px` }} className="relative pt-2">
            <svg width={containerWidth} height={chartHeight} className="overflow-visible">
              <defs>
                <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1={chartHeight - 15} x2={containerWidth} y2={chartHeight - 15} stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="0" y1={chartHeight / 2} x2={containerWidth} y2={chartHeight / 2} stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
              <line x1="0" y1="20" x2={containerWidth} y2="20" stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />

              {/* Gradient Area */}
              {areaD && <path d={areaD} fill="url(#glowGrad)" />}

              {/* Connected Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Interactive Data Nodes */}
              {points.map((pt, idx) => (
                <g key={idx} className="group cursor-pointer">
                  {/* Outer Pulsing Aura */}
                  <circle cx={pt.x} cy={pt.y} r="7" className="fill-emerald-500/20 opacity-0 group-hover:opacity-100 transition-all" />
                  {/* Core Point */}
                  <circle cx={pt.x} cy={pt.y} r="4" className="fill-emerald-400 stroke-slate-900 stroke-2 group-hover:r-5 transition-all" />

                  {/* Tooltip Popup */}
                  <foreignObject
                    x={pt.x - 50}
                    y={pt.y - 45}
                    width="100"
                    height="38"
                    className="opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-30"
                  >
                    <div className="bg-slate-900/95 border border-slate-700 rounded-md text-[10px] text-emerald-400 text-center py-1.5 px-1 font-mono shadow-xl">
                      <div>{pt.power.toFixed(1)} W</div>
                      <div className="text-[9px] text-slate-400">PF: {pt.powerFactor ? pt.powerFactor.toFixed(2) : "0.00"}</div>
                    </div>
                  </foreignObject>

                  {/* Time Stamp Label */}
                  <text 
                    x={pt.x} 
                    y={chartHeight + 18} 
                    textAnchor="middle" 
                    fill="#64748b" 
                    fontSize="10" 
                    className="font-mono"
                  >
                    {pt.timestamp 
                      ? new Date(pt.timestamp).toLocaleTimeString([], { hour12: false }) 
                      : new Date().toLocaleTimeString([], { hour12: false })}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}