import React from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { Music, BookOpen, PlaySquare, Play, Pause, Volume2 } from 'lucide-react';

const MODES = [
  { id: 'FREE_PLAY', label: 'Tự Do', icon: <Music className="w-4 h-4" /> },
  { id: 'PRACTICE', label: 'Luyện Tập', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'AUTO_PLAY', label: 'Tự Động', icon: <PlaySquare className="w-4 h-4" /> },
];

const ControlBar = () => {
  const { currentMode, setMode } = useWorkspaceStore();

  return (
    <div className="w-full bg-white px-4 py-3 flex flex-col z-10 relative">
      
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Cụm 1: Chuyển đổi chế độ (Mode Selector) */}
        <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
          {MODES.map((mode) => {
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setMode(mode.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-[#ff7a1a] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.icon}
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Cụm 2: Timeline Slider (Chỉ hiện rõ khi có bài hát - Auto/Practice) */}
        <div className={`flex-1 w-full flex items-center gap-3 px-4 transition-opacity duration-300 ${currentMode === 'FREE_PLAY' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <span className="text-xs font-bold text-gray-500 w-10 text-right">01:24</span>
          
          <div className="relative flex-1 h-2 bg-gray-200 rounded-full group cursor-pointer">
            {/* Thanh tiến trình đã chạy */}
            <div className="absolute top-0 left-0 h-full bg-[#ff7a1a] rounded-full w-1/3"></div>
            {/* Nút kéo (Thumb) - Chỉ hiện khi di chuột vào */}
            <div className="absolute top-1/2 left-1/3 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-[#ff7a1a] rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"></div>
          </div>
          
          <span className="text-xs font-bold text-gray-500 w-10">03:45</span>
        </div>

        {/* Cụm 3: Điều khiển trình phát & Âm lượng */}
        <div className={`flex items-center gap-3 shrink-0 transition-opacity duration-300 ${currentMode === 'FREE_PLAY' ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          <button className="p-3 rounded-full bg-[#ffe8d1] text-[#e8630a] hover:bg-[#ffd9b8] transition-colors">
            <Play className="w-5 h-5 fill-current" />
          </button>
          <button className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
            <Pause className="w-5 h-5 fill-current" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-1"></div> {/* Kẻ dọc ngăn cách */}
          
          <button className="flex items-center gap-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors group">
            <Volume2 className="w-5 h-5" />
            <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-[#ff7a1a] rounded-full group-hover:bg-[#e8630a] transition-colors"></div>
            </div>
          </button>
        </div>
      </div>

    </div>
  );
};

export default ControlBar;