import { ChevronDown, Keyboard } from 'lucide-react';
import { IS_TOUCH_SCREEN } from '../config/keyLayout';

const KeyLabelSelect = ({ value, onChange }) => (
  <label className="flex min-w-0 max-w-full items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--color-neutral-600)]">
    <Keyboard aria-hidden="true" className="h-4 w-4 text-[var(--color-brand-deep)]" />
    Key labels
    <span className="relative ml-1 flex">
      <select
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          event.target.blur();
        }}
        className="h-9 w-[14rem] min-w-0 max-w-full shrink cursor-pointer appearance-none border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] pl-3 pr-8 font-[inherit] text-sm font-bold normal-case tracking-normal text-[var(--color-brand-deep)] outline-none"
      >
        {!IS_TOUCH_SCREEN && <option value="shortcuts">Shortcuts + Note names</option>}
        <option value="names">Note names</option>
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink)]"
      />
    </span>
  </label>
);

export default KeyLabelSelect;
