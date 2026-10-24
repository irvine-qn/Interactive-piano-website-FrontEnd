import { create } from 'zustand';
import { playNote, stopNote, resetPlayback } from '../audio/toneEngine'; // Import động cơ âm thanh

export const useWorkspaceStore = create((set, get) => ({
  currentMode: 'FREE_PLAY', // 'FREE_PLAY' | 'PRACTICE' | 'AUTO_PLAY'
  activeKeys: [],
  isPlaying: false,
  duration: 250,
  sheet: null, // { id, title, composer, notes, ... } lấy từ API
  sheetStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'error'
  sheetError: null,
  
  setMode: (mode) => {
    resetPlayback(); // Đổi chế độ thì dừng Transport, quay về 0:00 và tắt âm đang ngân
    set({ currentMode: mode, activeKeys: [] });
  },
  setIsPlaying: (status) => set({ isPlaying: status }),
  setDuration: (time) => set({ duration: time }),
  setSheetLoading: () => set({ sheet: null, sheetStatus: 'loading', sheetError: null }),
  setSheet: (sheet) => set({ sheet, sheetStatus: 'ready', sheetError: null }),
  setSheetError: (error) => set({ sheet: null, sheetStatus: 'error', sheetError: error }),
  
  pressKey: (note) => {
    const { activeKeys } = get(); // Đọc state bằng get()
    
    if (!activeKeys.includes(note)) {
      playNote(note); 
      set({ activeKeys: [...activeKeys, note] }); // Chỉ dùng set để cập nhật UI
    }
  },
  
  releaseKey: (note) => {
    const { activeKeys } = get();
    
    if (activeKeys.includes(note)) {
      stopNote(note); 
      set({ activeKeys: activeKeys.filter((k) => k !== note) });
    }
  },

  // Chỉ đổi màu phím (không phát tiếng) - dùng cho Auto-play, âm thanh do Tone.Part lo
  highlightKey: (note) => {
    const { activeKeys } = get();
    if (!activeKeys.includes(note)) set({ activeKeys: [...activeKeys, note] });
  },

  unhighlightKey: (note) => {
    const { activeKeys } = get();
    if (activeKeys.includes(note)) set({ activeKeys: activeKeys.filter((k) => k !== note) });
  },

  clearActiveKeys: () => set({ activeKeys: [] })
}));
