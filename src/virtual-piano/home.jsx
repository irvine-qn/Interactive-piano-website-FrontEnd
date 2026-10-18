import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [config, setConfig] = useState(null);
  const [bpm, setBpm] = useState(null);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [showKeyboardHints, setShowKeyboardHints] = useState(true);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [error, setError] = useState("");
  const audioContextRef = useRef(null);
  const voicesRef = useRef(new Map());
  const noteByKeyboardKeyRef = useRef(new Map());
  const noteByMidiRef = useRef(new Map());
  const keyboardSourcesRef = useRef(new Map());

  const noteRows = useMemo(() => {
    const rows = [];
    notes.forEach((note) => {
      const octave = Math.floor(note.midi / 12) - 1;
      const lastRow = rows[rows.length - 1];
      if (!lastRow || lastRow.octave !== octave) {
        rows.push({ octave, notes: [note] });
      } else {
        lastRow.notes.push(note);
      }
    });
    return rows;
  }, [notes]);

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
        if (
          !Array.isArray(data.notes) ||
          !Number.isFinite(data.minBpm) ||
          !Number.isFinite(data.maxBpm) ||
          !Number.isFinite(data.defaultBpm) ||
          data.defaultBpm < data.minBpm ||
          data.defaultBpm > data.maxBpm
        ) {
          throw new Error("Piano API returned invalid configuration");
        }

        const validNotes = data.notes.filter(
          (note) =>
            Number.isInteger(note.midi) &&
            typeof note.name === "string" &&
            Number.isFinite(note.frequency) &&
            (typeof note.keyboardKey === "string" || note.keyboardKey === null),
        );
        if (validNotes.length !== data.notes.length || validNotes.length === 0) {
          throw new Error("Piano API returned invalid note data");
        }

        setConfig(data);
        setBpm(data.defaultBpm);
        setNotes(validNotes);
        noteByKeyboardKeyRef.current = new Map(
          validNotes
            .filter((note) => note.keyboardKey)
            .map((note) => [note.keyboardKey, note]),
        );
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

  const getAudioContext = useCallback(() => {
    const AudioContextConstructor =
      window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) {
      throw new Error("Web Audio is not supported by this browser");
    }
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextConstructor();
    }

    const context = audioContextRef.current;
    if (context.state === "suspended") {
      context.resume().catch((audioError) => {
        setError(`Unable to start audio: ${audioError.message}`);
      });
    }
    return context;
  }, []);

  const updateActiveNotes = useCallback(() => {
    setActiveNotes(
      new Set(Array.from(voicesRef.current.values(), (voice) => voice.note)),
    );
  }, []);

  const startNote = useCallback(
    (note, source) => {
      if (voicesRef.current.has(source)) {
        return;
      }
      try {
        const context = getAudioContext();
        const now = context.currentTime;
        const envelope = context.createGain();
        const oscillators = [];
        envelope.gain.setValueAtTime(0.0001, now);
        envelope.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
        envelope.connect(context.destination);

        [[1, 1], [2, 0.24], [3, 0.08]].forEach(([partial, level]) => {
          const oscillator = context.createOscillator();
          const partialGain = context.createGain();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(note.frequency * partial, now);
          partialGain.gain.setValueAtTime(level, now);
          oscillator.connect(partialGain);
          partialGain.connect(envelope);
          oscillator.start(now);
          oscillators.push(oscillator);
        });

        voicesRef.current.set(source, {
          note: note.name,
          envelope,
          oscillators,
        });
        updateActiveNotes();
      } catch (audioError) {
        setError(`Unable to play ${note.name}: ${audioError.message}`);
      }
    },
    [getAudioContext, updateActiveNotes],
  );

  const releaseNote = useCallback(
    (source) => {
      const voice = voicesRef.current.get(source);
      if (!voice) {
        return;
      }

      const context = audioContextRef.current;
      if (context && context.state !== "closed") {
        const now = context.currentTime;
        voice.envelope.gain.cancelScheduledValues(now);
        voice.envelope.gain.setValueAtTime(
          Math.max(voice.envelope.gain.value, 0.0001),
          now,
        );
        voice.envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
        voice.oscillators.forEach((oscillator) => oscillator.stop(now + 0.21));
      }
      voicesRef.current.delete(source);
      updateActiveNotes();
    },
    [updateActiveNotes],
  );

  const playMetronomeClick = useCallback(() => {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.05);
  }, [getAudioContext]);

  useEffect(() => {
    if (!metronomeEnabled || !bpm) {
      return undefined;
    }

    let timer;
    const tick = () => {
      try {
        playMetronomeClick();
        timer = window.setTimeout(tick, 60000 / bpm);
      } catch (audioError) {
        setError(`Unable to play metronome: ${audioError.message}`);
        setMetronomeEnabled(false);
      }
    };
    tick();
    return () => window.clearTimeout(timer);
  }, [bpm, metronomeEnabled, playMetronomeClick]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.repeat ||
        event.target instanceof HTMLElement &&
          event.target.closest("input, textarea, select, [contenteditable=true]")
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
      } else if (command === 0x80 || command === 0x90 && velocity === 0) {
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
          voicesRef.current.forEach((voice, source) => {
            if (source.startsWith(`midi:${id}:`)) {
              releaseNote(source);
            }
          });
        }
      });
      inputs.forEach((input) => {
        input.onmidimessage = (event) => handleMidiMessage(input, event);
      });
      connectedInputs = inputs;
    };

    navigator.requestMIDIAccess()
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
  }, [notes.length, releaseNote, startNote]);

  useEffect(
    () => () => {
      voicesRef.current.forEach((voice) => {
        voice.oscillators.forEach((oscillator) => {
          oscillator.stop();
        });
      });
      voicesRef.current.clear();
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
    },
    [],
  );

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

  const handleMetronomeToggle = () => {
    if (!metronomeEnabled) {
      try {
        getAudioContext();
        setError("");
        setMetronomeEnabled(true);
      } catch (audioError) {
        setError(`Unable to start metronome: ${audioError.message}`);
      }
    } else {
      setMetronomeEnabled(false);
    }
  };

  const changeBpm = (amount) => {
    setBpm((currentBpm) =>
      Math.max(config.minBpm, Math.min(config.maxBpm, currentBpm + amount)),
    );
  };

  return (
    <>
      <header>Virtual Piano</header>
      <main>
        <section aria-label="Piano controls">
          <button
            type="button"
            onClick={handleMetronomeToggle}
            aria-pressed={metronomeEnabled}
          >
            Metronome {metronomeEnabled ? "On" : "Off"}
          </button>
          <button
            type="button"
            onClick={() => changeBpm(-1)}
            disabled={!config || bpm <= config.minBpm}
            aria-label="Decrease BPM"
          >
            -
          </button>
          <output aria-live="polite">{bpm ?? ""} BPM</output>
          <button
            type="button"
            onClick={() => changeBpm(1)}
            disabled={!config || bpm >= config.maxBpm}
            aria-label="Increase BPM"
          >
            +
          </button>
          <input
            type="range"
            min={config?.minBpm ?? 30}
            max={config?.maxBpm ?? 240}
            value={bpm ?? 120}
            disabled={!config}
            onChange={(event) => setBpm(Number(event.target.value))}
            aria-label="Metronome BPM"
          />
          <label>
            <input
              type="checkbox"
              checked={showKeyboardHints}
              onChange={(event) => setShowKeyboardHints(event.target.checked)}
            />
            Show keys
          </label>
        </section>
        {error && <p role="alert">{error}</p>}
        <table aria-label="Virtual piano keyboard">
          <tbody>
            {noteRows.map((row) => (
              <tr key={row.octave}>
                {row.notes.map((note) => (
                  <td key={note.midi}>
                    <button
                      type="button"
                      aria-label={`${note.name}${note.keyboardKey ? `, key ${note.keyboardKey}` : ""}`}
                      aria-pressed={activeNotes.has(note.name)}
                      onPointerDown={(event) => handlePointerDown(note, event)}
                      onPointerUp={handlePointerUp}
                      onPointerCancel={handlePointerUp}
                      onClick={(event) => handleAccessibleClick(note, event)}
                    >
                      {showKeyboardHints && note.keyboardKey && (
                        <kbd>{note.keyboardKey}</kbd>
                      )}
                      <span>{note.name.replace("#", "♯")}</span>
                    </button>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </main>
      <footer>@2026 - Team 5</footer>
    </>
  );
};

export default Home;
