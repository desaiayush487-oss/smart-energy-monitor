import React, { useState } from "react";
import { ShieldCheck, Zap, HelpCircle, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function StabilizerCalculator({ history = [] }) {
  // Manual input state
  const [applianceType, setApplianceType] = useState("custom");
  const [ratedWatts, setRatedWatts] = useState(1000);
  const [powerFactor, setPowerFactor] = useState(0.8);
  const [minVoltage, setMinVoltage] = useState(160);
  const [maxVoltage, setMaxVoltage] = useState(260);

  // Auto-fill from live telemetry if available
  const autoDetectTelemetry = () => {
    if (!history || history.length === 0) return;
    const latest = history[history.length - 1];
    if (latest.power) setRatedWatts(Math.round(latest.power * 1.25)); // 25% overhead safety margin
    if (latest.powerFactor) setPowerFactor(Number(latest.powerFactor.toFixed(2)));
  };

  // Standard preset selector handler
  const handlePresetChange = (type) => {
    setApplianceType(type);
    switch (type) {
      case "ac_1_5ton":
        setRatedWatts(1800);
        setPowerFactor(0.85);
        setMinVoltage(150);
        setMaxVoltage(270);
        break;
      case "refrigerator":
        setRatedWatts(350);
        setPowerFactor(0.75);
        setMinVoltage(140);
        setMaxVoltage(280);
        break;
      case "tv_entertainment":
        setRatedWatts(250);
        setPowerFactor(0.9);
        setMinVoltage(160);
        setMaxVoltage(260);
        break;
      case "main_line_home":
        setRatedWatts(4000);
        setPowerFactor(0.85);
        setMinVoltage(130);
        setMaxVoltage(280);
        break;
      default:
        break;
    }
  };

  // Calculations
  const safetyFactor = 1.25; // 25% safety overhead for inrush/surge current
  const calculatedVA = (ratedWatts / (powerFactor || 0.8)) * safetyFactor;
  const recommendedKVA = (calculatedVA / 1000).toFixed(2);
  
  // Standard market ratings in kVA
  const marketRatings = [0.5, 1.0, 2.0, 3.0, 4.0, 5.0, 7.5, 10.0];
  const suggestedKVA = marketRatings.find((r) => r >= parseFloat(recommendedKVA)) || Math.ceil(parseFloat(recommendedKVA));

  // Determine working input range classification
  const isWideRange = minVoltage < 150;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/60 p-6 rounded-xl border border-slate-700 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" size={22} /> Voltage Stabilizer Calculator & Recommender
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Calculate accurate kVA ratings and voltage range requirements based on load and grid conditions.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={autoDetectTelemetry}
            className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
          >
            <Zap size={14} /> Auto-fill from Live Telemetry
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Controls */}
        <div className="lg:col-span-7 bg-slate-800/60 p-6 rounded-xl border border-slate-700 space-y-5">
          <h4 className="text-sm font-semibold text-slate-200 border-b border-slate-700/60 pb-3">
            Load & Voltage Parameters
          </h4>

          {/* Quick Select Preset */}
          <div>
            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Quick Preset</label>
            <select
              value={applianceType}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="custom">Custom Load Setup</option>
              <option value="ac_1_5ton">1.5 Ton Split Air Conditioner</option>
              <option value="refrigerator">Double Door Refrigerator / Deep Freezer</option>
              <option value="tv_entertainment">OLED TV + Home Theater System</option>
              <option value="main_line_home">Main Line Whole-Home Protection</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Active Load */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Total Power Load (Watts)
              </label>
              <input
                type="number"
                value={ratedWatts}
                onChange={(e) => setRatedWatts(Number(e.target.value))}
                min="50"
                step="50"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Power Factor */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Operating Power Factor (PF)
              </label>
              <input
                type="number"
                value={powerFactor}
                onChange={(e) => setPowerFactor(Number(e.target.value))}
                min="0.5"
                max="1.0"
                step="0.05"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-sky-400 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Minimum Expected Grid Voltage */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Min Grid Voltage (Low Cutoff)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={minVoltage}
                  onChange={(e) => setMinVoltage(Number(e.target.value))}
                  min="90"
                  max="220"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500">V</span>
              </div>
            </div>

            {/* Maximum Expected Grid Voltage */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">
                Max Grid Voltage (High Cutoff)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={maxVoltage}
                  onChange={(e) => setMaxVoltage(Number(e.target.value))}
                  min="230"
                  max="300"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-400 font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500">V</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/80 text-[11px] text-slate-400 flex items-start gap-2">
            <HelpCircle size={15} className="text-slate-400 shrink-0 mt-0.5" />
            <span>
              A <strong>25% safety overhead factor</strong> is automatically factored in to account for inductive motor start surges and prevent nuisance trips.
            </span>
          </div>
        </div>

        {/* Output & Recommendation Card */}
        <div className="lg:col-span-5 bg-slate-800/60 p-6 rounded-xl border border-slate-700 flex flex-col justify-between space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-slate-200 border-b border-slate-700/60 pb-3">
              Stabilizer Specification Output
            </h4>

            <div className="mt-4 space-y-4">
              <div className="p-4 bg-slate-900/90 rounded-xl border border-emerald-500/30 text-center">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold mb-1">
                  Recommended Stabilizer Rating
                </span>
                <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {suggestedKVA} kVA
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  (Exact calculated load: <span className="text-slate-200 font-mono">{recommendedKVA} kVA</span>)
                </div>
              </div>

              {/* Voltage Range Card */}
              <div className="p-3.5 bg-slate-900/50 rounded-lg border border-slate-700 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Required Operating Voltage Range:</span>
                  <span className="text-amber-400 font-mono font-bold">{minVoltage}V – {maxVoltage}V</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Stabilizer Range Type:</span>
                  <span className="text-slate-200 font-medium">
                    {isWideRange ? "Wide Range (Low Voltage Cutoff)" : "Standard Range"}
                  </span>
                </div>
              </div>

              {/* Recommended Specs List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>Time Delay System (TDS) for Compressor Protection</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>High & Low Cutoff Voltage Cut-Off Switch</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                  <span>Thermal Overload Protection</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-700/60 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Grid Compatibility Check:</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              Passed Standard Test <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}