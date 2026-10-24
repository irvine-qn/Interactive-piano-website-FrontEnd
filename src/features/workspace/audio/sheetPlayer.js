import * as Tone from 'tone';
import { pianoSampler, resetPlayback } from './toneEngine';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

let part = null;
let endEventId = null;

export const disposeSheet = () => {
  if (part) {
    part.dispose();
    part = null;
  }
  if (endEventId !== null) {
    Tone.Transport.clear(endEventId);
    endEventId = null;
  }
  resetPlayback();
};

// Lên lịch toàn bộ bài lên Tone.Transport. Âm thanh chỉ phát ở chế độ AUTO_PLAY;
// ở các chế độ khác Transport vẫn chạy để Waterfall có đồng hồ chung.
export const loadSheet = (notes) => {
  disposeSheet();

  const store = useWorkspaceStore.getState();
  const songEnd = notes.reduce((max, n) => Math.max(max, n.time + n.duration), 0);
  store.setDuration(Math.ceil(songEnd));

  part = new Tone.Part((time, n) => {
    if (useWorkspaceStore.getState().currentMode !== 'AUTO_PLAY') return;
    if (pianoSampler.loaded) {
      pianoSampler.triggerAttackRelease(n.name, n.duration, time, n.velocity);
    }
    // Tone.Draw chạy callback đúng frame hiển thị khớp với thời điểm phát tiếng
    Tone.Draw.schedule(() => useWorkspaceStore.getState().highlightKey(n.name), time);
    Tone.Draw.schedule(() => useWorkspaceStore.getState().unhighlightKey(n.name), time + n.duration);
  }, notes.map((n) => [n.time, n])).start(0);

  // Hết bài thì tự dừng và quay về 0:00
  endEventId = Tone.Transport.scheduleOnce(() => Tone.Transport.stop(), songEnd + 0.5);
};
