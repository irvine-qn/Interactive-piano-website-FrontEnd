import { useCallback, useEffect, useState } from "react";
import { MIN_VIEW_OCTAVE, useOctaveView } from "../../../hooks/useOctaveView";
import usePianoSound from "../audio/usePianoSound";
import OctaveNavigator from "./OctaveNavigator";
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
  const { mode, view, viewOctave, maxViewOctave, moveView, renderInView } = useOctaveView({
    portrait: DEFAULT_ZONE_OCTAVES.right,
    landscape: DEFAULT_ZONE_OCTAVES.left,
  });
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

    let cancelled = false;
    // Chi xin quyen MIDI khi da duoc cap san hoac sau thao tac dau tien (tranh popup luc tai trang, giu bfcache)
    const gestures = ["pointerdown", "keydown"];
    const removeGestureListeners = () =>
      gestures.forEach((type) => window.removeEventListener(type, requestAccess));
    function requestAccess() {
      removeGestureListeners();
      if (cancelled || access) return;
      navigator
        .requestMIDIAccess({ sysex: false })
        .then((midiAccess) => {
          if (cancelled) return;
          access = midiAccess;
          syncInputs();
          access.onstatechange = syncInputs;
        })
        .catch(() => {});
    }
    gestures.forEach((type) => window.addEventListener(type, requestAccess, { once: true }));
    navigator.permissions
      ?.query({ name: "midi" })
      .then((status) => {
        if (status.state === "granted") requestAccess();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      removeGestureListeners();
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
      className="flex min-w-[75rem] flex-col gap-6 max-md:portrait:min-w-0 max-md:portrait:gap-4 max-md:portrait:pt-5 max-lg:landscape:grid max-lg:landscape:min-w-0 max-lg:landscape:grid-cols-[9rem_minmax(0,1fr)] max-lg:landscape:grid-rows-[auto_auto_auto_1fr] max-lg:landscape:gap-x-3 max-lg:landscape:gap-y-2 max-lg:landscape:pt-2"
    >
      <div className="max-lg:landscape:col-start-2 max-lg:landscape:[&_canvas]:h-[clamp(4rem,calc(60dvh-9.5rem),9rem)]">
        {renderInView(<Waterfall keyLayout={WATERFALL_LAYOUT} activeNotes={activeNotes} />)}
      </div>

      <section
        aria-label="Piano controls"
        className="sticky left-0 z-10 flex w-[min(100%,calc(100vw-2rem))] flex-wrap items-center gap-x-5 gap-y-3 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-[14px] py-[12px] max-lg:landscape:col-start-1 max-lg:landscape:row-span-4 max-lg:landscape:row-start-1 max-lg:landscape:w-auto max-lg:landscape:flex-col max-lg:landscape:flex-nowrap max-lg:landscape:items-stretch max-lg:landscape:self-start max-lg:landscape:mt-6 max-lg:landscape:gap-y-2 max-lg:landscape:px-2 max-lg:landscape:py-2 max-lg:landscape:shadow-[var(--shadow-hard-sm)] max-lg:landscape:[&_label]:flex-col max-lg:landscape:[&_label]:items-stretch max-lg:landscape:[&_label]:gap-1 max-lg:landscape:[&_label]:text-[10px] max-lg:landscape:[&_label]:text-center max-lg:landscape:[&_label>svg]:hidden max-lg:landscape:[&_label>span]:ml-0 max-lg:landscape:[&_select]:w-full max-lg:landscape:[&_select]:h-8 max-lg:landscape:[&_select]:text-xs max-lg:landscape:[&_select]:pl-2 max-lg:landscape:[&_select]:pr-6 max-lg:landscape:[&_[role=group]]:h-8 max-lg:landscape:[&_[role=group]]:px-0 max-lg:landscape:[&_[role=group]]:gap-0 max-lg:landscape:[&_output.w-24]:h-6 max-lg:landscape:[&_output.w-24]:w-auto max-lg:landscape:[&_output.w-24]:flex-1 max-lg:landscape:[&_output.w-24]:text-[11px] max-lg:landscape:[&_[role=group]_button]:w-6 max-md:portrait:flex-col max-md:portrait:items-stretch max-md:portrait:gap-y-4 max-md:portrait:px-4 max-md:portrait:py-4 max-md:portrait:shadow-[var(--shadow-hard-sm)] max-md:portrait:[&_label]:justify-between max-md:portrait:[&_label>span:last-child]:flex-1 max-md:portrait:[&_select]:w-full max-md:portrait:[&_select]:h-11"
      >
        {children}
        <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2 max-lg:ml-0 max-lg:landscape:flex-col max-lg:landscape:items-stretch">
          <div className="contents pointer-coarse:hidden!">
            <KeyLabelSelect value={keyLabels} onChange={setKeyLabels} />
          </div>
          <div className="contents pointer-coarse:hidden! max-lg:landscape:flex max-lg:landscape:flex-col max-lg:landscape:gap-2 max-lg:landscape:[&>div]:flex-col max-lg:landscape:[&>div]:items-stretch max-lg:landscape:[&>div]:gap-2">
            <OctaveShiftControl handOctaves={zoneOctaves} onMove={moveZone} />
          </div>
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

      {view && (
        <div className="max-lg:landscape:col-start-2">
          <OctaveNavigator
            startOctave={viewOctave}
            octaves={view.octaves}
            minOctave={MIN_VIEW_OCTAVE}
            maxOctave={maxViewOctave}
            onMove={moveView}
          />
        </div>
      )}

      <div className="max-lg:landscape:col-start-2 max-lg:landscape:[&_[data-keybed]]:h-[clamp(6.5rem,35dvh,12rem)]">
        {renderInView(
          <PianoKeybed
            keyByNote={keyByNote}
            showHints={keyLabels === "shortcuts"}
            isPressed={(note) => activeNotes.has(note)}
            onPress={pressKey}
            onRelease={releaseMouse}
          />,
        )}
      </div>

      {mode === "portrait" && (
        <aside className="border-2 border-l-8 border-[var(--color-info)] bg-[var(--color-info-tint)] px-4 py-3">
          <p className="m-0 text-sm font-bold text-[var(--color-info-deep)]">Tip: rotate your screen</p>
          <p className="m-0 mt-1 text-sm text-[var(--color-info-deep)]">Landscape mode shows 4 octaves at once.</p>
        </aside>
      )}
    </section>
  );
};

export default Piano;
