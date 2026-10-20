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
  ShieldCheck
} from "lucide-react";

export default function App() {
  // 1. Live Data Custom Hook (with simulateOverload included)
  const { liveData, history, exportCSV, isRecording, setIsRecording, simulateOverload } = useLiveData();
  
  // 2. Component State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [tariffRate] = useState(7.3);

  // 3. Safety Alert Flags (250W overload cutoff threshold)
  const isOverloaded = (liveData?.power || 0) > 250.0;
  const isLowPF = (liveData?.power || 0) > 50 && (liveData?.powerFactor || 0) < 0.80;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-emerald-500 selection:text-slate-950">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800/80 p-5 space-y-6 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="p-2.5 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30 shadow-inner">
              <Zap size={22} />
            </div>
            <div>
              <h1 className="font-bold text-sm text-slate-100 tracking-tight">Smart Energy</h1>
              <p className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">NILM Telemetry</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard size={18} /> Live Dashboard
            </button>

            <button
              onClick={() => setActiveTab("budget")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "budget"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Calculator size={18} /> Budget & Tariff
            </button>

            <button
              onClick={() => setActiveTab("nilm")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "nilm"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Database size={18} /> NILM AI Recorder
            </button>

            <button
              onClick={() => setActiveTab("stabilizer")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === "stabilizer"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <ShieldCheck size={18} /> Stabilizer Calculator
            </button>
          </nav>
        </div>

        {/* Hardware Status Widget */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">ESP32 Hardware:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                liveData?.status === "ONLINE"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              }`}
            >
              {liveData?.status || "OFFLINE"}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
            <span className={`w-1.5 h-1.5 rounded-full ${liveData?.status === "ONLINE" ? "bg-emerald-400 animate-ping" : "bg-rose-500"}`}></span>
            PZEM-004T Sensor Link Active
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-sm">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
              {activeTab === "dashboard" && "Live Telemetry Control Center"}
              {activeTab === "budget" && "Budget Analytics & Cost Projections"}
              {activeTab === "nilm" && "NILM Load Classification Engine"}
              {activeTab === "stabilizer" && "Voltage Stabilizer Calculator"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Real-time ESP32 & PZEM-004T Industrial Feed</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Demo Simulator Button */}
            <button
              onClick={simulateOverload}
              className="px-4 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-xl text-xs font-semibold flex items-center gap-2 border border-amber-500/40 transition cursor-pointer shadow-sm active:scale-95"
            >
              <Zap size={14} className="text-amber-400" /> Simulate Overload Spike
            </button>

            <button
              onClick={exportCSV}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition cursor-pointer shadow-sm active:scale-95"
            >
              <Download size={14} className="text-emerald-400" /> Export CSV
            </button>
          </div>
        </div>

        {/* Safety Warning Banner */}
        {(isOverloaded || isLowPF) && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/40 rounded-2xl flex items-center justify-between animate-pulse shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="p-2 bg-rose-500/20 rounded-xl text-rose-400">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-200">
                  {isOverloaded ? "CRITICAL OVERLOAD DETECTED (Relay Cutoff Triggered)" : "POOR POWER FACTOR WARNING"}
                </h4>
                <p className="text-xs text-rose-300/90 mt-0.5">
                  {isOverloaded
                    ? `Active load of ${(liveData?.power || 0).toFixed(1)}W has breached your 250W safe threshold!`
                    : `Power factor score (${(liveData?.powerFactor || 0).toFixed(2)}) is operating below baseline efficiency.`}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/30 uppercase tracking-widest font-bold">
              Trip Active
            </span>
          </div>
        )}

        {/* TAB 1: STREAMLINED DASHBOARD */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            
            {/* HERO METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Active Power Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold">Active Power</span>
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Zap size={18} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
                    {(liveData?.power || 0).toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-slate-400">Watts (W)</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Threshold Limit</span>
                  <span className="font-mono text-slate-400 font-semibold">250.0 W</span>
                </div>
              </div>

              {/* Current Load Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-amber-500/50 transition-all duration-300">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold">Current Draw</span>
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                    <Activity size={18} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400 font-mono tracking-tight">
                    {(liveData?.current || 0).toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-slate-400">Amps (A)</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Sensor Type</span>
                  <span className="font-mono text-slate-400 font-semibold">PZEM-004T CT</span>
                </div>
              </div>

              {/* Grid Voltage Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-sky-500/50 transition-all duration-300">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-500"></div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold">Grid Voltage</span>
                  <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl">
                    <Gauge size={18} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-sky-400 font-mono tracking-tight">
                    {(liveData?.voltage || 0).toFixed(1)}
                  </span>
                  <span className="text-sm font-bold text-slate-400">Volts (V)</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>AC Line Standard</span>
                  <span className="font-mono text-slate-400 font-semibold">230V Nominal</span>
                </div>
              </div>

              {/* Power Factor Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 p-5 rounded-2xl border border-slate-800 shadow-xl relative overflow-hidden group hover:border-indigo-500/50 transition-all duration-300">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs uppercase tracking-wider font-semibold">Power Factor</span>
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                    <Cpu size={18} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-100 font-mono tracking-tight">
                    {(liveData?.powerFactor || 0).toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-slate-400">cos(ϕ)</span>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Phase Efficiency</span>
                  <span className="font-mono text-emerald-400 font-semibold">Optimal</span>
                </div>
              </div>

            </div>

            {/* Analytics Summary & Load Distribution */}
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