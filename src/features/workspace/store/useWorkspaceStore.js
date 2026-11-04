import { create } from 'zustand';
import { playNote, stopNote, resetPlayback } from '../../piano/audio/toneEngine'; // Import động cơ âm thanh

export const useWorkspaceStore = create((set, get) => ({
  currentMode: 'AUTO_PLAY', // 'AUTO_PLAY' | 'PRACTICE'
  // Nguồn đang giữ phím: { 'mouse' | 'keyboard:<event.code>': note }. Một nốt có thể được nhiều nguồn giữ cùng lúc
  // (chuột + phím máy tính) -> chỉ tắt tiếng khi nguồn cuối cùng nhả.
  pressedSources: {},
  // Danh sách nốt đang được giữ (suy ra từ pressedSources) để vẽ bàn phím
  pressedKeys: [],
  // Phím do bài nhạc bật sáng (Auto-play, sau này là gợi ý của Wait Mode): { [note]: { hand, count } }.
  // count: cùng một nốt có thể được đánh chồng (lần sau bắt đầu trước khi lần trước tắt) nên chỉ tắt khi về 0.
  playbackKeys: {},
  isPlaying: false,
  duration: 250,
  sheet: null, // { id, title, composer, notes, ... } lấy từ API
  sheetStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
  sheetError: null,

  setMode: (mode) => {
    resetPlayback(); // Đổi chế độ thì dừng Transport, quay về 0:00 và tắt âm đang ngân
    set({ currentMode: mode, pressedSources: {}, pressedKeys: [], playbackKeys: {} });
  },
  setIsPlaying: (status) => set({ isPlaying: status }),
  setDuration: (time) => set({ duration: time }),
  setSheetLoading: () => set({ sheet: null, sheetStatus: 'loading', sheetError: null }),
  setSheet: (sheet) => set({ sheet, sheetStatus: 'ready', sheetError: null }),
  setSheetError: (error) => set({ sheet: null, sheetStatus: 'error', sheetError: error }),

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
