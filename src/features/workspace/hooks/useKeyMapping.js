import { useCallback, useEffect, useMemo, useState } from 'react';
// Dùng chung bảng ánh xạ phím với HomePage (GET /api/v1/piano: "1" = C1 ... "m" = C6), không sửa file của Home
import { getPianoConfig } from '../../home/api/pianoApi';

const OCTAVE = 12;

// Phạm vi dịch quãng như Home: phím tắt (C1-C6) còn nằm trong dải nốt của cấu hình (C1-C7) -> 0 .. +1
const getOctaveRange = (notes) => {
  const mapped = notes.filter((n) => typeof n.keyboardKey === 'string').map((n) => n.midi);
  if (!notes.length || !mapped.length) return { min: 0, max: 0 };
  return {
    min: -Math.floor((Math.min(...mapped) - notes[0].midi) / OCTAVE),
    max: Math.floor((notes[notes.length - 1].midi - Math.max(...mapped)) / OCTAVE),
  };
};

// notes: [{ midi, name, keyboardKey }], octaveShift: số quãng dịch lên (+) / xuống (-)
// -> { noteByKey: { "s": "C4" }, keyByNote: { "C4": "s" }, firstNote, lastNote, octaveRange }
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
    // Dải phím tắt đang phủ, vd. "C1"-"C6" (nhãn Octave Shift). Lấy theo số MIDI thấp/cao nhất, không theo thứ tự
    // khoá của object: JS luôn xếp khoá dạng số ("0"-"9") lên trước nên phím "0" (E2) sẽ đứng đầu thay cho "1" (C1)
    firstNote: lowest?.name ?? null,
    lastNote: highest?.name ?? null,
    octaveRange: getOctaveRange(notes),
  };
};

// Trả bảng ánh xạ (đã dịch theo octaveShift) + trạng thái tải.
// Lỗi thì bàn phím máy tính tạm không dùng được (chuột vẫn chơi được).
export const useKeyMapping = (octaveShift = 0) => {
  const [reloadKey, setReloadKey] = useState(0);
  // Kết quả gắn với lần tải (reloadKey) để suy ra "đang tải" mà không cần setState trong effect
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
