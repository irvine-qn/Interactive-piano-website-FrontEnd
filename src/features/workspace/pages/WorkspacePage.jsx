import React, { useEffect } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import PianoKeyboard from '../components/PianoKeyboard';
import ControlBar from '../components/ControlBar';
import WaterfallCanvas from '../components/WaterfallCanvas';
import { loadSheet, disposeSheet } from '../audio/sheetPlayer';
import sheetData from '../audio/merry-christmas.json';

const WorkspacePage = () => {
  const { currentMode } = useWorkspaceStore();

  useEffect(() => {
    loadSheet(sheetData.notes);
    return disposeSheet;
  }, []);

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
      {/* Đã gộp thẻ div bị thừa. Dùng flex-1 trực tiếp ở đây để đẩy khu vực này lấp đầy màn hình */}
      <div className="flex-1 flex flex-col w-full mx-auto px-4 mt-2">
          
          {/* TẦNG 3: WATERFALL CANVAS CONTAINER (Sẽ tự động chiếm hết khoảng trống nhờ flex-1) */}
          <div className="flex-1 relative w-full bg-[#f8f9fa] bg-opacity-90 border-b-4 border-[#ff7a1a] rounded-t-lg overflow-hidden">
             <WaterfallCanvas />
          </div>
          
          {/* TẦNG 4: PIANO KEYBOARD (shrink-0 để luôn giữ nguyên kích thước không bị bóp méo) */}
          <div className="w-full shrink-0 pb-4 pt-0">
            <PianoKeyboard />
          </div>

      </div>

    </div>
  );
};

export default WorkspacePage;