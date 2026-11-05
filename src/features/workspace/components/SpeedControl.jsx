import { Minus, Plus } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

// Các mức tốc độ phát so với bản gốc
const SPEED_STEPS = [0.5, 0.75, 1, 1.25, 1.5];

// Nút - / + giống bộ chỉnh BPM của metronome HomePage
const STEP_BUTTON_CLASS =
  'flex h-7 w-7 cursor-pointer items-center justify-center border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 text-[var(--color-ink)] hover:bg-[var(--color-brand-tint)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-disabled)] disabled:text-[var(--color-line-disabled)]';

// Chọn tốc độ phát dạng "- 96 BPM +" như thiết kế: số to là BPM thực tế (BPM gốc x tốc độ), dòng nhỏ là mức tốc độ.
// Đổi tốc độ lúc đang phát vẫn được: các nốt sau đó phát đúng tốc độ mới (nốt đang ngân giữ độ dài cũ, xem sheetPlayer).
const SpeedControl = () => {
  const { playbackRate, setPlaybackRate, baseBpm } = useWorkspaceStore(
    useShallow((state) => ({
      playbackRate: state.playbackRate,
      setPlaybackRate: state.setPlaybackRate,
      baseBpm: state.sheet?.bpm ?? null,
    })),
  );

  const index = SPEED_STEPS.indexOf(playbackRate);
  const current = index === -1 ? SPEED_STEPS.indexOf(1) : index;
  const step = (delta) => {
    const next = SPEED_STEPS[current + delta];
    if (next !== undefined) setPlaybackRate(next);
  };

  const disabled = baseBpm === null; // chưa tải xong bài thì chưa biết BPM
  const bpm = disabled ? null : Math.round(baseBpm * playbackRate);

  return (
    <div
      role="group"
      aria-label="Playback speed"
      className="flex h-11 shrink-0 items-center gap-2 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-2"
    >
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={disabled || current === 0}
        aria-label="Slower"
        title="Slower"
        className={STEP_BUTTON_CLASS}
      >
        <Minus aria-hidden="true" className="h-4 w-4" />
      </button>
      <output aria-live="polite" className="flex w-14 flex-col items-center leading-none">
        <span className="text-[20px] font-bold tabular-nums text-[var(--color-brand)]">{bpm ?? '--'}</span>
        <span className="mt-0.5 text-[9px] font-semibold text-[var(--color-neutral-400)]">BPM · {playbackRate}x</span>
      </output>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={disabled || current === SPEED_STEPS.length - 1}
        aria-label="Faster"
        title="Faster"
        className={STEP_BUTTON_CLASS}
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
};

export default SpeedControl;
