import { ChevronDown, Keyboard } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

// Chọn nhãn hiển thị trên phím như HomePage: "Shortcuts + Note names" / "Note names".
// AUTO_PLAY không nhận phím máy tính nên nhãn phím tắt luôn ẩn -> khoá ô chọn (giống Octave Shift).
const KeyLabelSelect = () => {
  const { keyLabels, setKeyLabels, currentMode } = useWorkspaceStore(
    useShallow((state) => ({
      keyLabels: state.keyLabels,
      setKeyLabels: state.setKeyLabels,
      currentMode: state.currentMode,
    })),
  );
  const locked = currentMode === 'AUTO_PLAY';

  return (
    <label
      className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--color-neutral-600)] ${locked ? 'opacity-60' : ''}`}
      title={locked ? 'Keyboard shortcuts are used in Wait Mode' : undefined}
    >
      <Keyboard aria-hidden="true" className="h-4 w-4 text-[var(--color-brand-strong)]" />
      Key labels
      <span className="relative ml-1 flex">
        <select
          value={keyLabels}
          onChange={(event) => {
            setKeyLabels(event.target.value);
            // Bỏ focus để gõ phím đàn ngay (đang focus select thì phím chữ chỉ đổi lựa chọn, xem useKeyboardInput)
            event.target.blur();
          }}
          disabled={locked}
          className="h-9 w-[224px] cursor-pointer appearance-none border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] pl-3 pr-8 font-[inherit] text-sm font-bold normal-case tracking-normal text-[var(--color-brand-strong)] outline-none disabled:cursor-default"
        >
          <option value="shortcuts">Shortcuts + Note names</option>
          <option value="names">Note names</option>
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink)]"
        />
      </span>
    </label>
  );
};

export default KeyLabelSelect;
