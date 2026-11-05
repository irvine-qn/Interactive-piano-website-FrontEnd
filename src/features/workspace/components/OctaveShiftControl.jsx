import { useKeyMapping } from '../hooks/useKeyMapping';

const SHIFT_BUTTON_CLASS =
  'h-7 w-7 cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-sm font-bold text-[var(--color-ink)] disabled:cursor-default disabled:text-[var(--color-line-disabled)]';
const ZONES = [
  { hand: 'left', label: 'Zone 1' },
  { hand: 'right', label: 'Zone 2' },
];

const OctaveShiftControl = ({ handOctaves, onMove, automatic = false }) => {
  const { octaveRange, status } = useKeyMapping(handOctaves);
  const locked = automatic || status !== 'ready';

  return (
    <div className="flex items-center gap-3" title={automatic ? 'Zones follow the song in Play mode' : undefined}>
      {ZONES.map(({ hand, label }) => (
        <div
          key={hand}
          role="group"
          aria-label={`${label} position`}
          className={`flex h-10 items-center border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-1 ${locked ? 'opacity-60' : ''}`}
        >
          <button
            type="button"
            onClick={() => onMove(hand, -1, octaveRange)}
            disabled={locked || handOctaves[hand] <= octaveRange.min}
            aria-label={`Move ${label} down one octave`}
            className={SHIFT_BUTTON_CLASS}
          >
            -
          </button>
          <output
            aria-live="polite"
            className="flex h-7 w-24 items-center justify-center border-[1.5px] border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] text-sm font-bold text-[var(--color-brand-deep)]"
          >
            {label}: C{handOctaves[hand]}
          </output>
          <button
            type="button"
            onClick={() => onMove(hand, 1, octaveRange)}
            disabled={locked || handOctaves[hand] >= octaveRange.max}
            aria-label={`Move ${label} up one octave`}
            className={SHIFT_BUTTON_CLASS}
          >
            +
          </button>
        </div>
      ))}
    </div>
  );
};

export default OctaveShiftControl;
