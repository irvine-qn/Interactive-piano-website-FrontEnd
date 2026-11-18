import { AlarmClock, Minus, Plus } from "lucide-react";
import useMetronome from "../audio/useMetronome";

const Metronome = () => {
  const { config, bpm, setBpm, enabled, error, toggleMetronome, changeBpm } = useMetronome();

  const sliderMin = config?.minBpm ?? 30;
  const sliderMax = config?.maxBpm ?? 240;
  const sliderValue = bpm ?? 120;
  const sliderFill =
    ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100;
  const stepButtonClass =
    "flex h-7 w-7 cursor-pointer items-center justify-center p-0 border-[1.5px] border-[var(--color-ink)] bg-[var(--color-surface-card)] text-[var(--color-ink)] disabled:bg-[var(--color-surface-disabled)] disabled:text-[var(--color-line-disabled)]";

  return (
    <section
      aria-label="Metronome controls"
      className="flex flex-wrap items-center gap-5 max-lg:gap-3 max-md:portrait:grid max-md:portrait:grid-cols-2 max-lg:landscape:flex-col max-lg:landscape:items-stretch"
    >
      <button
        type="button"
        onClick={toggleMetronome}
        disabled={!config}
        aria-pressed={enabled}
        className={`flex h-9 w-40 max-lg:landscape:w-full max-lg:landscape:h-8 max-lg:landscape:text-xs max-lg:landscape:gap-1 max-lg:landscape:whitespace-nowrap max-md:portrait:h-12 max-md:portrait:w-full max-md:portrait:shadow-[var(--shadow-hard-sm)] cursor-pointer items-center font-[inherit] justify-center gap-2 border-2 border-[var(--color-ink)] text-sm font-bold text-[var(--color-brand-deep)] disabled:bg-[var(--color-surface-disabled)] ${
          enabled
            ? "bg-[var(--color-brand-tint)]"
            : "bg-[var(--color-surface-card)]"
        }`}
      >
        <AlarmClock
          aria-hidden="true"
          className="h-4 w-4 text-[var(--color-brand-deep)]"
        />
        Metronome {enabled ? "On" : "Off"}
      </button>
      <div className="flex h-11 items-center gap-3 max-lg:h-auto max-lg:flex-wrap max-lg:py-2 max-lg:landscape:h-11 max-lg:landscape:flex-nowrap max-lg:landscape:justify-between max-lg:landscape:gap-1 max-lg:landscape:px-1 max-lg:landscape:py-0 max-md:portrait:h-12 max-md:portrait:flex-nowrap max-md:portrait:justify-between max-md:portrait:py-0 max-md:portrait:px-2 border-2 border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-[10px]">
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
          <span className="text-[22px] font-bold text-[var(--color-brand-deep)]">
            {bpm ?? ""}
          </span>
          <span className="text-xs font-semibold text-[var(--color-neutral-400)]">
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
          className="h-2 w-[10.25rem] max-lg:w-full max-md:portrait:hidden max-lg:landscape:hidden cursor-pointer appearance-none border-[1.5px] border-[var(--color-ink)] bg-[linear-gradient(to_right,var(--color-brand)_var(--bpm-fill),var(--color-surface-card)_var(--bpm-fill))] [&::-moz-range-thumb]:h-[1.125rem] [&::-moz-range-thumb]:w-[0.625rem] [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--color-ink)] [&::-moz-range-thumb]:bg-[var(--color-surface-card)] [&::-webkit-slider-thumb]:h-[1.125rem] [&::-webkit-slider-thumb]:w-[0.625rem] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--color-ink)] [&::-webkit-slider-thumb]:bg-[var(--color-surface-card)]"
        />
      </div>
      {error && (
        <p
          role="alert"
          className="text-sm font-semibold text-[var(--color-danger)] max-md:portrait:col-span-2"
        >
          {error}
        </p>
      )}
    </section>
  );
};

export default Metronome;
