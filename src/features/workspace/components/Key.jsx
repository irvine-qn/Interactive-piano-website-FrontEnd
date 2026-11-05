import { memo } from 'react';

const WHITE_STYLES = {
  idle: { key: 'bg-[var(--color-key-white)]', name: 'text-[var(--color-key-label)]', bed: 'bg-[var(--color-line-keybed)]', dot: null },
  pressed: { key: 'bg-[var(--color-key-pressed)]', name: 'text-[var(--color-brand)]', bed: 'bg-[var(--color-brand-light)]', dot: 'bg-[var(--color-brand)]' },
  'playback-right': { key: 'bg-[var(--color-key-pressed)]', name: 'text-[var(--color-brand)]', bed: 'bg-[var(--color-brand-light)]', dot: 'bg-[var(--color-brand)]' },
  'playback-left': { key: 'bg-[var(--color-note-blue-top)]', name: 'text-[var(--color-note-blue-end)]', bed: 'bg-[var(--color-note-blue-mid)]', dot: 'bg-[var(--color-note-blue-end)]' },
};
const BLACK_STYLES = {
  idle: 'bg-[var(--color-key-black)]',
  pressed: 'bg-[var(--color-brand-light)]',
  'playback-right': 'bg-[var(--color-brand-light)]',
  'playback-left': 'bg-[var(--color-note-blue-mid)]',
};

const OCTAVE_NUMBER = /-?\d+$/;

const Key = ({ note, left, width, isBlack, hint, showHint = true, isPressed, playbackHand, interactive = true, onMouseDown, onMouseUp }) => {
  const state = isPressed ? 'pressed' : playbackHand ? `playback-${playbackHand}` : 'idle';
  const label = hint && showHint ? `${note}, key ${hint}` : note;

  const handleMouseDown = (event) => {
    event.preventDefault();
    onMouseDown(note);
  };

  const common = {
    type: 'button',
    tabIndex: -1,
    'data-note': note,
    'data-state': state,
    'aria-label': label,
    'aria-pressed': state !== 'idle',
    onMouseDown: handleMouseDown,
    onMouseUp: () => onMouseUp(note),
    onMouseLeave: () => onMouseUp(note),
    style: { left: `${left}%`, width: `${width}%` },
  };
  const cursor = interactive ? 'cursor-pointer' : 'cursor-default';

  if (isBlack) {
    const isIdle = state === 'idle';
    return (
      <button
        {...common}
        className={`absolute top-0 z-10 flex h-[60%] flex-col items-center justify-end overflow-hidden border-[1.5px] border-t-0 border-[var(--color-ink)] px-0 pb-[8px] font-[inherit] ${cursor} ${BLACK_STYLES[state]}`}
      >
        {showHint && hint && <kbd className={`font-[inherit] text-[11px] font-bold leading-none ${isIdle ? 'text-[var(--color-neutral-white)]' : 'text-[var(--color-ink)]'}`}>{hint}</kbd>}
        <span className={`mt-[2px] text-[9px] font-bold leading-none ${isIdle ? 'text-[var(--color-key-label-black)]' : 'text-[var(--color-ink)]'}`}>{note.replace(OCTAVE_NUMBER, '')}</span>
        <span aria-hidden="true" className="mt-[3px] h-1 w-[80%] bg-[var(--color-key-black-edge)]" />
      </button>
    );
  }

  const style = WHITE_STYLES[state];
  return (
    <button
      {...common}
      className={`absolute top-0 flex h-full flex-col items-center justify-end border-[1.5px] border-l-0 border-t-0 border-[var(--color-ink)] px-0 pb-[12px] font-[inherit] ${cursor} ${style.key}`}
    >
      {style.dot && <span aria-hidden="true" className={`mb-[4px] h-[6px] w-[6px] ${style.dot}`} />}
      {showHint && hint && <kbd className="font-[inherit] text-[11px] font-bold text-[var(--color-ink)]">{hint}</kbd>}
      <span className={`text-[11px] font-bold ${style.name}`}>{note}</span>
      <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-[6px] ${style.bed}`} />
    </button>
  );
};

export default memo(Key);
