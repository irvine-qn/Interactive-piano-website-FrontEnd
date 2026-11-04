import { memo } from 'react';

// isPressed: người dùng đang nhấn; playbackHand: 'left' | 'right' | null khi bài nhạc bật sáng phím.
// Hiện 2 trạng thái dùng chung một kiểu sáng; màu theo tay sẽ làm khi restyle bàn phím (T-07E).
// interactive = false (AUTO_PLAY): phím chỉ để xem, con trỏ thường thay vì bàn tay
const Key = ({ note, hint, showHint = true, isBlack, isPressed, playbackHand, interactive = true, onMouseDown, onMouseUp }) => {
  const isActive = isPressed || playbackHand !== null;
  return (
    <div
      data-note={note}
      onMouseDown={() => onMouseDown(note)}
      onMouseUp={() => onMouseUp(note)}
      onMouseLeave={() => onMouseUp(note)}
      // Thêm overflow-hidden và min-w-0 để phím có thể co lại nhỏ hơn cả nội dung text
      className={`
        flex flex-col justify-end items-center pb-1 md:pb-2 ${interactive ? 'cursor-pointer' : 'cursor-default'} select-none border border-gray-400
        transition-all duration-75 ease-in-out w-full h-full overflow-hidden min-w-0
        ${isBlack 
          ? 'bg-black text-white rounded-b-xs' 
          : 'bg-white text-black rounded-b-md relative z-0'
        }
        ${isActive && isBlack ? 'bg-gray-700' : ''}
        ${isActive && !isBlack ? 'bg-gray-300' : ''}
      `}
    >
      {/* Dùng hidden md:block để TỰ ĐỘNG ẨN CHỮ trên màn hình nhỏ/điện thoại */}
      {showHint && hint && (
        <span className={`font-bold hidden md:block ${isBlack ? 'text-[8px] lg:text-[10px] text-white mb-0.5' : 'text-[10px] lg:text-[14px] text-gray-800 mb-1 lg:mb-2'}`}>
          {hint}
        </span>
      )}
      <span className={`font-bold opacity-40 hidden md:block ${isBlack ? 'text-[7px]' : 'text-[9px]'}`}>{note}</span>
    </div>
  );
};

// memo: bàn phím render lại mỗi khi một phím sáng/tắt, nhưng chỉ phím đổi trạng thái mới phải render lại
export default memo(Key);
