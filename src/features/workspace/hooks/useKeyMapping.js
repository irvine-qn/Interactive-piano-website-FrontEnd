import { useCallback, useEffect, useMemo, useState } from 'react';
// Dùng chung bảng ánh xạ phím với HomePage (GET /api/v1/piano: "1" = C1 ... "m" = C6), không sửa file của Home
import { getPianoConfig } from '../../home/api/pianoApi';

// notes: [{ name, keyboardKey }] -> { noteByKey: { "t": "C3" }, keyByNote: { "C3": "t" } }
const buildMapping = (notes) => {
  const noteByKey = {};
  const keyByNote = {};
  (notes ?? []).forEach(({ name, keyboardKey }) => {
    if (typeof keyboardKey !== 'string' || typeof name !== 'string') return;
    noteByKey[keyboardKey] = name;
    keyByNote[name] = keyboardKey;
  });
  return { noteByKey, keyByNote };
};

// Trả bảng ánh xạ + trạng thái tải. Lỗi thì bàn phím máy tính tạm không dùng được (chuột vẫn chơi được).
export const useKeyMapping = () => {
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

  const mapping = useMemo(() => buildMapping(result.notes), [result.notes]);
  const retry = useCallback(() => setReloadKey((k) => k + 1), [setReloadKey]);

  const isLoading = result.key !== reloadKey;
  return {
    ...mapping,
    status: isLoading ? 'loading' : result.error ? 'error' : 'ready',
    error: isLoading ? null : result.error,
    retry,
  };
};
