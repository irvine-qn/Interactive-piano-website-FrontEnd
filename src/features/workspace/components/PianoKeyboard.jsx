import { useCallback } from 'react';
import Key from './Key';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useKeyMapping } from '../hooks/useKeyMapping';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { KEY_LAYOUT } from '../config/keyLayout';

const PianoKeyboard = () => {
  const { pressedKeys, playbackKeys, pressKey, releaseKey, currentMode, octaveShift } = useWorkspaceStore(
    useShallow((state) => ({
      pressedKeys: state.pressedKeys,
      playbackKeys: state.playbackKeys,
      pressKey: state.pressKey,
      releaseKey: state.releaseKey,
      currentMode: state.currentMode,
      octaveShift: state.octaveShift,
    })),
  );

  const { noteByKey, keyByNote, status: mappingStatus, retry: retryMapping } = useKeyMapping(octaveShift);

  const isAutoPlay = currentMode === 'AUTO_PLAY';

  useKeyboardInput({ noteByKey, pressKey, releaseKey });

  // Chuột là một nguồn riêng ('mouse'); callback ổn định để memo của Key còn tác dụng
  const pressWithMouse = useCallback((note) => pressKey(note, 'mouse'), [pressKey]);
  const releaseMouse = useCallback(() => releaseKey('mouse'), [releaseKey]);

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
      {/* data-keybed: vùng chứa phím, Waterfall đo vị trí vùng này để đặt nốt theo cùng KEY_LAYOUT */}
      <div data-keybed className="relative h-full w-full">
        {KEY_LAYOUT.map((key) => (
          <div
            key={key.note}
            className={`absolute top-0 ${key.isBlack ? 'z-10 h-[65%]' : 'h-full'}`}
            style={{ left: `${key.left}%`, width: `${key.width}%` }}
          >
            <Key
              note={key.note}
              hint={keyByNote[key.note]}
              showHint={!isAutoPlay}
              interactive={!isAutoPlay}
              isBlack={key.isBlack}
              isPressed={pressedKeys.includes(key.note)}
              playbackHand={playbackKeys[key.note]?.hand ?? null}
              onMouseDown={pressWithMouse}
              onMouseUp={releaseMouse}
            />
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default PianoKeyboard;