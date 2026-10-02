import React, { useState, useEffect } from "react";
import { APPLIANCE_PRESETS, classifyAppliance } from "../utils/nilmClassifier";
import { Database, Tag, ShieldAlert, Activity, CheckCircle, Disc } from "lucide-react";

export default function NilmAnalytics({ liveData, history, isRecording, setIsRecording }) {
  const [selectedTag, setSelectedTag] = useState("auto");
  const [eventLogs, setEventLogs] = useState([]);

  const autoClassification = classifyAppliance(
    liveData.power,
    liveData.current,
    liveData.powerFactor
  );

  const currentActiveLabel =
    selectedTag === "auto"
      ? autoClassification.name
      : APPLIANCE_PRESETS.find((p) => p.id === selectedTag)?.name || selectedTag;

  // Log load state change events whenever power changes significantly (> 15W delta)
  useEffect(() => {
    if (history.length < 2) return;
    const prev = history[history.length - 2];
    const curr = history[history.length - 1];

    const powerDelta = Math.abs(curr.power - prev.power);
    if (powerDelta >= 15) {
      const newEvent = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        previousPower: prev.power,
        newPower: curr.power,
        delta: (curr.power - prev.power).toFixed(1),
        label: currentActiveLabel
      };
      setEventLogs((prevLogs) => [newEvent, ...prevLogs.slice(0, 19)]);
    }
  }, [history, currentActiveLabel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700/60 pb-4 gap-2">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-100">
              <Database className="text-emerald-400" /> NILM Load Classification & Dataset Annotator
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tag real-time telemetry signatures to create ground-truth training datasets for AI model training.
            </p>
          </div>
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              isRecording
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-slate-700 text-slate-300 border border-slate-600"
            }`}
          >
            <Disc size={14} className={isRecording ? "animate-pulse text-emerald-400" : ""} />
            {isRecording ? `Recording (${history.length} samples)` : "Recording Paused"}
          </button>
        </div>

        {/* Live Classifier Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className={`p-4 rounded-xl border ${autoClassification.badgeBg} flex flex-col justify-between`}>
            <div>
              <div className="text-xs text-slate-400 uppercase font-medium tracking-wider mb-1">
                AI Inferred Load Class
              </div>
              <div className={`text-2xl font-bold ${autoClassification.color}`}>
                {autoClassification.name}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300 mt-4">
              <ShieldAlert size={14} className="text-amber-400" />
              <span>Confidence: <strong>{autoClassification.confidence}</strong></span>
            </div>
          </div>

          {/* Manual Ground Truth Tagging Override */}
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 space-y-3">
            <label className="block text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Tag size={14} className="text-emerald-400" /> Manual Ground-Truth Label Override
            </label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="auto">⚡ Auto-Classify (AI Match)</option>
              {APPLIANCE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  🏷️ {preset.name} ({preset.minPower}-{preset.maxPower}W)
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Active Annotation: <span className="text-emerald-400 font-semibold">{currentActiveLabel}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Appliance Signature Reference Table */}
      <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Activity size={16} className="text-emerald-400" /> Configured Appliance Electrical Signatures
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Appliance Label</th>
                <th className="py-2.5 px-3">Power Range (W)</th>
                <th className="py-2.5 px-3">Target Power Factor</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {APPLIANCE_PRESETS.map((app) => {
                const isActive = autoClassification.name === app.name;
                return (
                  <tr key={app.id} className={isActive ? "bg-emerald-950/20 font-semibold text-emerald-400" : ""}>
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      {isActive && <CheckCircle size={14} className="text-emerald-400" />}
                      {app.name}
                    </td>
                    <td className="py-2.5 px-3">{app.minPower} W - {app.maxPower} W</td>
                    <td className="py-2.5 px-3">~{app.avgPF} PF</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        isActive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "text-slate-500"
                      }`}>
                        {isActive ? "ACTIVE LOAD" : "INACTIVE"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Event Trigger Log */}
      <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-4">
        <h4 className="text-sm font-semibold text-slate-200">Real-Time Load Switching Log</h4>
        {eventLogs.length === 0 ? (
          <div className="text-xs text-slate-500 text-center py-4 bg-slate-900/40 rounded-lg">
            No load switching events detected yet. Turn an appliance ON or OFF to view step changes.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {eventLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-mono">{log.timestamp}</span>
                  <span className="text-slate-200 font-medium">{log.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">{log.previousPower}W → {log.newPower}W</span>
                  <span className={`font-bold px-2 py-0.5 rounded ${
                    Number(log.delta) >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                  }`}>
                    {Number(log.delta) >= 0 ? `+${log.delta}W` : `${log.delta}W`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}