import { useCallback, useEffect, useState } from "react";
import usePianoSound from "../audio/usePianoSound";
import Waterfall from "../canvas/waterfall";
import KeyLabelSelect from "../../workspace/components/KeyLabelSelect";
import OctaveShiftControl from "../../workspace/components/OctaveShiftControl";
import PianoKeybed from "../../workspace/components/PianoKeybed";
import { KEY_LAYOUT } from "../../workspace/config/keyLayout";
import { useKeyMapping } from "../../workspace/hooks/useKeyMapping";
import { useKeyboardInput } from "../../workspace/hooks/useKeyboardInput";

const DEFAULT_ZONE_OCTAVES = { left: 3, right: 4 };
const WATERFALL_LAYOUT = KEY_LAYOUT.map(({ note, isBlack, left, width }) => ({
  note: { name: note },
  black: isBlack,
  left,
  width,
}));
const NOTE_BY_MIDI = new Map(KEY_LAYOUT.map(({ midi, note }) => [midi, note]));

const Piano = ({ children }) => {
  const [keyLabels, setKeyLabels] = useState("shortcuts");
  const [zoneOctaves, setZoneOctaves] = useState(DEFAULT_ZONE_OCTAVES);
  const [error, setError] = useState("");
  const {
    activeNotes,
    isLoading: isSoundLoading,
    startNote,
    releaseNote,
    releaseNotesFrom,
  } = usePianoSound(setError);
  const {
    noteByCode,
    handByCode,
    keyByNote,
    chordKeys,
    octaveRange,
    error: mappingError,
  } = useKeyMapping(zoneOctaves);

  const pressKey = useCallback(
    (note, source = "mouse") => startNote({ name: note }, source),
    [startNote],
  );
  const releaseKey = useCallback(
    (source = "mouse") => releaseNote(source),
    [releaseNote],
  );
  const releaseMouse = useCallback(() => releaseNote("mouse"), [releaseNote]);
  const moveZone = useCallback(
    (hand, delta, range = octaveRange) =>
      setZoneOctaves((current) => ({
        ...current,
        [hand]: Math.min(range.max, Math.max(range.min, current[hand] + delta)),
      })),
    [octaveRange],
  );

  useKeyboardInput({ noteByCode, handByCode, chordKeys, pressKey, releaseKey, moveZone });

  useEffect(() => {
    if (!navigator.requestMIDIAccess) {
      return undefined;
    }

    let access;
    let connectedInputs = new Map();
    const handleMidiMessage = (input, event) => {
      const [status, midi, velocity] = event.data || [];
      if (status === undefined || midi === undefined) {
        return;
      }
      const command = status & 0xf0;
      const note = NOTE_BY_MIDI.get(midi);
      if (!note) {
        return;
      }

      const source = `midi:${input.id}:${status & 0x0f}:${midi}`;
      if (command === 0x90 && velocity > 0) {
        startNote({ name: note }, source);
      } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
        releaseNote(source);
      }
    };

    const syncInputs = () => {
      if (!access) {
        return;
      }
      const inputs = new Map(access.inputs);
      connectedInputs.forEach((input, id) => {
        if (!inputs.has(id)) {
          input.onmidimessage = null;
          releaseNotesFrom(`midi:${id}:`);
        }
      });
      inputs.forEach((input) => {
        input.onmidimessage = (event) => handleMidiMessage(input, event);
      });
      connectedInputs = inputs;
    };

    navigator
      .requestMIDIAccess()
      .then((midiAccess) => {
        access = midiAccess;
        syncInputs();
        access.onstatechange = syncInputs;
      })
      .catch((midiError) => {
        setError(`Unable to access MIDI devices: ${midiError.message}`);
      });

    return () => {
      if (access) {
        access.onstatechange = null;
      }
      connectedInputs.forEach((input) => {
        input.onmidimessage = null;
      });
    };
  }, [releaseNote, releaseNotesFrom, startNote]);

  const shownError = error || (mappingError ? `Unable to load piano settings: ${mappingError.message}` : "");

  return (
    <section
      aria-label="Virtual piano"
      className="flex min-w-[1200px] flex-col gap-6"
    >
      <Waterfall keyLayout={WATERFALL_LAYOUT} activeNotes={activeNotes} />

      <section
        aria-label="Piano controls"
        className="sticky left-0 flex w-[min(100%,calc(100vw-2rem))] flex-wrap items-center gap-x-5 gap-y-3 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-[14px] py-[12px]"
      >
        {children}
        <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
          <KeyLabelSelect value={keyLabels} onChange={setKeyLabels} />
          <OctaveShiftControl handOctaves={zoneOctaves} onMove={moveZone} />
        </div>
        {isSoundLoading && (
          <p
            role="status"
            className="w-full text-sm font-semibold text-[var(--color-neutral-500)]"
          >
            Loading piano sounds...
          </p>
        )}
        {shownError && (
          <p
            role="alert"
            className="w-full text-sm font-semibold text-[var(--color-danger)]"
          >
            {shownError}
          </p>
        )}
      </section>

      <PianoKeybed
        keyByNote={keyByNote}
        showHints={keyLabels === "shortcuts"}
        isPressed={(note) => activeNotes.has(note)}
        onPress={pressKey}
        onRelease={releaseMouse}
      />
    </section>
  );
};

export default Piano;
