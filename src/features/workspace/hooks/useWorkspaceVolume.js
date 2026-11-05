import { useEffect, useRef } from 'react';
import { pianoSampler } from '../../piano/audio/toneEngine';

// Đổi % âm lượng (0-100) sang dB so với mức gốc: 100% = gốc, 50% = gốc - 6 dB, 0% = tắt tiếng
export const volumeToDb = (baseDb, percent) => (percent <= 0 ? -Infinity : baseDb + 20 * Math.log10(percent / 100));

// Âm lượng chỉ áp dụng trong Workspace: sampler dùng chung với HomePage, nên lưu mức gốc lúc vào trang
// và trả lại đúng mức đó khi rời trang (unmount) để Home không bị ảnh hưởng.
export const useWorkspaceVolume = (percent) => {
  const baseDbRef = useRef(null);

  // Effect này khai báo trước nên chạy trước effect đặt âm lượng bên dưới -> mức gốc được lưu trước khi bị đổi
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
