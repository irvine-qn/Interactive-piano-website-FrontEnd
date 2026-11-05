import { ChevronDown, Keyboard } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useWorkspaceStore } from '../store/useWorkspaceStore';

const KeyLabelSelect = () => {
  const { keyLabels, setKeyLabels } = useWorkspaceStore(
    useShallow((state) => ({
      keyLabels: state.keyLabels,
      setKeyLabels: state.setKeyLabels,
    })),
  );

  return (
    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--color-neutral-600)]">
      <Keyboard aria-hidden="true" className="h-4 w-4 text-[var(--color-brand-strong)]" />
      Key labels
      <span className="relative ml-1 flex">
        <select
          value={keyLabels}
          onChange={(event) => {
            setKeyLabels(event.target.value);
            event.target.blur();
          }}
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
