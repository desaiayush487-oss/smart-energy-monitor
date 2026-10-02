import React, { useState } from "react";
import { Calculator, AlertTriangle, TrendingUp } from "lucide-react";

export default function BudgetTracker({ currentPower = 0, totalEnergy = 0, tariffRate = 7.3 }) {
  const [monthlyBudget, setMonthlyBudget] = useState(1500); // Default budget limit in ₹

  // Live Bill to Date (from hardware accumulated kWh)
  const liveCostToDate = (totalEnergy || 0) * tariffRate;

  // Projected Bill based on current active power load (W)
  const currentKw = (currentPower || 0) / 1000;
  const hourlyCost = currentKw * tariffRate;
  const projectedDailyCost = hourlyCost * 24;
  const projectedMonthlyCost = projectedDailyCost * 30;

  // Budget progress percentage
  const budgetUsagePercent = Math.min((projectedMonthlyCost / monthlyBudget) * 100, 100);

  const getBudgetStatusColor = (percent) => {
    if (percent < 70) return "bg-emerald-500";
    if (percent < 90) return "bg-amber-500";
    return "bg-rose-500";
  };

  return (
    <div className="bg-slate-800/60 rounded-xl p-6 border border-slate-700 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-100">
          <Calculator className="text-emerald-400" /> Electricity Tariff & Budget Projection
        </h3>
        <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-700">
          Live Stream
        </span>
      </div>

      {/* Budget Configuration Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Current Tariff Rate (₹ / kWh)</label>
          <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-400">
            ₹ {tariffRate} / kWh
          </div>
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1">Monthly Budget Target (₹)</label>
          <input
            type="number"
            step="50"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Live Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <div className="text-[11px] text-slate-400">Hardware Energy</div>
          <div className="text-lg font-bold text-amber-400">{(totalEnergy || 0).toFixed(3)} kWh</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400">Actual Cost To Date</div>
          <div className="text-lg font-bold text-emerald-400">₹{liveCostToDate.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-[11px] text-slate-400">Projected Monthly Bill</div>
          <div className="text-lg font-bold text-slate-200">₹{projectedMonthlyCost.toFixed(0)}</div>
        </div>
      </div>

      {/* Budget Usage Meter */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <TrendingUp size={14} className="text-amber-400" /> Projected Budget Limit Usage
          </span>
          <span className="font-semibold text-slate-200">
            ₹{projectedMonthlyCost.toFixed(0)} / ₹{monthlyBudget} ({budgetUsagePercent.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-slate-700 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${getBudgetStatusColor(budgetUsagePercent)}`}
            style={{ width: `${budgetUsagePercent}%` }}
          />
        </div>
      </div>

      {budgetUsagePercent >= 90 && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-xs">
          <AlertTriangle size={16} className="shrink-0" />
          <span>Warning: Active load projection exceeds 90% of your allocated monthly budget threshold!</span>
        </div>
      )}
    </div>
  );
}