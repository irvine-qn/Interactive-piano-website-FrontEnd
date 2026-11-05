import { useEffect, useRef } from 'react';
import { pianoSampler } from '../../piano/audio/toneEngine';

export const volumeToDb = (baseDb, percent) => (percent <= 0 ? -Infinity : baseDb + 20 * Math.log10(percent / 100));

// Trả lại âm lượng gốc khi rời trang vì sampler dùng chung với Home
export const useWorkspaceVolume = (percent) => {
  const baseDbRef = useRef(null);

  // Effect này phải chạy trước để lưu mức gốc trước khi bị đổi
  useEffect(() => {
    baseDbRef.current = pianoSampler.volume.value;
    return () => {
      pianoSampler.volume.value = baseDbRef.current;
    };
  }, []);

  useEffect(() => {
    pianoSampler.volume.value = volumeToDb(baseDbRef.current, percent);
  }, [percent]);
};
