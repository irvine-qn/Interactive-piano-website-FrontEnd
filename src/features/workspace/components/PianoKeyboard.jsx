import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import PianoKeybed from './PianoKeybed';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { useKeyMapping } from '../hooks/useKeyMapping';
import { useKeyboardInput } from '../hooks/useKeyboardInput';
import { useMidiInput } from '../hooks/useMidiInput';

const PianoKeyboard = () => {
  const { pressedKeys, playbackKeys, pressKey, releaseKey, handOctaves, keyLabels, moveHandOctave } = useWorkspaceStore(
    useShallow((state) => ({
      pressedKeys: state.pressedKeys,
      playbackKeys: state.playbackKeys,
      pressKey: state.pressKey,
      releaseKey: state.releaseKey,
      handOctaves: state.handOctaves,
      keyLabels: state.keyLabels,
      moveHandOctave: state.moveHandOctave,
    })),
  );

  const { noteByCode, handByCode, keyByNote, chordKeys, octaveRange, status: mappingStatus, retry: retryMapping } = useKeyMapping(handOctaves);
  const moveZone = useCallback((hand, delta) => moveHandOctave(hand, delta, octaveRange), [moveHandOctave, octaveRange]);

  useKeyboardInput({ noteByCode, handByCode, chordKeys, pressKey, releaseKey, moveZone });
  useMidiInput({ pressKey, releaseKey });

  const pressWithMouse = useCallback((note) => pressKey(note, 'mouse'), [pressKey]);
  const releaseMouse = useCallback(() => releaseKey('mouse'), [releaseKey]);

  return (
    <>
      {mappingStatus === 'error' && (
        <p role="alert" className="m-0 mb-2 flex items-center pointer-coarse:hidden! gap-3 text-sm font-semibold text-[var(--color-danger)]">
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
      <PianoKeybed
        keyByNote={keyByNote}
        showHints={keyLabels === 'shortcuts'}
        isPressed={(note) => pressedKeys.includes(note)}
        playbackKeys={playbackKeys}
        onPress={pressWithMouse}
        onRelease={releaseMouse}
      />
    </>
  );
};

export default PianoKeyboard;
