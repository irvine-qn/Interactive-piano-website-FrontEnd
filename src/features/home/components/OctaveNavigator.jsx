import { ChevronLeft, ChevronRight } from "lucide-react";
import { KEY_LAYOUT } from "../../workspace/config/keyLayout";

const WHITE_KEY_COUNT = KEY_LAYOUT.filter((key) => !key.isBlack).length;
const KEYS_BEFORE_C1 = 2;
const OCTAVE_LABELS = KEY_LAYOUT.filter((key) => /^C\d$/.test(key.note));
const ARROW_CLASS =
  "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 text-[var(--color-ink)] shadow-[var(--shadow-hard-sm)] disabled:cursor-default disabled:text-[var(--color-line-disabled)]";

const OctaveNavigator = ({ startOctave, octaves, minOctave, maxOctave, onMove }) => {
  const startWhite = KEYS_BEFORE_C1 + (startOctave - 1) * 7;
  const endOctave = startOctave + octaves - 1;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={startOctave <= minOctave}
          aria-label="Show lower octaves"
          className={ARROW_CLASS}
        >
          <ChevronLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <div aria-hidden="true" className="relative h-8 flex-1 border-2 border-[var(--color-ink)] bg-[var(--color-key-white)]">
          {KEY_LAYOUT.filter((key) => key.isBlack).map((key) => (
            <span
              key={key.note}
              className="absolute top-0 h-[55%] bg-[var(--color-key-black-mini)]"
              style={{ left: `${key.left}%`, width: `${key.width}%` }}
            />
          ))}
          {OCTAVE_LABELS.map((key) => (
            <span
              key={key.note}
              className="absolute bottom-0 border-l border-[var(--color-line-handle)] pl-[2px] text-[8px] font-bold leading-none text-[var(--color-key-label)]"
              style={{ left: `${key.left}%` }}
            >
              {key.note}
            </span>
          ))}
          <span
            className="absolute -inset-y-[2px] border-2 border-[var(--color-brand)] bg-[var(--color-brand-glow)] opacity-60"
            style={{
              left: `${(startWhite / WHITE_KEY_COUNT) * 100}%`,
              width: `${((octaves * 7) / WHITE_KEY_COUNT) * 100}%`,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={startOctave >= maxOctave}
          aria-label="Show higher octaves"
          className={ARROW_CLASS}
        >
          <ChevronRight aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
      <p aria-live="polite" className="m-0 max-lg:landscape:sr-only text-center text-xs font-semibold text-[var(--color-neutral-500)]">
        Showing C{startOctave} – B{endOctave}
      </p>
    </div>
  );
};

export default OctaveNavigator;
