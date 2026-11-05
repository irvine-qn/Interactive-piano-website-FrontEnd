import { useCallback, useEffect, useMemo, useState } from 'react';
import { getPianoConfig } from '../../home/api/pianoApi';

const OCTAVE = 12;

const getOctaveRange = (notes) => {
  const mapped = notes.filter((n) => typeof n.keyboardKey === 'string').map((n) => n.midi);
  if (!notes.length || !mapped.length) return { min: 0, max: 0 };
  return {
    min: -Math.floor((Math.min(...mapped) - notes[0].midi) / OCTAVE),
    max: Math.floor((notes[notes.length - 1].midi - Math.max(...mapped)) / OCTAVE),
  };
};

const buildMapping = (notes, octaveShift) => {
  const noteByMidi = new Map(notes.map((n) => [n.midi, n.name]));
  const noteByKey = {};
  const keyByNote = {};
  let lowest = null;
  let highest = null;
  notes.forEach(({ midi, keyboardKey }) => {
    if (typeof keyboardKey !== 'string') return;
    const targetMidi = midi + octaveShift * OCTAVE;
    const target = noteByMidi.get(targetMidi);
    if (!target) return;
    noteByKey[keyboardKey] = target;
    keyByNote[target] = keyboardKey;
    if (lowest === null || targetMidi < lowest.midi) lowest = { midi: targetMidi, name: target };
    if (highest === null || targetMidi > highest.midi) highest = { midi: targetMidi, name: target };
  });
  return {
    noteByKey,
    keyByNote,
    // Lấy dải phím theo số MIDI vì khóa dạng số của object luôn đứng đầu
    firstNote: lowest?.name ?? null,
    lastNote: highest?.name ?? null,
    octaveRange: getOctaveRange(notes),
  };
};

export const useKeyMapping = (octaveShift = 0) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState({ key: null, notes: null, error: null });

  useEffect(() => {
    let cancelled = false;
    getPianoConfig()
      .then((config) => {
        if (!cancelled) setResult({ key: reloadKey, notes: config.notes, error: null });
      })
      .catch((error) => {
        if (!cancelled) setResult({ key: reloadKey, notes: null, error });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const mapping = useMemo(() => buildMapping(result.notes ?? [], octaveShift), [result.notes, octaveShift]);
  const retry = useCallback(() => setReloadKey((k) => k + 1), [setReloadKey]);

  const isLoading = result.key !== reloadKey;
  return {
    ...mapping,
    status: isLoading ? 'loading' : result.error ? 'error' : 'ready',
    error: isLoading ? null : result.error,
    retry,
  };
};
