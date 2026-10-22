import { useCallback, useEffect, useState } from "react";
import { getPianoConfig } from "../api/pianoApi";
import { resumeAudioContext } from "./audioContext";

const useMetronome = () => {
  const [config, setConfig] = useState(null);
  const [bpm, setBpm] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      try {
        const data = await getPianoConfig();
        if (cancelled) {
          return;
        }
        if (
          !Number.isFinite(data.minBpm) ||
          !Number.isFinite(data.maxBpm) ||
          !Number.isFinite(data.defaultBpm) ||
          data.minBpm > data.maxBpm ||
          data.defaultBpm < data.minBpm ||
          data.defaultBpm > data.maxBpm
        ) {
          throw new Error("Piano API returned invalid metronome settings");
        }

        setConfig(data);
        setBpm(data.defaultBpm);
      } catch (loadError) {
        if (!cancelled) {
          setError(`Unable to load metronome settings: ${loadError.message}`);
        }
      }
    };

    loadConfig();
    return () => {
      cancelled = true;
    };
  }, []);

  const playClick = useCallback(() => {
    const context = resumeAudioContext(setError);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }, []);

  useEffect(() => {
    if (!enabled || !bpm) {
      return undefined;
    }

    let timer;
    const tick = () => {
      try {
        playClick();
        timer = window.setTimeout(tick, 60000 / bpm);
      } catch (audioError) {
        setError(`Unable to play metronome: ${audioError.message}`);
        setEnabled(false);
      }
    };

    tick();
    return () => window.clearTimeout(timer);
  }, [bpm, enabled, playClick]);

  const toggleMetronome = () => {
    if (!enabled) {
      try {
        resumeAudioContext(setError);
        setError("");
        setEnabled(true);
      } catch (audioError) {
        setError(`Unable to start metronome: ${audioError.message}`);
      }
      return;
    }

    setEnabled(false);
  };

  const changeBpm = (amount) => {
    setBpm((currentBpm) =>
      Math.max(config.minBpm, Math.min(config.maxBpm, currentBpm + amount)),
    );
  };

  return { config, bpm, setBpm, enabled, error, toggleMetronome, changeBpm };
};

export default useMetronome;
