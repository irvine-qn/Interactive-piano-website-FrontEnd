import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useKeyMapping } from '../hooks/useKeyMapping';

const SHIFT_BUTTON_CLASS =
  'h-7 w-10 cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-sm font-bold text-[var(--color-ink)] disabled:cursor-default disabled:text-[var(--color-line-disabled)]';

const OctaveShiftControl = () => {
  const { octaveShift, setOctaveShift, currentMode } = useWorkspaceStore(
    useShallow((state) => ({
      octaveShift: state.octaveShift,
      setOctaveShift: state.setOctaveShift,
      currentMode: state.currentMode,
    })),
  );
  const { firstNote, lastNote, octaveRange, status } = useKeyMapping(octaveShift);

  const locked = currentMode === 'AUTO_PLAY' || status !== 'ready';
  const label = firstNote && lastNote ? `${firstNote}-${lastNote}` : '--';
  const shiftText = octaveShift > 0 ? `+${octaveShift}` : `${octaveShift}`;
  const hint = currentMode === 'AUTO_PLAY' ? 'Keyboard shortcuts are used in Wait Mode' : undefined;

  return (
    <div className="flex items-center gap-3" title={hint}>
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--color-neutral-600)]">Octave Shift</span>
      <div
        role="group"
        aria-label="Octave shift"
        className={`flex h-10 items-center border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-1 ${locked ? 'opacity-60' : ''}`}
      >
        <button
          type="button"
          onClick={() => setOctaveShift(octaveShift - 1)}
          disabled={locked || octaveShift <= octaveRange.min}
          aria-label="Shift keyboard down one octave"
          className={SHIFT_BUTTON_CLASS}
        >
          -1
        </button>
        <output
          aria-live="polite"
          className="flex h-7 w-24 items-center justify-center border-[1.5px] border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] text-sm font-bold text-[var(--color-brand-deep)]"
        >
          {label} ({shiftText})
        </output>
        <button
          type="button"
          onClick={() => setOctaveShift(octaveShift + 1)}
          disabled={locked || octaveShift >= octaveRange.max}
          aria-label="Shift keyboard up one octave"
          className={SHIFT_BUTTON_CLASS}
        >
          +1
        </button>
      </div>
    </div>
  );
};

export default OctaveShiftControl;
