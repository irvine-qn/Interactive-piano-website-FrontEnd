import React, { useEffect } from 'react';
import Key from './Key';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { KEYBOARD_TO_NOTE_MAP, NOTE_TO_KEYBOARD_MAP } from '../config/keyMapping';

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

const PIANO_KEYS_88 = generate88Keys();

// ĐẢM BẢO ĐOẠN NÀY KHÔNG BỊ XÓA (Fix lỗi PIANO_KEYS_61 is not defined)
const PIANO_KEYS_61 = PIANO_KEYS_88.filter(keyObj => {
  const octave = parseInt(keyObj.note.slice(-1));
  if (octave >= 2 && octave <= 6) return true;
  if (keyObj.note === 'C7') return true;
  return false;
});

const PianoKeyboard = () => {
  const { activeKeys, pressKey, releaseKey, currentMode } = useWorkspaceStore();

  const isAutoPlay = currentMode === 'AUTO_PLAY';
  const displayedKeys = currentMode === 'FREE_PLAY' ? PIANO_KEYS_61 : PIANO_KEYS_88;
  const whiteKeys = displayedKeys.filter(k => !k.isBlack);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const note = KEYBOARD_TO_NOTE_MAP[e.key];
      if (note && !e.repeat) pressKey(note);
    };

    const handleKeyUp = (e) => {
      const note = KEYBOARD_TO_NOTE_MAP[e.key];
      if (note) releaseKey(note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressKey, releaseKey]);

  return (
    <div className="flex w-full p-2 sm:p-4 bg-gray-900 rounded-b-lg shadow-2xl h-[120px] sm:h-[180px]">
      <div className="flex w-full h-full relative">
        {whiteKeys.map((whiteKey, idx) => {
          const originalIdx = displayedKeys.findIndex(k => k.note === whiteKey.note);
          const nextKey = displayedKeys[originalIdx + 1];
          const hasBlackKeyAfter = nextKey && nextKey.isBlack;

          return (
            // Thêm min-w-0 ở đây để flexbox cho phép ép cực mỏng
            <div key={whiteKey.note} className="flex-1 relative h-full min-w-0">
               <Key
                 note={whiteKey.note}
                 hint={NOTE_TO_KEYBOARD_MAP[whiteKey.note]}
                 showHint={!isAutoPlay}
                 isBlack={false}
                 isActive={activeKeys.includes(whiteKey.note)}
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
                     hint={NOTE_TO_KEYBOARD_MAP[nextKey.note]}
                     showHint={!isAutoPlay}
                     isBlack={true}
                     isActive={activeKeys.includes(nextKey.note)}
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
  );
};

export default PianoKeyboard;