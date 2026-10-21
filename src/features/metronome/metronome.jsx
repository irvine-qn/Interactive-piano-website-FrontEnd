import { useCallback, useEffect, useState } from "react";
import { AlarmClock, Minus, Plus } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Metronome = () => {
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

  const sliderMin = config?.minBpm ?? 30;
  const sliderMax = config?.maxBpm ?? 240;
  const sliderValue = bpm ?? 120;
  const sliderFill =
    ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100;
  const stepButtonClass =
    "flex h-7 w-7 cursor-pointer items-center justify-center p-0 border-[1.5px] border-[var(--color-ink)] bg-[var(--color-surface-card)] text-[var(--color-ink)] shadow-[var(--shadow-hard-sm)] disabled:bg-[var(--color-surface-disabled)] disabled:text-[var(--color-line-disabled)]";

  return (
    <section
      aria-label="Metronome controls"
      className="flex items-center gap-5"
    >
      <button
        type="button"
        onClick={toggleMetronome}
        disabled={!config}
        aria-pressed={enabled}
        className={`flex h-9 w-40 cursor-pointer items-center font-[inherit] justify-center gap-2 border-2 border-[var(--color-ink)] text-sm font-bold text-[var(--color-brand-deep)] shadow-[var(--shadow-hard-sm)] disabled:bg-[var(--color-surface-disabled)] ${
          enabled
            ? "bg-[var(--color-brand-tint)]"
            : "bg-[var(--color-surface-card)]"
        }`}
      >
        <AlarmClock
          aria-hidden="true"
          className="h-4 w-4 text-[var(--color-brand-strong)]"
        />
        Metronome {enabled ? "Bật" : "Tắt"}
      </button>
      <div className="flex h-11 items-center gap-3 border-2 border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-[10px]">
        <button
          type="button"
          onClick={() => changeBpm(-1)}
          disabled={!config || bpm <= config.minBpm}
          aria-label="Decrease BPM"
          className={stepButtonClass}
        >
          <Minus aria-hidden="true" className="h-4 w-4" />
        </button>
        <output
          aria-live="polite"
          className="flex w-12 flex-col items-center leading-none"
        >
          <span className="text-[22px] font-bold text-[var(--color-brand)]">
            {bpm ?? ""}
          </span>
          <span className="text-[9px] font-semibold text-[var(--color-neutral-400)]">
            BPM
          </span>
        </output>
        <button
          type="button"
          onClick={() => changeBpm(1)}
          disabled={!config || bpm >= config.maxBpm}
          aria-label="Increase BPM"
          className={stepButtonClass}
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
        </button>
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          value={sliderValue}
          disabled={!config}
          onChange={(event) => setBpm(Number(event.target.value))}
          aria-label="Metronome BPM"
          style={{ "--bpm-fill": `${sliderFill}%` }}
          className="h-2 w-[164px] cursor-pointer appearance-none border-[1.5px] border-[var(--color-ink)] bg-[linear-gradient(to_right,var(--color-brand)_var(--bpm-fill),var(--color-surface-card)_var(--bpm-fill))] [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[10px] [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--color-ink)] [&::-moz-range-thumb]:bg-[var(--color-surface-card)] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[10px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--color-ink)] [&::-webkit-slider-thumb]:bg-[var(--color-surface-card)]"
        />
      </div>
      {error && (
        <p
          role="alert"
          className="text-sm font-semibold text-[var(--color-danger)]"
        >
          {error}
        </p>
      )}
    </section>
  );
};

export default Metronome;
