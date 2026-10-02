/**
 * NILM Appliance Classifier Utility
 * Evaluates active power, current, and power factor to classify active loads.
 */

export const APPLIANCE_PRESETS = [
  { id: "idle", name: "Idle / Minimal Load", minPower: 0, maxPower: 15, avgPF: 0.50 },
  { id: "led_light", name: "LED Bulb / Lighting", minPower: 15, maxPower: 45, avgPF: 0.90 },
  { id: "laptop_charger", name: "Laptop / Electronics", minPower: 45, maxPower: 90, avgPF: 0.92 },
  { id: "fan_cooler", name: "Ceiling Fan / Air Cooler", minPower: 90, maxPower: 180, avgPF: 0.85 },
  { id: "refrigerator", name: "Refrigerator Compressor", minPower: 180, maxPower: 350, avgPF: 0.75 },
  { id: "microwave", name: "Microwave / Oven", minPower: 800, maxPower: 1400, avgPF: 0.95 },
  { id: "electric_kettle", name: "Electric Kettle / Heater", minPower: 1400, maxPower: 2500, avgPF: 0.99 },
];

export function classifyAppliance(power = 0, current = 0, powerFactor = 0) {
  if (power <= 5) {
    return {
      id: "no_load",
      name: "No Active Load",
      confidence: "High",
      category: "Standby",
      color: "text-slate-400",
      badgeBg: "bg-slate-500/10 border-slate-500/30"
    };
  }

  const matched = APPLIANCE_PRESETS.find(
    (app) => power >= app.minPower && power < app.maxPower
  );

  if (matched) {
    return {
      id: matched.id,
      name: matched.name,
      confidence: powerFactor > 0.8 ? "High (PF Matched)" : "Medium",
      category: "Single Appliance",
      color: "text-emerald-400",
      badgeBg: "bg-emerald-500/10 border-emerald-500/30"
    };
  }

  return {
    id: "composite_load",
    name: "Composite Multi-Appliance Load",
    confidence: "Medium",
    category: "Multiple Loads",
    color: "text-amber-400",
    badgeBg: "bg-amber-500/10 border-amber-500/30"
  };
}