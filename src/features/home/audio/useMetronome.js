import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { getPianoConfig } from "../api/pianoApi";

const MS_PER_MINUTE = 60000;

const useMetronome = () => {
  const [config, setConfig] = useState(null);
  const [bpm, setBpm] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.004, decay: 0.04, sustain: 0, release: 0.01 },
    }).toDestination();

    return () => {
      synthRef.current?.dispose();
      synthRef.current = null;
    };
  }, []);

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
    synthRef.current?.triggerAttackRelease("A5", 0.05, Tone.now(), 0.12);
  }, []);

  useEffect(() => {
    if (!enabled || !bpm) {
      return undefined;
    }

    let timer;
    const tick = () => {
      try {
        playClick();
        timer = window.setTimeout(tick, MS_PER_MINUTE / bpm);
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
        Tone.start().catch((audioError) => {
          setError(`Unable to start metronome: ${audioError.message}`);
          setEnabled(false);
        });
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
