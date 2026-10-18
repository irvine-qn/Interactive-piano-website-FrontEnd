import { create } from 'zustand';

export const useWorkspaceStore = create((set) => ({
  // Chế độ mặc định
  currentMode: 'FREE_PLAY', // 'FREE_PLAY' | 'PRACTICE' | 'AUTO_PLAY'
  
  // Mảng chứa tên các nốt nhạc đang được nhấn (ví dụ: ['C4', 'E4'])
  activeKeys: [], 

  // --- ACTIONS ---
  setMode: (mode) => set({ currentMode: mode }),

  // Thêm nốt nhạc vào mảng khi nhấn phím (đảm bảo không bị trùng)
  pressKey: (note) => set((state) => ({
    activeKeys: state.activeKeys.includes(note) 
      ? state.activeKeys 
      : [...state.activeKeys, note]
  })),

  // Xóa nốt nhạc khỏi mảng khi nhả phím
  releaseKey: (note) => set((state) => ({
    activeKeys: state.activeKeys.filter((key) => key !== note)
  })),
}));