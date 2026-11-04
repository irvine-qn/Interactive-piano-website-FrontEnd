import { useCallback } from 'react';
import Key from './Key';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useKeyMapping } from '../hooks/useKeyMapping';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { KEY_LAYOUT } from '../config/keyLayout';

const PianoKeyboard = () => {
  const { pressedKeys, playbackKeys, pressKey, releaseKey, currentMode, octaveShift, keyLabels } = useWorkspaceStore(
    useShallow((state) => ({
      pressedKeys: state.pressedKeys,
      playbackKeys: state.playbackKeys,
      pressKey: state.pressKey,
      releaseKey: state.releaseKey,
      currentMode: state.currentMode,
      octaveShift: state.octaveShift,
      keyLabels: state.keyLabels,
    })),
  );

  const { noteByKey, keyByNote, status: mappingStatus, retry: retryMapping } = useKeyMapping(octaveShift);

  const isAutoPlay = currentMode === 'AUTO_PLAY';
  // Nhãn phím tắt theo lựa chọn của người dùng (KeyLabelSelect). AUTO_PLAY không nhận phím máy tính nên luôn ẩn
  const showHints = !isAutoPlay && keyLabels === 'shortcuts';

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
    {/* Khung gỗ + dải nỉ đỏ như bàn phím HomePage */}
    <div className="relative border-2 border-[var(--color-ink)] bg-[var(--color-piano-wood)] p-[14px]">
      <span
        aria-hidden="true"
        className="absolute inset-x-[6px] top-[3px] h-[2px] bg-[repeating-linear-gradient(90deg,var(--color-piano-wood-grain)_0_8px,transparent_8px_16px)]"
      />
      <div className="h-[10px] border-2 border-[var(--color-ink)] bg-[var(--color-piano-felt)]" />
      {/* data-keybed: vùng chứa phím, Waterfall đo vị trí vùng này để đặt nốt theo cùng KEY_LAYOUT */}
      <div
        data-keybed
        role="group"
        aria-label="Piano keyboard"
        className="relative h-[200px] select-none border-l-[1.5px] border-[var(--color-ink)] bg-[var(--color-key-white)]"
      >
        {KEY_LAYOUT.map((key) => (
          <Key
            key={key.note}
            note={key.note}
            left={key.left}
            width={key.width}
            isBlack={key.isBlack}
            hint={keyByNote[key.note]}
            showHint={showHints}
            interactive={!isAutoPlay}
            isPressed={pressedKeys.includes(key.note)}
            playbackHand={playbackKeys[key.note]?.hand ?? null}
            onMouseDown={pressWithMouse}
            onMouseUp={releaseMouse}
          />
        ))}
      </div>
    </div>
    </>
  );
};

export default PianoKeyboard;