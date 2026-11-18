import { useId } from 'react';
import { Lock } from 'lucide-react';

const CARD_CLASS =
  'border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] shadow-[var(--shadow-hard)]';

// Thẻ của trang /upload (giống header thẻ ở Workspace). `number`: ô số thứ tự màu cam như thiết kế.
// `locked`: chưa dùng được (chưa phân tích file) -> hiện `lockedMessage` thay cho nội dung.
const UploadCard = ({ number, title, locked = false, lockedMessage, actions, children }) => {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} aria-disabled={locked || undefined} className={CARD_CLASS}>
      <header className="flex items-center gap-3 border-0 border-b-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-5 py-3">
        {number !== undefined ? (
          <span
            aria-hidden="true"
            className={`flex h-6 w-6 shrink-0 items-center justify-center border-2 border-solid border-[var(--color-ink)] text-xs font-extrabold ${
              locked
                ? 'bg-[var(--color-surface-disabled)] text-[var(--color-neutral-500)]'
                : 'bg-[var(--color-brand)] text-[var(--color-ink)]'
            }`}
          >
            {number}
          </span>
        ) : (
          <span aria-hidden="true" className="h-3 w-3 shrink-0 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-brand)]" />
        )}
        <h2 id={titleId} className="m-0 text-base font-bold text-[var(--color-ink)]">
          {title}
        </h2>
        {locked ? (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-[var(--color-neutral-500)]">
            <Lock aria-hidden="true" className="h-3.5 w-3.5" />
            Locked
          </span>
        ) : (
          actions && <div className="ml-auto flex items-center gap-2">{actions}</div>
        )}
      </header>
      {locked ? (
        <p className="m-0 px-5 py-6 text-sm font-medium text-[var(--color-neutral-500)]">{lockedMessage}</p>
      ) : (
        <div className="px-5 py-5">{children}</div>
      )}
    </section>
  );
};

export default UploadCard;
