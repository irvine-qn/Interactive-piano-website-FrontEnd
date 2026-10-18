import React from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import PianoKeyboard from '../components/PianoKeyboard';

const WorkspacePage = () => {
  const { currentMode } = useWorkspaceStore();

  return (
    <div className="min-h-screen bg-[#cbf0ff] flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black text-gray-800 mb-2 tracking-wide">
          Fiano Workspace
        </h1>
        <p className="text-lg font-medium text-gray-600">
          Chế độ hiện tại: <span className="text-[#f58220] font-bold">{currentMode}</span>
        </p>
      </div>
      
      <div className="w-full max-w-[95vw] overflow-x-auto">
        <PianoKeyboard />
      </div>
    </div>
  );
};

export default WorkspacePage;