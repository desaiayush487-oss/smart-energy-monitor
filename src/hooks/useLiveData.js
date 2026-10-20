import { useState, useEffect } from "react";
import { rtdb as database } from "../config/firebase";
import { ref, onValue } from "firebase/database";

export function useLiveData() {
  const [isRecording, setIsRecording] = useState(true);
  const [history, setHistory] = useState([]);
  const [isOnline, setIsOnline] = useState(false);
  const [simulationOverride, setSimulationOverride] = useState(null);
  
  const [rawLiveData, setRawLiveData] = useState({
    voltage: 0,
    current: 0,
    power: 0,
    energy: 0,
    powerFactor: 0,
    timestamp: Date.now()
  });

  // Function to simulate a live overload spike for demos
  const simulateOverload = () => {
    const fakeData = {
      voltage: 232.4,
      current: 1.23,
      power: 285.4, // Breaches the 250W cutoff threshold!
      energy: rawLiveData.energy + 0.05,
      powerFactor: 0.91,
      timestamp: Date.now()
    };
    setSimulationOverride(fakeData);
    setIsOnline(true);
    
    if (isRecording) {
      setHistory((prev) => [...prev, fakeData]);
    }

    // Reset simulation override back to normal live feed after 12 seconds
    setTimeout(() => {
      setSimulationOverride(null);
    }, 12000);
  };

  useEffect(() => {
    // Skip Firebase updates while simulation override is active
    if (simulationOverride) return;

    const telemetryRef = ref(database, "pzem/live");
    let timeoutId;

    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed = {
          voltage: Number(data.voltage) || 0,
          current: Number(data.current) || 0,
          power: Number(data.power) || 0,
          energy: Number(data.energy) || 0,
          powerFactor: Number(data.powerFactor) || 0,
          timestamp: Date.now()
        };

        setRawLiveData(parsed);
        setIsOnline(true);

        if (isRecording) {
          setHistory((prev) => [...prev, parsed]);
        }

        // Reset 5-second offline timeout on every new data packet
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setIsOnline(false);
        }, 5000);
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [isRecording, simulationOverride]);

  // Use simulation override if active, otherwise fall back to online/offline state
  const activeLiveData = simulationOverride || (isOnline
    ? rawLiveData
    : {
        voltage: 0,
        current: 0,
        power: 0,
        energy: rawLiveData.energy,
        powerFactor: 0,
        status: "OFFLINE"
      });

  const exportCSV = () => {
    if (history.length === 0) return;
    const headers = "timestamp,voltage,current,power,energy,powerFactor\n";
    const rows = history
      .map(
        (d) =>
          `${d.timestamp},${d.voltage},${d.current},${d.power},${d.energy},${d.powerFactor}`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telemetry_dataset_${Date.now()}.csv`;
    a.click();
  };

  return {
    liveData: { ...activeLiveData, status: isOnline ? "ONLINE" : "OFFLINE" },
    history,
    exportCSV,
    isRecording,
    setIsRecording,
    simulateOverload
  };
}