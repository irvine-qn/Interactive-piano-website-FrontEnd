import { useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { stopAllNotes } from '../../piano/audio/toneEngine';
import { Hourglass, PlaySquare, Play, Pause, Volume2 } from 'lucide-react';

// AUTO_PLAY là chế độ mặc định nên đứng đầu. PRACTICE hiển thị là "Wait Mode" (đợi người chơi nhấn đúng, T-09)
const MODES = [
  { id: 'AUTO_PLAY', label: 'Auto Play', Icon: PlaySquare },
  { id: 'PRACTICE', label: 'Wait Mode', Icon: Hourglass },
];

// Định dạng thời gian thống nhất m:ss (0:05, 3:35)
const formatTime = (seconds) => {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const m = Math.floor(safe / 60);
  const s = Math.floor(safe % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Vẽ vị trí timeline thẳng lên DOM (qua ref) mỗi khung hình, không setState -> Control Bar không render lại
const paintTimeline = (input, label, seconds, duration) => {
  if (input) {
    input.value = seconds;
    const percentage = duration > 0 ? Math.min((seconds / duration) * 100, 100) : 0;
    input.style.setProperty('--fill', `${percentage}%`);
  }
  if (label) label.textContent = formatTime(seconds);
};

// Thanh trượt kiểu Home (slider BPM): viền ink, phần đã qua tô cam theo biến CSS, thumb vuông
const SLIDER_CLASS =
  'h-2 cursor-pointer appearance-none border-[1.5px] border-solid border-[var(--color-ink)] bg-[linear-gradient(to_right,var(--color-brand)_var(--fill,0%),var(--color-surface-card)_var(--fill,0%))] disabled:cursor-not-allowed disabled:opacity-50 [&::-moz-range-thumb]:h-[18px] [&::-moz-range-thumb]:w-[10px] [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--color-ink)] [&::-moz-range-thumb]:bg-[var(--color-surface-card)] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[10px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-[var(--color-ink)] [&::-webkit-slider-thumb]:bg-[var(--color-surface-card)]';

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
  const timelineRef = useRef(null);
  const currentTimeRef = useRef(null);
  const requestRef = useRef();
  const isDragging = useRef(false);

  useEffect(() => {
    function updateProgress() {
      if (!isDragging.current) paintTimeline(timelineRef.current, currentTimeRef.current, Tone.Transport.seconds, duration);
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
    paintTimeline(timelineRef.current, currentTimeRef.current, newTime, duration);
  };

  const PlayIcon = isPlaying ? Pause : Play;

  return (
    <div className="flex w-full flex-wrap items-center gap-x-6 gap-y-3 px-5 py-4">
      {/* Mode selector dạng segmented như thiết kế */}
      <div
        role="group"
        aria-label="Playback mode"
        className="flex shrink-0 gap-1 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] p-1"
      >
        {MODES.map(({ id, label, Icon }) => {
          const isActive = currentMode === id;
          return (
            <button
              key={id}
              type="button"
              aria-pressed={isActive}
              onClick={() => setMode(id)}
              className={`flex h-9 cursor-pointer items-center gap-2 border-2 border-solid px-4 font-[inherit] text-sm font-bold ${
                isActive
                  ? 'border-[var(--color-ink)] bg-[var(--color-brand)] text-[var(--color-neutral-white)] shadow-[var(--shadow-hard-sm)]'
                  : 'border-transparent bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-brand-tint)]'
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Timeline: thanh range native, phần đã phát tô cam qua biến CSS --fill */}
      <div className="flex min-w-[240px] flex-1 items-center gap-3">
        <span
          ref={currentTimeRef}
          className="w-10 shrink-0 text-right text-xs font-bold tabular-nums text-[var(--color-neutral-600)]"
        >
          0:00
        </span>
        <input
          type="range"
          ref={timelineRef}
          aria-label="Timeline"
          min="0"
          max={duration}
          step="0.1"
          defaultValue="0"
          onPointerDown={() => (isDragging.current = true)}
          onPointerUp={() => (isDragging.current = false)}
          onChange={handleSeek}
          className={`${SLIDER_CLASS} min-w-0 flex-1`}
        />
        <span className="w-10 shrink-0 text-xs font-bold tabular-nums text-[var(--color-neutral-600)]">
          {formatTime(duration)}
        </span>
      </div>

      {/* Play/Pause + âm lượng */}
      <div className="flex shrink-0 items-center gap-4">
        <button
          type="button"
          onClick={isPlaying ? handlePause : handlePlay}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="flex h-11 w-11 cursor-pointer items-center justify-center border-2 border-solid border-[var(--color-ink)] bg-[var(--color-brand)] p-0 text-[var(--color-neutral-white)] shadow-[var(--shadow-hard-sm)] hover:bg-[var(--color-brand-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <PlayIcon aria-hidden="true" className="h-5 w-5 fill-current" />
        </button>

        {/* Âm lượng thật làm ở T-08C, tạm thời khoá để không gây hiểu nhầm */}
        <div className="flex h-11 items-center gap-2 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-3">
          <Volume2 aria-hidden="true" className="h-5 w-5 text-[var(--color-brand-strong)]" />
          <input
            type="range"
            aria-label="Volume"
            title="Volume control coming soon"
            min="0"
            max="100"
            defaultValue="75"
            disabled
            style={{ '--fill': '75%' }}
            className={`${SLIDER_CLASS} w-24`}
          />
        </div>
      </div>
    </div>
  );
};

export default ControlBar;
