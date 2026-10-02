import React, { useState } from "react";
import { useLiveData } from "./hooks/useLiveData";
import BudgetTracker from "./components/BudgetTracker";
import NilmAnalytics from "./components/NilmAnalytics";
import AnalyticsSummary from "./components/AnalyticsSummary";
import StabilizerCalculator from "./components/StabilizerCalculator";
import { 
  LayoutDashboard, 
  Calculator, 
  Database, 
  Zap, 
  ShieldAlert, 
  Activity, 
  Download,
  Gauge,
  Cpu,
  Clock,
  ShieldCheck
} from "lucide-react";

// --- RESPONSIVE RADIAL GAUGE ARC ---
function ArcGauge({ value = 0, min = 0, max = 100, color = "#10b981" }) {
  const radius = 22;
  const strokeWidth = 4.5;
  const circumference = Math.PI * radius; // 180-degree arc
  const percentage = Math.min(Math.max((value - min) / (max - min), 0), 1);
  const strokeDashoffset = circumference - percentage * circumference;

  return (
    <div className="relative w-16 h-10 flex items-end justify-center shrink-0">
      <svg viewBox="0 0 72 40" className="w-full h-full overflow-visible">
        {/* Track Arc */}
        <path
          d="M 12,36 A 24,24 0 0,1 60,36"
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Active Value Arc */}
        <path
          d="M 12,36 A 24,24 0 0,1 60,36"
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

export default function App() {
  // 1. Live Data Custom Hook
  const { liveData, history, exportCSV, isRecording, setIsRecording } = useLiveData();
  
  // 2. Component State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tariffRate] = useState(7.3);

  // 3. Safety Alert Flags
  const isOverloaded = (liveData?.power || 0) > 2500;
  const isLowPF = (liveData?.power || 0) > 50 && (liveData?.powerFactor || 0) < 0.80;

  // --- REAL-TIME SLIDING WINDOW LINE CHART CONFIG ---
  const svgWidth = 800;
  const svgHeight = 200;
  const padLeft = 55;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 35;

  const chartWidth = svgWidth - padLeft - padRight;
  const chartHeight = svgHeight - padTop - padBottom;

  // Sliding window showing latest 15 telemetry readings
  const maxVisiblePoints = 15;
  const visibleHistory = history.slice(-maxVisiblePoints);

  // Dynamic Y-axis scale calculation
  const powerValues = visibleHistory.map((d) => d.power || 0);
  const rawMax = powerValues.length > 0 ? Math.max(...powerValues) : 100;
  const maxPowerY = Math.max(Math.ceil(rawMax / 50) * 50, 100);

  // Map history dataset to coordinates with auto-sliding positioning
  const points = visibleHistory.map((item, idx) => {
    const x = visibleHistory.length <= 1 
      ? padLeft + chartWidth 
      : padLeft + (idx / (visibleHistory.length - 1)) * chartWidth;
    
    const y = padTop + chartHeight - (item.power / maxPowerY) * chartHeight;
    
    // Format timestamp string to display time (HH:MM:SS)
    const formattedTime = item.timestamp 
      ? new Date(item.timestamp).toLocaleTimeString([], { hour12: false }) 
      : new Date().toLocaleTimeString([], { hour12: false });

    return { x, y, formattedTime, ...item };
  });

  const pathD = points.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${padTop + chartHeight} L ${points[0].x} ${padTop + chartHeight} Z`
    : "";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-6 shrink-0">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Zap size={22} />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100">Smart Energy</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">NILM Telemetry</p>
          </div>
        </div>

        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard size={16} /> Live Dashboard
          </button>

          <button
            onClick={() => setActiveTab("budget")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "budget"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Calculator size={16} /> Budget & Tariff
          </button>

          <button
            onClick={() => setActiveTab("nilm")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "nilm"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <Database size={16} /> NILM AI Recorder
          </button>

          <button
            onClick={() => setActiveTab("stabilizer")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === "stabilizer"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
            }`}
          >
            <ShieldCheck size={16} /> Stabilizer Calculator
          </button>
        </nav>

        {/* Hardware Status */}
        <div className="pt-4 border-t border-slate-850 px-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Hardware Status:</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                liveData?.status === "ONLINE"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              }`}
            >
              {liveData?.status || "OFFLINE"}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wide">
              {activeTab === "dashboard" && "Live Telemetry Dashboard"}
              {activeTab === "budget" && "Budget Analytics & Cost Projections"}
              {activeTab === "nilm" && "NILM Load Classification Engine"}
              {activeTab === "stabilizer" && "Voltage Stabilizer Calculator"}
            </h2>
            <p className="text-xs text-slate-400">Real-time PZEM-004T / ESP32 Energy Monitor</p>
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-2 border border-slate-700 transition cursor-pointer shrink-0"
          >
            <Download size={14} className="text-emerald-400" /> Export CSV Dataset
          </button>
        </div>

        {/* Safety Warning Banner */}
        {(isOverloaded || isLowPF) && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-rose-400 shrink-0" size={20} />
              <div>
                <h4 className="text-sm font-bold text-rose-300">
                  {isOverloaded ? "CRITICAL OVERLOAD WARNING" : "POOR POWER FACTOR DETECTED"}
                </h4>
                <p className="text-xs text-rose-400/90">
                  {isOverloaded
                    ? `Active load (${liveData.power.toFixed(1)} W) exceeds max 2500 W limit!`
                    : `Power factor (${liveData.powerFactor.toFixed(2)}) dropped below 0.80 standard.`}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/30">
              ALERT
            </span>
          </div>
        )}

        {/* TAB 1: LIVE DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Top Cards with Arc Gauges */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Active Power */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Zap size={14} className="text-emerald-400" />
                    <span>Active Power</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                    {(liveData?.power || 0).toFixed(1)} <span className="text-sm font-normal text-slate-400">W</span>
                  </div>
                </div>
                <ArcGauge value={liveData?.power || 0} max={3000} color="#10b981" />
              </div>

              {/* Current Load */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Activity size={14} className="text-amber-400" />
                    <span>Current Load</span>
                  </div>
                  <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                    {(liveData?.current || 0).toFixed(2)} <span className="text-sm font-normal text-slate-400">A</span>
                  </div>
                </div>
                <ArcGauge value={liveData?.current || 0} max={15} color="#fbbf24" />
              </div>

              {/* Grid Voltage */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Gauge size={14} className="text-sky-400" />
                    <span>Grid Voltage</span>
                  </div>
                  <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
                    {(liveData?.voltage || 0).toFixed(1)} <span className="text-sm font-normal text-slate-400">V</span>
                  </div>
                </div>
                <ArcGauge value={liveData?.voltage || 0} min={180} max={260} color="#38bdf8" />
              </div>

              {/* Power Factor */}
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between shadow-sm">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Cpu size={14} className="text-indigo-400" />
                    <span>Power Factor</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
                    {(liveData?.powerFactor || 0).toFixed(2)}
                  </div>
                </div>
                <ArcGauge value={liveData?.powerFactor || 0} max={1.0} color="#818cf8" />
              </div>
            </div>

            {/* REAL-TIME AUTO-SCROLLING LINE CHART */}
            <div className="bg-slate-800/60 rounded-xl p-5 border border-slate-700 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Clock size={16} className="text-emerald-400" /> Live Telemetry Trend Line
                </h4>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs text-slate-400 font-mono bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700">
                    {history.length} Total Readings
                  </span>
                </div>
              </div>

              {visibleHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <Activity className="mx-auto text-emerald-400 animate-bounce" size={24} />
                  <p className="text-xs">Awaiting real-time telemetry stream...</p>
                </div>
              ) : (
                <div className="w-full overflow-hidden">
                  <svg
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="w-full h-auto overflow-visible"
                  >
                    <defs>
                      <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.30" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y-AXIS GRID LINES & LABELS */}
                    <line
                      x1={padLeft}
                      y1={padTop}
                      x2={svgWidth - padRight}
                      y2={padTop}
                      stroke="#334155"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padLeft - 10}
                      y={padTop + 4}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="11"
                      className="font-mono font-medium"
                    >
                      {maxPowerY} W
                    </text>

                    <line
                      x1={padLeft}
                      y1={padTop + chartHeight / 2}
                      x2={svgWidth - padRight}
                      y2={padTop + chartHeight / 2}
                      stroke="#334155"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padLeft - 10}
                      y={padTop + chartHeight / 2 + 4}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="11"
                      className="font-mono font-medium"
                    >
                      {Math.round(maxPowerY / 2)} W
                    </text>

                    <line
                      x1={padLeft}
                      y1={padTop + chartHeight}
                      x2={svgWidth - padRight}
                      y2={padTop + chartHeight}
                      stroke="#475569"
                      strokeWidth="1.5"
                    />
                    <text
                      x={padLeft - 10}
                      y={padTop + chartHeight + 4}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="11"
                      className="font-mono font-medium"
                    >
                      0 W
                    </text>

                    {/* Y-Axis Line */}
                    <line
                      x1={padLeft}
                      y1={padTop - 5}
                      x2={padLeft}
                      y2={padTop + chartHeight}
                      stroke="#475569"
                      strokeWidth="1.5"
                    />

                    {/* PLOTTED AREA & LINE */}
                    {areaD && <path d={areaD} fill="url(#glowGrad)" />}
                    {pathD && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="transition-all duration-300"
                      />
                    )}

                    {/* DATA NODES & X-AXIS TIME STAMPS */}
                    {points.map((pt, idx) => {
                      const showTimeLabel = idx % 2 === 0 || idx === points.length - 1;

                      return (
                        <g key={idx} className="group">
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="4"
                            className="fill-emerald-400 stroke-slate-900 stroke-2 group-hover:r-6 transition-all duration-300"
                          />

                          {/* X-AXIS TIMESTAMP (HH:MM:SS) */}
                          {showTimeLabel && (
                            <text
                              x={pt.x}
                              y={padTop + chartHeight + 18}
                              textAnchor="middle"
                              fill="#64748b"
                              fontSize="10"
                              className="font-mono"
                            >
                              {pt.formattedTime}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
            </div>

            {/* Analytics Summary */}
            <AnalyticsSummary history={history} tariffRate={tariffRate} />
          </div>
        )}

        {/* TAB 2: BUDGET & TARIFF */}
        {activeTab === "budget" && (
          <BudgetTracker
            currentPower={liveData?.power || 0}
            totalEnergy={liveData?.energy || 0}
            tariffRate={tariffRate}
          />
        )}

        {/* TAB 3: NILM AI RECORDER */}
        {activeTab === "nilm" && (
          <NilmAnalytics
            liveData={liveData}
            history={history}
            isRecording={isRecording}
            setIsRecording={setIsRecording}
          />
        )}

        {/* TAB 4: STABILIZER CALCULATOR & RECOMMENDER */}
        {activeTab === "stabilizer" && (
          <StabilizerCalculator history={history} />
        )}
      </main>
    </div>
  );
}