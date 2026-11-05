import Key from './Key';
import { KEY_LAYOUT } from '../config/keyLayout';

const PianoKeybed = ({ keyByNote, showHints, isPressed, playbackKeys = {}, onPress, onRelease }) => (
  <div className="relative border-2 border-[var(--color-ink)] bg-[var(--color-piano-wood)] p-[14px]">
    <span
      aria-hidden="true"
      className="absolute inset-x-[6px] top-[3px] h-[2px] bg-[repeating-linear-gradient(90deg,var(--color-piano-wood-grain)_0_8px,transparent_8px_16px)]"
    />
    <div className="h-[10px] border-2 border-[var(--color-ink)] bg-[var(--color-piano-felt)]" />
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
          interactive
          isPressed={isPressed(key.note)}
          playbackHand={playbackKeys[key.note]?.hand ?? null}
          onMouseDown={onPress}
          onMouseUp={onRelease}
        />
      ))}
    </div>
  </div>
);

export default PianoKeybed;
