import React from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

const WorkspacePage = () => {
  // Lấy state từ Zustand ra để sử dụng
  const { currentMode } = useWorkspaceStore();

  return (
    <div className="min-h-screen bg-[#cbf0ff] flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black text-gray-800 mb-2 tracking-wide">
          Fiano Workspace
        </h1>
        <p className="text-lg font-medium text-gray-600">
          Chế độ hiện tại: <span className="text-[#f58220] font-bold">{currentMode}</span>
        </p>
      </div>
      
      {/* Khung chứa giả lập cho Bàn phím Piano sẽ code ở bước tiếp theo */}
      <div className="w-full max-w-6xl h-64 bg-white border-4 border-black rounded-xl shadow-[0_8px_0_rgba(0,0,0,1)] flex items-center justify-center">
        <p className="text-gray-400 font-bold text-xl">Piano Keyboard Component</p>
      </div>
    </div>
  );
};

export default WorkspacePage;