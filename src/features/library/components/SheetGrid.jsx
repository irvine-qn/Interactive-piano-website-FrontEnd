import { CircleAlert, RotateCcw, SearchX } from 'lucide-react';
import SheetCard from './SheetCard';

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

const SkeletonCard = () => (
  <div aria-hidden="true" className="flex flex-col border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] shadow-[var(--shadow-hard)]">
    <div className="aspect-[8/5] w-full animate-pulse border-0 border-b-2 border-solid border-[var(--color-ink)] bg-[var(--color-skeleton)]" />
    <div className="flex flex-col gap-2.5 px-4 pb-4 pt-3.5">
      <div className="h-5 w-3/4 animate-pulse bg-[var(--color-skeleton)]" />
      <div className="h-3.5 w-1/2 animate-pulse bg-[var(--color-skeleton)]" />
      <div className="h-3.5 w-2/3 animate-pulse bg-[var(--color-skeleton)]" />
      <div className="mt-3 h-10 animate-pulse bg-[var(--color-skeleton)]" />
    </div>
  </div>
);

const StatePanel = ({ icon, title, description, children, role }) => (
  <div
    role={role}
    className="flex flex-col items-center gap-3 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-6 py-14 text-center shadow-[var(--shadow-hard)]"
  >
    {icon}
    <h2 className="m-0 text-lg font-bold text-[var(--color-ink)]">{title}</h2>
    <p className="m-0 max-w-md text-sm text-[var(--color-neutral-600)]">{description}</p>
    {children}
  </div>
);

const SheetGrid = ({ sheets, status, error, onRetry, skeletonCount }) => {
  if (status === 'error') {
    return (
      <StatePanel
        role="alert"
        icon={<CircleAlert aria-hidden="true" className="h-10 w-10 text-[var(--color-danger)]" />}
        title="Could not load the library"
        description={error?.message ?? 'Something went wrong.'}
      >
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 flex h-10 cursor-pointer items-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-brand)] px-5 font-[inherit] text-sm font-bold text-[var(--color-ink)] shadow-[var(--shadow-hard-sm)] hover:bg-[var(--color-brand-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          Try again
        </button>
      </StatePanel>
    );
  }

  if (status === 'loading' && sheets.length === 0) {
    return (
      <div className={GRID_CLASS} aria-busy="true" aria-label="Loading sheets">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (status === 'success' && sheets.length === 0) {
    return (
      <StatePanel
        icon={<SearchX aria-hidden="true" className="h-10 w-10 text-[var(--color-neutral-400)]" />}
        title="No sheets found"
        description="Try another keyword or remove some filters."
      />
    );
  }

  const isRefreshing = status === 'loading';
  return (
    <div className={`${GRID_CLASS} transition-opacity ${isRefreshing ? 'opacity-60' : ''}`} aria-busy={isRefreshing}>
      {sheets.map((sheet) => (
        <SheetCard key={sheet.id} sheet={sheet} />
      ))}
    </div>
  );
};

export default SheetGrid;
