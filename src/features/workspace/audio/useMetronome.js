import { useCallback, useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/api";

const useMetronome = () => {
  const [config, setConfig] = useState(null);
  const [bpm, setBpm] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState("");
  const [audioContext, setAudioContext] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/piano`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Piano API returned ${response.status}`);
        }

        const data = await response.json();
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
        if (loadError.name !== "AbortError") {
          setError(`Unable to load metronome settings: ${loadError.message}`);
        }
      }
    };

    loadConfig();
    return () => controller.abort();
  }, []);

  const getAudioContext = useCallback(() => {
    const AudioContextConstructor =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      throw new Error("Web Audio is not supported by this browser");
    }

    const context = audioContext || new AudioContextConstructor();
    if (!audioContext) {
      setAudioContext(context);
    }
    if (context.state === "suspended") {
      context.resume().catch((audioError) => {
        setError(`Unable to start audio: ${audioError.message}`);
      });
    }
    return context;
  }, [audioContext]);

  const playClick = useCallback(() => {
    const context = getAudioContext();
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
  }, [getAudioContext]);

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

  useEffect(
    () => () => {
      if (audioContext && audioContext.state !== "closed") {
        audioContext.close();
      }
    },
    [audioContext],
  );

  const toggleMetronome = () => {
    if (!enabled) {
      try {
        getAudioContext();
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
