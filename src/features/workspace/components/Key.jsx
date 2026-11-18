import { memo } from 'react';

const WHITE_STYLES = {
  idle: { key: 'bg-[var(--color-key-white)]', name: 'text-[var(--color-key-label)]', bed: 'bg-[var(--color-line-keybed)]', dot: null },
  pressed: { key: 'bg-[var(--color-key-pressed)]', name: 'text-[var(--color-brand-deep)]', bed: 'bg-[var(--color-brand-light)]', dot: 'bg-[var(--color-brand)]' },
  'playback-right': { key: 'bg-[var(--color-key-pressed)]', name: 'text-[var(--color-brand-deep)]', bed: 'bg-[var(--color-brand-light)]', dot: 'bg-[var(--color-brand)]' },
  'playback-left': { key: 'bg-[var(--color-note-blue-top)]', name: 'text-[var(--color-note-blue-end)]', bed: 'bg-[var(--color-note-blue-mid)]', dot: 'bg-[var(--color-note-blue-end)]' },
  'playback-suggest': { key: 'bg-[var(--color-pastel-mint)]', name: 'text-[var(--color-success-strong)]', bed: 'bg-[var(--color-success-bright)]', dot: 'bg-[var(--color-success)]' },
};
const BLACK_STYLES = {
  idle: 'bg-[var(--color-key-black)]',
  pressed: 'bg-[var(--color-brand-light)]',
  'playback-right': 'bg-[var(--color-brand-light)]',
  'playback-left': 'bg-[var(--color-note-blue-mid)]',
  'playback-suggest': 'bg-[var(--color-success-bright)]',
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
        className={`absolute top-0 z-10 flex h-[60%] flex-col [container-type:inline-size] items-center justify-end overflow-hidden border-[1.5px] border-t-0 border-[var(--color-ink)] px-0 pb-[8px] font-[inherit] ${cursor} ${BLACK_STYLES[state]}`}
      >
        {showHint && hint && <kbd aria-hidden="true" className={`pointer-coarse:hidden font-[inherit] text-[min(0.75rem,55cqw)] font-bold leading-none ${isIdle ? 'text-[var(--color-neutral-white)]' : 'text-[var(--color-ink)]'}`}>{hint}</kbd>}
        <span aria-hidden="true" className={`mt-[2px] text-[min(0.75rem,55cqw)] font-bold leading-none ${isIdle ? 'text-[var(--color-key-label-black)]' : 'text-[var(--color-ink)]'}`}>{note.replace(OCTAVE_NUMBER, '')}</span>
        <span aria-hidden="true" className="mt-[3px] h-1 w-[80%] bg-[var(--color-key-black-edge)]" />
      </button>
    );
  }

  const style = WHITE_STYLES[state];
  return (
    <button
      {...common}
      className={`absolute top-0 flex h-full flex-col overflow-hidden [container-type:inline-size] items-center justify-end border-[1.5px] border-l-0 border-t-0 border-[var(--color-ink)] px-0 pb-[12px] font-[inherit] ${cursor} ${style.key}`}
    >
      {style.dot && <span aria-hidden="true" className={`mb-[4px] h-[0.375rem] w-[0.375rem] ${style.dot}`} />}
      {showHint && hint && <kbd aria-hidden="true" className="pointer-coarse:hidden font-[inherit] text-[min(0.75rem,55cqw)] font-bold text-[var(--color-ink)]">{hint}</kbd>}
      <span aria-hidden="true" className={`text-[min(0.75rem,55cqw)] font-bold ${style.name}`}>{note}</span>
      <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-[0.375rem] ${style.bed}`} />
    </button>
  );
};

export default memo(Key);
