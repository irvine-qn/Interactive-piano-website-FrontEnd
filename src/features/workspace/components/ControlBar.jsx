import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { stopAllNotes } from '../../piano/audio/toneEngine';
import { BookOpen, PlaySquare, Play, Pause, Volume2 } from 'lucide-react';

// AUTO_PLAY là chế độ mặc định nên đứng đầu (tên hiển thị sẽ đổi khi restyle Control Bar ở T-08A)
const MODES = [
  { id: 'AUTO_PLAY', label: 'Auto', icon: <PlaySquare className="w-4 h-4" /> },
  { id: 'PRACTICE', label: 'Practice', icon: <BookOpen className="w-4 h-4" /> },
];

const ControlBar = () => {
  // Chỉ đăng ký các field cần dùng: Control Bar không render lại mỗi khi một phím sáng/tắt (pressedKeys, playbackKeys)
  const { currentMode, setMode, isPlaying, setIsPlaying, duration, resetKeys } = useWorkspaceStore(
    useShallow((state) => ({
      currentMode: state.currentMode,
      setMode: state.setMode,
      isPlaying: state.isPlaying,
      setIsPlaying: state.setIsPlaying,
      duration: state.duration,
      resetKeys: state.resetKeys,
    })),
  );
  const progressBarRef = useRef(null);
  const currentTimeRef = useRef(null);
  const progressFillRef = useRef(null);
  const requestRef = useRef();
  const isDragging = useRef(false);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    function updateProgress() {
      if (
        progressBarRef.current &&
        currentTimeRef.current &&
        progressFillRef.current &&
        !isDragging.current
      ) {
        const currentTime = Tone.Transport.seconds;
        progressBarRef.current.value = currentTime;
        currentTimeRef.current.innerText = formatTime(currentTime);

        const percentage = duration > 0 ? (currentTime / duration) * 100 : 0;
        progressFillRef.current.style.width = `${percentage}%`;

        const thumb = document.getElementById('progress-thumb');
        if (thumb) thumb.style.left = `calc(${percentage}% - 8px)`;
      }
      requestRef.current = requestAnimationFrame(updateProgress);
    }

    const handleStart = () => setIsPlaying(true);
    // Pause/Stop: tắt âm đang ngân và tắt highlight các phím Auto-play
    const handleHalt = () => {
      setIsPlaying(false);
      stopAllNotes();
      resetKeys();
    };

    Tone.Transport.on('start', handleStart);
    Tone.Transport.on('pause', handleHalt);
    Tone.Transport.on('stop', handleHalt);

    requestRef.current = requestAnimationFrame(updateProgress);

    return () => {
      cancelAnimationFrame(requestRef.current);
      Tone.Transport.off('start', handleStart);
      Tone.Transport.off('pause', handleHalt);
      Tone.Transport.off('stop', handleHalt);
    };
  }, [setIsPlaying, resetKeys, duration]);

  const handlePlay = async () => {
    if (Tone.context.state !== 'running') await Tone.start();
    Tone.Transport.start();
  };

  const handlePause = () => {
    Tone.Transport.pause();
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    Tone.Transport.seconds = newTime;
    
    // Tua thì phải ngắt các nốt đang ngân và tắt highlight
    stopAllNotes();
    resetKeys();
    
    if (currentTimeRef.current) {
      currentTimeRef.current.innerText = formatTime(newTime);
    }
  };

  return (
    <div className="w-full bg-white px-4 py-3 flex flex-col z-10 relative">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Mode Selector */}
        <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
          {MODES.map((mode) => {
            const isActive = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setMode(mode.id)}
                className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-white text-[#ff7a1a]'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode.icon}
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 w-full flex items-center gap-3 px-4">
          <span ref={currentTimeRef} className="text-xs font-bold text-gray-500 w-10 text-right">00:00</span>
          
          <div className="relative flex-1 h-2 flex items-center group cursor-pointer">
            {/* Thanh nền xám */}
            <div className="absolute w-full h-2 bg-gray-200 rounded-full"></div>
            {/* Thanh màu cam fill */}
            <div ref={progressFillRef} className="absolute h-2 bg-[#ff7a1a] rounded-full pointer-events-none" style={{ width: '0%' }}></div>
            {/* Input Range ẩn đè lên để bắt sự kiện kéo */}
            <input 
              type="range" 
              ref={progressBarRef}
              min="0" 
              max={duration} 
              step="0.1"
              defaultValue="0"
              onMouseDown={() => isDragging.current = true}
              onMouseUp={() => isDragging.current = false}
              onTouchStart={() => isDragging.current = true}
              onTouchEnd={() => isDragging.current = false}
              onChange={handleSeek}
              onInput={(e) => {
                // Cập nhật UI thanh màu cam mượt mà khi tay đang kéo
                const val = parseFloat(e.target.value);
                const percentage = duration > 0 ? (val / duration) * 100 : 0;
                progressFillRef.current.style.width = `${percentage}%`;
                const thumb = document.getElementById('progress-thumb');
                if (thumb) thumb.style.left = `calc(${percentage}% - 8px)`;
                if (currentTimeRef.current) currentTimeRef.current.innerText = formatTime(val);
              }}
              className="absolute w-full h-full opacity-0 cursor-pointer z-10"
            />
            {/* Nút thumb hiển thị khi hover */}
            <div id="progress-thumb" className="absolute h-4 w-4 bg-white border-2 border-[#ff7a1a] rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0" style={{ left: 'calc(0% - 8px)' }}></div>
          </div>
          
          <span className="text-xs font-bold text-gray-500 w-10">{formatTime(duration)}</span>
        </div>

        {/* Trình phát & Âm lượng */}
        <div className="flex items-center gap-3 shrink-0">
          {!isPlaying ? (
            <button onClick={handlePlay} className="cursor-pointer p-3 rounded-full bg-[#ffe8d1] text-[#e8630a] hover:bg-[#ffd9b8] transition-colors">
              <Play className="w-5 h-5 fill-current" />
            </button>
          ) : (
            <button onClick={handlePause} className="cursor-pointer p-3 rounded-full bg-[#ffe8d1] text-[#e8630a] hover:bg-[#ffd9b8] transition-colors">
              <Pause className="w-5 h-5 fill-current" />
            </button>
          )}
          
          <div className="h-6 w-px bg-gray-300 mx-1"></div>
          
          <button className="cursor-pointer flex items-center gap-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors group">
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
