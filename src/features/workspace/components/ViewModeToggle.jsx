import { Music, Rows3 } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

const ViewModeToggle = () => {
  const { viewMode, setViewMode } = useWorkspaceStore(
    useShallow((state) => ({ viewMode: state.viewMode, setViewMode: state.setViewMode })),
  );
  const isSheet = viewMode === 'sheet';
  const Icon = isSheet ? Rows3 : Music;

  return (
    <button
      type="button"
      onClick={(event) => {
        setViewMode(isSheet ? 'waterfall' : 'sheet');
        event.currentTarget.blur();
      }}
      className="flex h-9 cursor-pointer items-center gap-2 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] px-3 font-[inherit] text-sm font-bold text-[var(--color-brand-deep)]"
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
      {isSheet ? 'Show waterfall' : 'Show sheet music'}
    </button>
  );
};

export default ViewModeToggle;
