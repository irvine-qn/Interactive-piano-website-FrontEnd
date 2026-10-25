import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { pianoSampler } from "../../piano/audio/toneEngine";

const usePianoSound = (onError) => {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const voicesRef = useRef(new Map());
  const noteCountsRef = useRef(new Map());

  const updateActiveNotes = useCallback(() => {
    setActiveNotes(
      new Set(voicesRef.current.values()),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    Tone.loaded()
      .then(() => {
        if (!cancelled) setIsLoading(false);
      })
      .catch((loadError) => {
        if (!cancelled) {
          onError(`Unable to load piano sound: ${loadError.message}`);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [onError]);

  const startNote = useCallback(
    (note, source) => {
      if (voicesRef.current.has(source) || !pianoSampler.loaded) {
        return;
      }
      try {
        if (Tone.getContext().state !== "running") {
          Tone.start().catch((audioError) =>
            onError(`Unable to start audio: ${audioError.message}`),
          );
        }
        const count = noteCountsRef.current.get(note.name) ?? 0;
        if (count === 0) pianoSampler.triggerAttack(note.name);
        noteCountsRef.current.set(note.name, count + 1);
        voicesRef.current.set(source, note.name);
        updateActiveNotes();
      } catch (audioError) {
        onError(`Unable to play ${note.name}: ${audioError.message}`);
      }
    },
    [onError, updateActiveNotes],
  );

  const releaseNote = useCallback(
    (source) => {
      const voice = voicesRef.current.get(source);
      if (!voice) {
        return;
      }

      const count = noteCountsRef.current.get(voice) ?? 0;
      if (count <= 1) {
        pianoSampler.triggerRelease(voice);
        noteCountsRef.current.delete(voice);
      } else {
        noteCountsRef.current.set(voice, count - 1);
      }
      voicesRef.current.delete(source);
      updateActiveNotes();
    },
    [updateActiveNotes],
  );

  const releaseNotesFrom = useCallback(
    (sourcePrefix) => {
      voicesRef.current.forEach((voice, source) => {
        if (source.startsWith(sourcePrefix)) {
          releaseNote(source);
        }
      });
    },
    [releaseNote],
  );

  useEffect(
    () => () => {
      new Set(voicesRef.current.values()).forEach((note) =>
        pianoSampler.triggerRelease(note),
      );
      voicesRef.current.clear();
      noteCountsRef.current.clear();
    },
    [],
  );

  return { activeNotes, isLoading, startNote, releaseNote, releaseNotesFrom };
};

export default usePianoSound;
