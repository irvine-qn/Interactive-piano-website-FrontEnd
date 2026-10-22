import { useCallback, useEffect, useRef, useState } from "react";
import Soundfont from 'soundfont-player';
import { getAudioContext as getSharedAudioContext, resumeAudioContext } from "./audioContext";

const PIANO_INSTRUMENT = "acoustic_grand_piano";
// soundfont-player mặc định gain = 1
const NOTE_GAIN = 2;

const usePianoSound = (onError) => {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const instrumentRef = useRef(null);
  const voicesRef = useRef(new Map());

  const getAudioContext = useCallback(
    () => resumeAudioContext(onError),
    [onError],
  );

  const updateActiveNotes = useCallback(() => {
    setActiveNotes(
      new Set(Array.from(voicesRef.current.values(), (voice) => voice.note)),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve()
      .then(() => Soundfont.instrument(getAudioContext(), PIANO_INSTRUMENT))
      .then((instrument) => {
        if (!cancelled) {
          instrumentRef.current = instrument;
          setIsLoading(false);
        }
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
  }, [getAudioContext, onError]);

  const startNote = useCallback(
    (note, source) => {
      if (voicesRef.current.has(source) || !instrumentRef.current) {
        return;
      }
      try {
        const context = getAudioContext();
        const player = instrumentRef.current.play(note.midi, context.currentTime, {
          gain: NOTE_GAIN,
        });
        if (!player) {
          throw new Error("Piano sample is missing");
        }

        voicesRef.current.set(source, {
          note: note.name,
          player,
        });
        updateActiveNotes();
      } catch (audioError) {
        onError(`Unable to play ${note.name}: ${audioError.message}`);
      }
    },
    [getAudioContext, onError, updateActiveNotes],
  );

  const releaseNote = useCallback(
    (source) => {
      const voice = voicesRef.current.get(source);
      if (!voice) {
        return;
      }

      voice.player.stop(getSharedAudioContext().currentTime);
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
      instrumentRef.current?.stop();
      instrumentRef.current = null;
      voicesRef.current.clear();
    },
    [],
  );

  return { activeNotes, isLoading, startNote, releaseNote, releaseNotesFrom };
};

export default usePianoSound;
