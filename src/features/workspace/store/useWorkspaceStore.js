import { create } from 'zustand';
import { playNote, stopNote } from '../audio/toneEngine'; // Import động cơ âm thanh

export const useWorkspaceStore = create((set, get) => ({
  currentMode: 'FREE_PLAY', // 'FREE_PLAY' | 'PRACTICE' | 'AUTO_PLAY'
  activeKeys: [],
  isPlaying: false,
  duration: 250,
  
  setMode: (mode) => set({ currentMode: mode }),
  setIsPlaying: (status) => set({ isPlaying: status }),
  setDuration: (time) => set({ duration: time }),
  
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
  }
}));