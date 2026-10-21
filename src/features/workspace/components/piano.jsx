import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Keyboard } from "lucide-react";
import { API_BASE_URL } from "../../../config/api";
import usePianoSound from "../audio/usePianoSound";
import Waterfall from "../canvas/waterfall";

const BLACK_KEY_RATIO = 0.62;
const OCTAVE_SIZE = 12;

const Piano = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [showKeyboardHints, setShowKeyboardHints] = useState(true);
  const [octaveShift, setOctaveShift] = useState(0);
  const [error, setError] = useState("");
  const {
    activeNotes,
    isLoading: isSoundLoading,
    startNote,
    releaseNote,
    releaseNotesFrom,
  } = usePianoSound(setError);
  const noteByKeyboardKeyRef = useRef(new Map());
  const noteByMidiRef = useRef(new Map());
  const keyboardSourcesRef = useRef(new Map());

  const keyLayout = useMemo(() => {
    const whiteWidth =
      100 / notes.filter((note) => !note.name.includes("#")).length;
    return notes.map((note, index) => {
      const whiteIndex = notes
        .slice(0, index)
        .filter((previous) => !previous.name.includes("#")).length;
      if (note.name.includes("#")) {
        const width = whiteWidth * BLACK_KEY_RATIO;
        return {
          note,
          black: true,
          left: whiteIndex * whiteWidth - width / 2,
          width,
        };
      }
      return {
        note,
        black: false,
        left: whiteIndex * whiteWidth,
        width: whiteWidth,
      };
    });
  }, [notes]);

  const octaveRange = useMemo(() => {
    const mappedMidis = notes
      .filter((note) => note.keyboardKey)
      .map((note) => note.midi);
    if (!mappedMidis.length) {
      return { min: 0, max: 0 };
    }
    return {
      min: -Math.floor(
        (Math.min(...mappedMidis) - notes[0].midi) / OCTAVE_SIZE,
      ),
      max: Math.floor(
        (notes[notes.length - 1].midi - Math.max(...mappedMidis)) / OCTAVE_SIZE,
      ),
    };
  }, [notes]);

  const keyboardMapping = useMemo(() => {
    const noteByMidi = new Map(notes.map((note) => [note.midi, note]));
    const noteByKey = new Map();
    notes.forEach((note) => {
      const shiftedNote = noteByMidi.get(note.midi + octaveShift * OCTAVE_SIZE);
      if (note.keyboardKey && shiftedNote) {
        noteByKey.set(note.keyboardKey, shiftedNote);
      }
    });
    const mappedNotes = Array.from(noteByKey.values());
    return {
      noteByKey,
      keyByNote: new Map(
        Array.from(noteByKey, ([key, note]) => [note.name, key]),
      ),
      firstNote: mappedNotes[0]?.name ?? "",
      lastNote: mappedNotes[mappedNotes.length - 1]?.name ?? "",
    };
  }, [notes, octaveShift]);

  useEffect(() => {
    noteByKeyboardKeyRef.current = keyboardMapping.noteByKey;
  }, [keyboardMapping]);

  useEffect(() => {
    const controller = new AbortController();

    const loadPiano = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/piano`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Piano API returned ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data.notes)) {
          throw new Error("Piano API returned invalid note data");
        }

        const validNotes = data.notes.filter(
          (note) =>
            Number.isInteger(note.midi) &&
            typeof note.name === "string" &&
            Number.isFinite(note.frequency) &&
            (typeof note.keyboardKey === "string" || note.keyboardKey === null),
        );
        if (
          validNotes.length !== data.notes.length ||
          validNotes.length === 0
        ) {
          throw new Error("Piano API returned invalid note data");
        }

        setNotes(validNotes);
        noteByMidiRef.current = new Map(
          validNotes.map((note) => [note.midi, note]),
        );
      } catch (loadError) {
        if (loadError.name !== "AbortError") {
          setError(`Unable to load piano settings: ${loadError.message}`);
        }
      }
    };

    loadPiano();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.repeat ||
        (event.target instanceof HTMLElement &&
          event.target.closest(
            "input, textarea, select, [contenteditable=true]",
          ))
      ) {
        return;
      }

      const note = noteByKeyboardKeyRef.current.get(event.key);
      if (!note) {
        return;
      }
      event.preventDefault();
      const source = `keyboard:${event.code}`;
      keyboardSourcesRef.current.set(event.code, source);
      startNote(note, source);
    };

    const handleKeyUp = (event) => {
      const source = keyboardSourcesRef.current.get(event.code);
      if (source) {
        releaseNote(source);
        keyboardSourcesRef.current.delete(event.code);
      }
    };

    const releaseKeyboardNotes = () => {
      keyboardSourcesRef.current.forEach((source) => releaseNote(source));
      keyboardSourcesRef.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", releaseKeyboardNotes);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", releaseKeyboardNotes);
      releaseKeyboardNotes();
    };
  }, [releaseNote, startNote]);

  useEffect(() => {
    if (!notes.length || !navigator.requestMIDIAccess) {
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
      const note = noteByMidiRef.current.get(midi);
      if (!note) {
        return;
      }

      const source = `midi:${input.id}:${status & 0x0f}:${midi}`;
      if (command === 0x90 && velocity > 0) {
        startNote(note, source);
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
  }, [notes.length, releaseNote, releaseNotesFrom, startNote]);

  const handlePointerDown = (note, event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    startNote(note, `pointer:${event.pointerId}`);
  };

  const handlePointerUp = (event) => {
    releaseNote(`pointer:${event.pointerId}`);
  };

  const handleAccessibleClick = (note, event) => {
    if (event.detail !== 0) {
      return;
    }
    const source = `click:${note.midi}`;
    startNote(note, source);
    window.setTimeout(() => releaseNote(source), 250);
  };

  return (
    <section
      aria-label="Virtual piano"
      className="flex min-w-[1200px] flex-col gap-6"
    >
      <Waterfall keyLayout={keyLayout} activeNotes={activeNotes} />

      <section
        aria-label="Piano controls"
        className="flex flex-wrap items-center gap-x-5 gap-y-3 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-[14px] py-[12px] shadow-[var(--shadow-hard)]"
      >
        {children}
        <label className="ml-10 flex items-center gap-2 text-sm font-bold text-[var(--color-ink)]">
          <Keyboard
            aria-hidden="true"
            className="h-4 w-4 text-[var(--color-brand-strong)]"
          />
          Hiển thị phím:
          <span className="relative ml-4 flex">
            <select
              value={showKeyboardHints ? "hints" : "names"}
              onChange={(event) =>
                setShowKeyboardHints(event.target.value === "hints")
              }
              className="h-9 w-[186px] cursor-pointer appearance-none font-[inherit] border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] pl-3 pr-8 text-sm font-bold text-[var(--color-brand-strong)] outline-none"
            >
              <option value="hints">Phím tắt + Tên nốt</option>
              <option value="names">Tên nốt</option>
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink)]"
            />
          </span>
        </label>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm font-bold text-[var(--color-neutral-600)]">
            Octave Shift:
          </span>
          <div className="flex h-10 items-center border-2 border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-1">
            <button
              type="button"
              onClick={() => setOctaveShift((shift) => shift - 1)}
              disabled={octaveShift <= octaveRange.min}
              aria-label="Shift keyboard down one octave"
              className="h-7 w-10 cursor-pointer border-0 bg-transparent font-[inherit] text-sm font-bold text-[var(--color-ink)] disabled:cursor-default disabled:text-[var(--color-line-disabled)]"
            >
              -1
            </button>
            <output
              aria-live="polite"
              className="flex h-7 w-24 items-center justify-center border-[1.5px] border-[var(--color-ink)] bg-[var(--color-surface-card)] text-sm font-bold text-[var(--color-brand-deep)]"
            >
              {keyboardMapping.firstNote}-{keyboardMapping.lastNote} (
              {octaveShift > 0 ? `+${octaveShift}` : octaveShift})
            </output>
            <button
              type="button"
              onClick={() => setOctaveShift((shift) => shift + 1)}
              disabled={octaveShift >= octaveRange.max}
              aria-label="Shift keyboard up one octave"
              className="h-7 w-10 cursor-pointer border-0 bg-transparent font-[inherit] text-sm font-bold text-[var(--color-ink)] disabled:cursor-default disabled:text-[var(--color-line-disabled)]"
            >
              +1
            </button>
          </div>
        </div>
        {isSoundLoading && (
          <p
            role="status"
            className="w-full text-sm font-semibold text-[var(--color-neutral-500)]"
          >
            Đang tải âm thanh piano...
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="w-full text-sm font-semibold text-[var(--color-danger)]"
          >
            {error}
          </p>
        )}
      </section>

      <div className="relative border-2 border-[var(--color-ink)] bg-[var(--color-piano-wood)] p-[14px] shadow-[var(--shadow-hard-lg)]">
        <span
          aria-hidden="true"
          className="absolute inset-x-[6px] top-[3px] h-[2px] bg-[repeating-linear-gradient(90deg,var(--color-piano-wood-grain)_0_8px,transparent_8px_16px)]"
        />
        <div className="h-[10px] border-2 border-[var(--color-ink)] bg-[var(--color-piano-felt)]" />
        <div
          role="group"
          aria-label="Virtual piano keyboard"
          className="relative h-[200px] select-none border-l-[1.5px] border-[var(--color-ink)]"
        >
          {keyLayout.map(({ note, black, left, width }) => {
            const isActive = activeNotes.has(note.name);
            const keyboardKey = keyboardMapping.keyByNote.get(note.name);
            return (
              <button
                key={note.midi}
                type="button"
                aria-label={`${note.name}${keyboardKey ? `, key ${keyboardKey}` : ""}`}
                aria-pressed={isActive}
                onPointerDown={(event) => handlePointerDown(note, event)}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onClick={(event) => handleAccessibleClick(note, event)}
                style={{ left: `${left}%`, width: `${width}%` }}
                className={
                  black
                    ? `absolute top-0 z-10 flex px-0 font-[inherit] h-[60%] flex-col items-center justify-end border-[1.5px] border-t-0 border-[var(--color-ink)] pb-[8px] shadow-[var(--shadow-hard-sm)] ${
                        isActive
                          ? "bg-[var(--color-brand-light)]"
                          : "bg-[var(--color-key-black)]"
                      }`
                    : `absolute top-0 flex h-full px-0 font-[inherit] flex-col items-center justify-end border-[1.5px] border-l-0 border-t-0 border-[var(--color-ink)] pb-[12px] ${
                        isActive
                          ? "bg-[var(--color-key-pressed)]"
                          : "bg-[var(--color-key-white)]"
                      }`
                }
              >
                {black ? (
                  <>
                    {showKeyboardHints && keyboardKey && (
                      <kbd className="font-[inherit] text-[9px] font-bold text-[var(--color-brand-light)]">
                        {keyboardKey}
                      </kbd>
                    )}
                    <span className="text-[9px] font-bold text-[var(--color-key-label-black)]">
                      {note.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-[3px] h-1 w-[80%] bg-[var(--color-key-black-edge)]"
                    />
                  </>
                ) : (
                  <>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="mb-[4px] h-[6px] w-[6px] bg-[var(--color-brand)]"
                      />
                    )}
                    {showKeyboardHints && keyboardKey && (
                      <kbd className="font-[inherit] text-[11px] font-bold text-[var(--color-ink)]">
                        {keyboardKey}
                      </kbd>
                    )}
                    <span
                      className={`text-[11px] font-bold ${
                        isActive
                          ? "text-[var(--color-brand)]"
                          : "text-[var(--color-key-label)]"
                      }`}
                    >
                      {note.name}
                    </span>
                    <span
                      aria-hidden="true"
                      className={`absolute inset-x-0 bottom-0 h-[6px] ${
                        isActive
                          ? "bg-[var(--color-brand-light)]"
                          : "bg-[var(--color-line-keybed)]"
                      }`}
                    />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Piano;
