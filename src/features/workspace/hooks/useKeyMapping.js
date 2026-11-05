import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPianoConfig } from '../../home/api/pianoApi';
import { KEY_LAYOUT } from '../config/keyLayout';

const OCTAVE = 12;
const MIDI_OCTAVE_OFFSET = 1;
const NOTE_BY_MIDI = new Map(KEY_LAYOUT.map(({ midi, note }) => [midi, note]));

const buildMapping = (zones, handOctaves) => {
  const noteByCode = {};
  const handByCode = {};
  const keyByNote = {};
  ['left', 'right'].forEach((hand) => {
    const baseMidi = (handOctaves[hand] + MIDI_OCTAVE_OFFSET) * OCTAVE;
    (zones?.[hand] ?? []).forEach(({ code, label, offset }) => {
      const note = NOTE_BY_MIDI.get(baseMidi + offset);
      if (!note) return;
      noteByCode[code] = note;
      handByCode[code] = hand;
      keyByNote[note] = label;
    });
  });
  return { noteByCode, handByCode, keyByNote };
};

export const useKeyMapping = (handOctaves) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ key: null, practiceKeys: null, error: null });

  useEffect(() => {
    let cancelled = false;
    getPianoConfig()
      .then((config) => {
        if (!cancelled) setResult({ key: reloadKey, practiceKeys: config.practiceKeys, error: null });
      })
      .catch((error) => {
        if (!cancelled) setResult({ key: reloadKey, practiceKeys: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const mapping = useMemo(
    () => buildMapping(result.practiceKeys?.zones, handOctaves),
    [result.practiceKeys, handOctaves],
  );
  const retry = useCallback(() => setReloadKey((k) => k + 1), [setReloadKey]);

  const isLoading = result.key !== reloadKey;
  return {
    ...mapping,
    chordKeys: result.practiceKeys?.chordKeys ?? null,
    octaveRange: result.practiceKeys?.octaveRange ?? { min: 0, max: 0 },
    status: isLoading ? 'loading' : result.error ? 'error' : 'ready',
    error: isLoading ? null : result.error,
    retry,
  };
};
