import { create } from 'zustand';
import { playNote, stopNote, resetPlayback } from '../../piano/audio/toneEngine'; // Import động cơ âm thanh
import { setPlaybackRate as applyPlaybackRate } from '../audio/songClock';

export const useWorkspaceStore = create((set, get) => ({
  currentMode: 'AUTO_PLAY', // 'AUTO_PLAY' | 'PRACTICE'
  // Nguồn đang giữ phím: { 'mouse' | 'keyboard:<event.code>': note }. Một nốt có thể được nhiều nguồn giữ cùng lúc
  // (chuột + phím máy tính) -> chỉ tắt tiếng khi nguồn cuối cùng nhả.
  pressedSources: {},
  // Danh sách nốt đang được giữ (suy ra từ pressedSources) để vẽ bàn phím
  pressedKeys: [],
  // Dịch bảng phím tắt theo quãng: 0 = C1-C6, +1 = C2-C7 (phạm vi lấy từ useKeyMapping().octaveRange)
  octaveShift: 0,
  // Phím do bài nhạc bật sáng (Auto-play, sau này là gợi ý của Wait Mode): { [note]: { hand, count } }.
  // count: cùng một nốt có thể được đánh chồng (lần sau bắt đầu trước khi lần trước tắt) nên chỉ tắt khi về 0.
  playbackKeys: {},
  isPlaying: false,
  // Âm lượng của Workspace (0-100%, 100 = mức gốc của sampler). Giữ trong store để đổi bài vẫn nhớ
  volume: 100,
  // Tốc độ phát so với bản gốc (0.5 - 1.5). Nạp bài mới thì về 1 (xem loadSheet)
  playbackRate: 1,
  duration: 250,
  sheet: null, // { id, title, composer, notes, ... } lấy từ API
  sheetStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
  sheetError: null,

  setMode: (mode) => {
    resetPlayback(); // Đổi chế độ thì dừng Transport, quay về 0:00 và tắt âm đang ngân
    set({ currentMode: mode, pressedSources: {}, pressedKeys: [], playbackKeys: {} });
  },
  setIsPlaying: (status) => set({ isPlaying: status }),
  setVolume: (volume) => set({ volume: Math.min(100, Math.max(0, volume)) }),
  // Đổi Transport.bpm (cả âm thanh, waterfall, timeline cùng co giãn) và lưu lại để UI hiển thị
  setPlaybackRate: (rate) => {
    applyPlaybackRate(rate);
    set({ playbackRate: rate });
  },
  setDuration: (time) => set({ duration: time }),
  setSheetLoading: () => set({ sheet: null, sheetStatus: 'loading', sheetError: null }),
  setSheet: (sheet) => set({ sheet, sheetStatus: 'ready', sheetError: null }),
  setSheetError: (error) => set({ sheet: null, sheetStatus: 'error', sheetError: error }),
  // Cập nhật lượt xem sau khi BE đếm (bỏ qua nếu đã chuyển sang bài khác)
  setSheetViews: (id, views) => {
    const { sheet } = get();
    if (sheet?.id === id) set({ sheet: { ...sheet, views } });
  },

  // source: 'mouse' hoặc 'keyboard:<event.code>' (xem useKeyboardInput)
  pressKey: (note, source = 'mouse') => {
    const { pressedSources, currentMode } = get();
    // AUTO_PLAY: bài tự phát, người dùng chỉ xem. Chuột và bàn phím đều đi qua đây nên chặn một chỗ là đủ.
    if (currentMode === 'AUTO_PLAY') return;
    if (pressedSources[source]) return;
    const alreadyHeld = Object.values(pressedSources).includes(note);
    if (!alreadyHeld) playNote(note);
    const next = { ...pressedSources, [source]: note };
    set({ pressedSources: next, pressedKeys: [...new Set(Object.values(next))] });
  },

  releaseKey: (source = 'mouse') => {
    const { pressedSources } = get();
    const note = pressedSources[source];
    if (!note) return;
    const next = { ...pressedSources };
    delete next[source];
    const stillHeld = Object.values(next).includes(note);
    if (!stillHeld) stopNote(note);
    set({ pressedSources: next, pressedKeys: [...new Set(Object.values(next))] });
  },

  // Đổi quãng thì phím máy tính đang giữ sẽ trỏ sang nốt khác -> nhả chúng trước (chuột giữ nguyên vì không đổi nốt)
  setOctaveShift: (octaveShift) => {
    const { pressedSources, octaveShift: current } = get();
    if (octaveShift === current) return;
    const next = Object.fromEntries(Object.entries(pressedSources).filter(([source]) => !source.startsWith('keyboard:')));
    const stillHeld = new Set(Object.values(next));
    new Set(Object.values(pressedSources)).forEach((note) => {
      if (!stillHeld.has(note)) stopNote(note);
    });
    set({ octaveShift, pressedSources: next, pressedKeys: [...stillHeld] });
  },

  setPlaybackKey: (note, hand) => {
    const { playbackKeys } = get();
    const count = (playbackKeys[note]?.count ?? 0) + 1;
    set({ playbackKeys: { ...playbackKeys, [note]: { hand, count } } });
  },

  clearPlaybackKey: (note) => {
    const { playbackKeys } = get();
    const current = playbackKeys[note];
    if (!current) return;
    const rest = { ...playbackKeys };
    if (current.count > 1) rest[note] = { ...current, count: current.count - 1 };
    else delete rest[note];
    set({ playbackKeys: rest });
  },

  // Dừng / tua: âm thanh đã bị tắt hết (stopAllNotes) nên tắt luôn mọi phím đang sáng
  resetKeys: () => set({ pressedSources: {}, pressedKeys: [], playbackKeys: {} }),
}));
