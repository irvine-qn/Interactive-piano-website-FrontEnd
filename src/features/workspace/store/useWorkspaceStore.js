import { create } from 'zustand';
import { playNote, stopNote } from '../audio/toneEngine'; // Import động cơ âm thanh

export const useWorkspaceStore = create((set) => ({
  currentMode: 'FREE_PLAY', // 'FREE_PLAY' | 'PRACTICE' | 'AUTO_PLAY'
  activeKeys: [],
  
  setMode: (mode) => set({ currentMode: mode }),
  
  pressKey: (note) => {
    set((state) => {
      // Chỉ phát âm thanh nếu nốt đó chưa nằm trong danh sách đang bấm
      if (!state.activeKeys.includes(note)) {
        playNote(note); // <--- Gọi Tone.js phát tiếng
        return { activeKeys: [...state.activeKeys, note] };
      }
      return state;
    });
  },
  
  releaseKey: (note) => {
    set((state) => {
      if (state.activeKeys.includes(note)) {
        stopNote(note); // <--- Gọi Tone.js ngắt tiếng, tạo độ ngân tự nhiên
        return { activeKeys: state.activeKeys.filter((k) => k !== note) };
      }
      return state;
    });
  }
}));