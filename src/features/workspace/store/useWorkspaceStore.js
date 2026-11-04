import { create } from 'zustand';
import { playNote, stopNote, resetPlayback } from '../../piano/audio/toneEngine'; // Import động cơ âm thanh

export const useWorkspaceStore = create((set, get) => ({
  currentMode: 'AUTO_PLAY', // 'AUTO_PLAY' | 'PRACTICE'
  // Phím người dùng đang nhấn (chuột / bàn phím máy tính)
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
    set({ currentMode: mode, pressedKeys: [], playbackKeys: {} });
  },
  setIsPlaying: (status) => set({ isPlaying: status }),
  setDuration: (time) => set({ duration: time }),
  setSheetLoading: () => set({ sheet: null, sheetStatus: 'loading', sheetError: null }),
  setSheet: (sheet) => set({ sheet, sheetStatus: 'ready', sheetError: null }),
  setSheetError: (error) => set({ sheet: null, sheetStatus: 'error', sheetError: error }),

  pressKey: (note) => {
    const { pressedKeys } = get();
    if (!pressedKeys.includes(note)) {
      playNote(note);
      set({ pressedKeys: [...pressedKeys, note] });
    }
  },

  releaseKey: (note) => {
    const { pressedKeys } = get();
    if (pressedKeys.includes(note)) {
      stopNote(note);
      set({ pressedKeys: pressedKeys.filter((k) => k !== note) });
    }
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
  resetKeys: () => set({ pressedKeys: [], playbackKeys: {} }),
}));
