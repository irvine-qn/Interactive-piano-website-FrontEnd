import React from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import PianoKeyboard from '../components/PianoKeyboard';
import ControlBar from '../components/ControlBar';

const WorkspacePage = () => {
  const { currentMode } = useWorkspaceStore();

  return (
    <div className="min-h-screen bg-[#cbf0ff] flex flex-col font-sans">
      
      {/* TẦNG 1: HEADER (INFO SHEET) */}
      <div className="w-full pt-4 pb-4 text-center shrink-0">
        <h1 className="text-3xl font-black text-gray-800 tracking-wider">
          FIANO<span className="text-[#ff7a1a]">.</span>
        </h1>
        {/* Sau này Info Sheet (Tên bài hát, tác giả...) sẽ nằm ở đây */}
      </div>

      {/* TẦNG 2: CONTROL BAR (FULL WIDTH) */}
      <div className="w-full border-y border-gray-300 shadow-sm shrink-0">
        {/* Bên trong ControlBar hiện tại đang có margin và max-width, ta sẽ xóa max-width ở file kia sau */}
        <ControlBar />
      </div>

      {/* TẦNG 3: WATERFALL CANVAS (FLEX-1 ĐỂ ĐẨY PIANO XUỐNG ĐÁY) */}
      <div className="flex-1 w-full flex items-center justify-center relative bg-white bg-opacity-40">
         {currentMode !== 'FREE_PLAY' ? (
           <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
             <p className="text-2xl font-bold text-gray-500">Khu vực hiển thị Sheet nhạc / Waterfall đang được xây dựng...</p>
           </div>
         ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
             <p className="text-2xl font-bold text-gray-500">Free Play Mode</p>
           </div>
         )}
      </div>
      
      {/* TẦNG 4: PIANO KEYBOARD */}
      <div className="w-full max-w-[95vw] mx-auto shrink-0 pb-4 pt-2">
        <PianoKeyboard />
      </div>

    </div>
  );
};

export default WorkspacePage;