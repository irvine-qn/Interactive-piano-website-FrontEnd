import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getPageItems } from '../utils/pagination';

const BUTTON_CLASS =
  'flex h-9 min-w-9 cursor-pointer items-center justify-center border-2 border-[var(--color-ink)] px-2 font-[inherit] text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] disabled:cursor-default disabled:border-[var(--color-line-disabled)] disabled:text-[var(--color-line-disabled)]';
const IDLE_CLASS = 'bg-[var(--color-surface-soft)] text-[var(--color-ink)] enabled:hover:bg-[var(--color-brand-tint)]';

const Pagination = ({ page, totalPages, onChange }) => (
  <nav
    aria-label="Phân trang"
    className="flex flex-wrap items-center justify-between gap-3 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 py-3 shadow-[var(--shadow-hard)]"
  >
    <p className="m-0 text-sm text-[var(--color-neutral-600)]">
      Trang {page} trên {totalPages}
    </p>
    <ul className="m-0 flex list-none items-center gap-2 p-0">
      <li>
        <button
          type="button"
          aria-label="Trang trước"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className={`${BUTTON_CLASS} ${IDLE_CLASS}`}
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        </button>
      </li>
      {getPageItems(page, totalPages).map((item, index) =>
        item === '…' ? (
          // Hai dấu … có thể cùng xuất hiện nên key kèm vị trí
          <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-sm text-[var(--color-neutral-400)]">
            …
          </li>
        ) : (
          <li key={item}>
            <button
              type="button"
              aria-label={`Trang ${item}`}
              aria-current={item === page ? 'page' : undefined}
              onClick={() => item !== page && onChange(item)}
              className={`${BUTTON_CLASS} ${
                item === page
                  ? 'bg-[var(--color-brand)] text-[var(--color-neutral-white)] shadow-[var(--shadow-hard-sm)]'
                  : IDLE_CLASS
              }`}
            >
              {item}
            </button>
          </li>
        ),
      )}
      <li>
        <button
          type="button"
          aria-label="Trang sau"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className={`${BUTTON_CLASS} ${IDLE_CLASS}`}
        >
          <ChevronRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </li>
    </ul>
  </nav>
);

export default Pagination;
