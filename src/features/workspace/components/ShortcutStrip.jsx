import { memo, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { getSongTime } from '../audio/songClock';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

const ACTIVE_POSITION = 1 / 3;
const MAX_ROWS = 4;
const ZONE_ARROWS = {
  left: { up: '\u2192', down: '\u2190' },
  right: { up: '\u2191', down: '\u2193' },
};

const moveArrows = (moves, hand) => ZONE_ARROWS[hand][moves[hand] > 0 ? 'up' : 'down'].repeat(Math.abs(moves[hand]));

const Column = memo(({ chord, moves }) => (
  <div
    role="listitem"
    data-chord={chord.index}
    className="flex w-6 shrink-0 flex-col items-center border-0 border-r border-solid border-[var(--color-line-disabled)] py-0.5 text-xs font-bold text-[var(--color-ink)] data-[active]:bg-[var(--color-brand-tint)]"
  >
    <span aria-label="Move zones" className="h-4 whitespace-nowrap text-xs leading-4 tracking-tighter text-[var(--color-brand-deep)]">
      {moveArrows(moves, 'left')}
      {moveArrows(moves, 'right')}
    </span>
    <div style={{ gridTemplateRows: `repeat(${MAX_ROWS}, 1rem)` }} className="grid justify-items-center">
      {chord.notes
        .filter((note) => note.shortcut)
        .map((note) => (
          <kbd key={note.name} className="font-[inherit] leading-4">
            {note.shortcut}
          </kbd>
        ))}
    </div>
  </div>
));

const findCurrentIndex = (chords, songTime) => {
  let low = 0;
  let high = chords.length - 1;
  let current = -1;
  while (low <= high) {
    const middle = Math.floor((low + high) / 2);
    if (chords[middle].time <= songTime) {
      current = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return current;
};

const ShortcutStrip = () => {
  const { chords, handOctaves } = useWorkspaceStore(
    useShallow((state) => ({ chords: state.sheet?.chords, handOctaves: state.handOctaves })),
  );
  const scrollRef = useRef(null);
  const [nextIndex, setNextIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || !chords) return undefined;
    let frame;
    let activeIndex = -1;

    const paint = () => {
      const currentIndex = findCurrentIndex(chords, getSongTime());
      if (currentIndex !== activeIndex) {
        container.children[activeIndex]?.removeAttribute('data-active');
        const column = container.children[currentIndex];
        column?.setAttribute('data-active', 'true');
        container.scrollLeft = column ? column.offsetLeft - container.clientWidth * ACTIVE_POSITION : 0;
        activeIndex = currentIndex;
        setNextIndex(currentIndex + 1);
      }
      frame = requestAnimationFrame(paint);
    };
    frame = requestAnimationFrame(paint);

    return () => cancelAnimationFrame(frame);
  }, [chords]);

  if (!chords) return null;

  const nextChord = chords[nextIndex];
  const liveMoves = nextChord && {
    left: nextChord.octaves.left - handOctaves.left,
    right: nextChord.octaves.right - handOctaves.right,
  };

  return (
    <div className="mb-3 flex border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)]">
      <span className="flex shrink-0 items-center border-0 border-r-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-3 text-xs font-bold uppercase tracking-wide text-[var(--color-neutral-600)]">
        Shortcuts
      </span>
      <div
        ref={scrollRef}
        role="list"
        aria-label="Keys to press"
        className="relative flex min-w-0 flex-1 overflow-x-auto"
      >
        {chords.map((chord) => (
          <Column key={chord.index} chord={chord} moves={chord.index === nextIndex ? liveMoves : chord.zoneMoves} />
        ))}
      </div>
    </div>
  );
};

export default ShortcutStrip;
