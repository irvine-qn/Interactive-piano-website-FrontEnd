import { useEffect } from 'react';
import Key from './Key';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useKeyMapping } from '../hooks/useKeyMapping';

const NOTES_IN_OCTAVE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const generate88Keys = () => {
  const keys = [];
  keys.push({ note: 'A0', isBlack: false }, { note: 'A#0', isBlack: true }, { note: 'B0', isBlack: false });
  for (let octave = 1; octave <= 7; octave++) {
    NOTES_IN_OCTAVE.forEach(note => {
      keys.push({ note: `${note}${octave}`, isBlack: note.includes('#') });
    });
  }
  keys.push({ note: 'C8', isBlack: false });
  return keys;
};

// Workspace luôn hiển thị đủ 88 phím (A0 - C8)
const PIANO_KEYS_88 = generate88Keys();
const WHITE_KEYS_88 = PIANO_KEYS_88.filter(k => !k.isBlack);

const PianoKeyboard = () => {
  const { pressedKeys, playbackKeys, pressKey, releaseKey, currentMode } = useWorkspaceStore(
    useShallow((state) => ({
      pressedKeys: state.pressedKeys,
      playbackKeys: state.playbackKeys,
      pressKey: state.pressKey,
      releaseKey: state.releaseKey,
      currentMode: state.currentMode,
    })),
  );

  const { noteByKey, keyByNote, status: mappingStatus, retry: retryMapping } = useKeyMapping();

  const isAutoPlay = currentMode === 'AUTO_PLAY';
  const displayedKeys = PIANO_KEYS_88;
  const whiteKeys = WHITE_KEYS_88;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const note = noteByKey[e.key];
      if (note && !e.repeat) pressKey(note);
    };

    const handleKeyUp = (e) => {
      const note = noteByKey[e.key];
      if (note) releaseKey(note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [noteByKey, pressKey, releaseKey]);

  return (
    <>
    {mappingStatus === 'error' && (
      <p role="alert" className="m-0 mb-2 flex items-center gap-3 text-sm font-semibold text-[var(--color-danger)]">
        Keyboard shortcuts are unavailable (could not load the key map). You can still play with the mouse.
        <button
          type="button"
          onClick={retryMapping}
          className="cursor-pointer border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-3 py-1 font-[inherit] text-xs font-bold text-[var(--color-ink)]"
        >
          Retry
        </button>
      </p>
    )}
    <div className="flex w-full p-2 sm:p-4 bg-gray-900 rounded-b-lg h-[120px] sm:h-[180px]">
      <div className="flex w-full h-full relative">
        {whiteKeys.map((whiteKey) => {
          const originalIdx = displayedKeys.findIndex(k => k.note === whiteKey.note);
          const nextKey = displayedKeys[originalIdx + 1];
          const hasBlackKeyAfter = nextKey && nextKey.isBlack;

          return (
            <div key={whiteKey.note} className="flex-1 relative h-full min-w-0">
               <Key
                 note={whiteKey.note}
                 hint={keyByNote[whiteKey.note]}
                 showHint={!isAutoPlay}
                 interactive={!isAutoPlay}
                 isBlack={false}
                 isPressed={pressedKeys.includes(whiteKey.note)}
                 playbackHand={playbackKeys[whiteKey.note]?.hand ?? null}
                 onMouseDown={pressKey}
                 onMouseUp={releaseKey}
               />
               
               {hasBlackKeyAfter && (
                 <div 
                   className="absolute top-0 right-0 z-10" 
                   style={{ width: '60%', height: '65%', transform: 'translateX(50%)' }}
                 >
                   <Key
                     note={nextKey.note}
                     hint={keyByNote[nextKey.note]}
                     showHint={!isAutoPlay}
                     interactive={!isAutoPlay}
                     isBlack={true}
                     isPressed={pressedKeys.includes(nextKey.note)}
                     playbackHand={playbackKeys[nextKey.note]?.hand ?? null}
                     onMouseDown={pressKey}
                     onMouseUp={releaseKey}
                   />
                 </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
    </>
  );
};

export default PianoKeyboard;