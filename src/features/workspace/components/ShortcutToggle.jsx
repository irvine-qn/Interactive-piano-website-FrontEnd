import { Eye, EyeOff } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

const ShortcutToggle = () => {
  const { showShortcuts, setShowShortcuts } = useWorkspaceStore(
    useShallow((state) => ({ showShortcuts: state.showShortcuts, setShowShortcuts: state.setShowShortcuts })),
  );
  const Icon = showShortcuts ? EyeOff : Eye;

  return (
    <button
      type="button"
      aria-pressed={showShortcuts}
      onClick={(event) => {
        setShowShortcuts(!showShortcuts);
        event.currentTarget.blur();
      }}
      className="flex h-9 cursor-pointer items-center gap-2 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] px-3 font-[inherit] text-sm font-bold text-[var(--color-brand-strong)]"
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {showShortcuts ? 'Hide shortcuts' : 'Show shortcuts'}
    </button>
  );
};

export default ShortcutToggle;
