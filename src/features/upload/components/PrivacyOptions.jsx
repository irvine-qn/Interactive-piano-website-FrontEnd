import { useId } from 'react';
import { VISIBILITY_OPTIONS } from '../config/upload';

// Thẻ Privacy: Public / Private (mặc định Private, WBS D3). Ô chọn vuông như thiết kế.
const PrivacyOptions = ({ value, onChange }) => {
  const name = useId();
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="sr-only">Who can see this sheet</legend>
      <div className="flex flex-col gap-3">
        {VISIBILITY_OPTIONS.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 border-2 border-solid px-4 py-3 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-ink)] ${
                checked
                  ? 'border-[var(--color-ink)] bg-[var(--color-brand-glow)]'
                  : 'border-[var(--color-line-soft)] hover:border-[var(--color-ink)]'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange('visibility', option.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)]"
              >
                {checked && <span className="h-2 w-2 bg-[var(--color-brand)]" />}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-bold text-[var(--color-ink)]">{option.label}</span>
                <span className="text-xs font-medium text-[var(--color-neutral-500)]">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

export default PrivacyOptions;
