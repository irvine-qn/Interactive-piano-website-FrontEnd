import React from 'react';

const Key = ({ note, isBlack, isActive, onMouseDown, onMouseUp }) => {
  return (
    <div
      onMouseDown={() => onMouseDown(note)}
      onMouseUp={() => onMouseUp(note)}
      onMouseLeave={() => onMouseUp(note)}
      className={`
        relative flex justify-center items-end pb-2 cursor-pointer select-none rounded-b-md border border-gray-400
        transition-all duration-75 ease-in-out
        ${isBlack 
          ? 'bg-black text-white w-6 h-32 -mx-3 z-10' 
          : 'bg-white text-black w-10 h-48 z-0'
        }
        ${isActive && isBlack ? 'bg-gray-700' : ''}
        ${isActive && !isBlack ? 'bg-gray-300 shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)]' : 'shadow-[0_4px_6px_rgba(0,0,0,0.1)]'}
      `}
      style={isBlack ? { position: 'relative', left: '0' } : {}}
    >
      <span className="text-[10px] font-bold opacity-50">{note}</span>
    </div>
  );
};

export default Key;