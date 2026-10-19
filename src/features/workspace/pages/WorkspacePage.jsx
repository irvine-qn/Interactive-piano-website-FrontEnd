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
      </div>

      {/* TẦNG 2: CONTROL BAR */}
      <div className="w-full border-y border-gray-300 shadow-sm shrink-0">
        <ControlBar />
      </div>

      {/* TẦNG 3 + 4: KHU VỰC CANAVAS & PIANO */}
      {/* Không còn overflow-x-auto nữa, mọi thứ nằm vừa in 100% */}
      <div className="flex-1 w-full flex flex-col items-center">
        
        {/* Đổi lại thành w-full thay vì w-max */}
        <div className="flex flex-col w-full h-full mx-auto px-4">
          
          {/* TẦNG 3: WATERFALL CANVAS CONTAINER */}
          <div className="flex-1 relative w-full bg-[#f8f9fa] bg-opacity-90 border-b-4 border-[#ff7a1a] rounded-t-lg overflow-hidden">
             {/* Tạm thời hiển thị text giữ chỗ */}
             <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                <p className="text-xl font-bold text-gray-500">
                  [{currentMode}] Waterfall Area
                </p>
             </div>
          </div>
          
          {/* TẦNG 4: PIANO KEYBOARD */}
          {/* Bàn phím giờ sẽ tự động co giãn theo width này */}
          <div className="w-full shrink-0 pb-4 pt-0">
            <PianoKeyboard />
          </div>

        </div>
      </div>

    </div>
  );
};

export default WorkspacePage;