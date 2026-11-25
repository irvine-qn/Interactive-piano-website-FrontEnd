import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ListFilter, Search, SlidersHorizontal, X } from 'lucide-react';
import { ChipButton } from './LibraryFilters';

const SEARCH_DELAY_MS = 300;

const SORT_LABELS = {
  popular: 'Most popular',
  likes: 'Most liked',
  newest: 'Newest',
  title: 'Title (A–Z)',
};

const SearchBox = ({ value, onSearch }) => {
  const inputId = useId();
  const inputRef = useRef(null);
  const [draft, setDraft] = useState(null);
  const text = draft ?? value;

  useEffect(() => {
    if (draft === null) return undefined;
    const timer = setTimeout(() => {
      setDraft(null);
      if (draft !== value) onSearch(draft);
    }, SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [draft, value, onSearch]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setDraft(null);
    if (text !== value) onSearch(text);
  };

  const handleClear = () => {
    setDraft(null);
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex h-11 w-full max-w-[47.5rem] items-center gap-2.5 border-2 border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-brand)]"
    >
      <label htmlFor={inputId} className="flex shrink-0">
        <Search aria-hidden="true" className="h-5 w-5 text-[var(--color-brand-deep)]" />
        <span className="sr-only">Search sheets</span>
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="search"
        value={text}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search by title or composer..."
        autoComplete="off"
        className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 font-[inherit] text-[15px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-neutral-350)] [&::-webkit-search-cancel-button]:appearance-none"
      />
      {text && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--color-neutral-500)] hover:text-[var(--color-ink)]"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </button>
      )}
    </form>
  );
};

const SortSelect = ({ value, onChange }) => {
  const selectId = useId();
  return (
    <div className="flex items-center gap-2.5">
      <ListFilter aria-hidden="true" className="h-5 w-5 text-[var(--color-ink)]" />
      <label htmlFor={selectId} className="text-sm font-bold text-[var(--color-ink)] max-sm:sr-only">
        Sort by:
      </label>
      <span className="relative flex">
        <select
          id={selectId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-[11.875rem] max-sm:h-9 max-sm:w-auto max-sm:border-0 max-sm:bg-transparent max-sm:pl-1 cursor-pointer appearance-none border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] pl-4 pr-9 font-[inherit] text-sm font-bold text-[var(--color-ink)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
        >
          {Object.entries(SORT_LABELS).map(([sort, label]) => (
            <option key={sort} value={sort}>
              {label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-ink)]"
        />
      </span>
    </div>
  );
};

const FilterSheet = ({ dialogRef, sort, total, onSortChange, onReset, children }) => {
  const close = () => dialogRef.current?.close();
  return (
    <dialog
      ref={dialogRef}
      aria-label="Filters and sort"
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
      className="mb-0 mt-auto max-h-[85dvh] w-full max-w-none border-0 border-t-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 backdrop:bg-(--color-ink)/40 sm:hidden"
    >
      <div className="flex max-h-[85dvh] flex-col">
        <div className="overflow-y-auto px-4 pb-4 pt-3">
          <span aria-hidden="true" className="mx-auto mb-3 block h-1 w-12 bg-[var(--color-line-dashed)]" />
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-xl font-bold text-[var(--color-ink)]">Filters &amp; Sort</h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close filters"
              className="flex h-9 w-9 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--color-ink)]"
            >
              <X aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>
          <div role="group" aria-label="Sort by" className="mb-4 flex flex-wrap items-center gap-2">
            <span className="w-full text-sm font-bold text-[var(--color-ink)]">Sort by</span>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <ChipButton key={value} active={sort === value} onClick={() => onSortChange(value)}>
                {label}
              </ChipButton>
            ))}
          </div>
          <div className="[&_[role=group]>span:first-child]:w-full [&>div]:gap-4">{children}</div>
        </div>
        <div className="flex gap-3 border-0 border-t-2 border-solid border-[var(--color-line-dashed)] px-4 py-3">
          <button
            type="button"
            onClick={onReset}
            className="flex h-11 flex-1 cursor-pointer items-center justify-center border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] font-[inherit] text-sm font-bold text-[var(--color-ink)] shadow-[var(--shadow-hard-sm)]"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={close}
            className="flex h-11 flex-1 cursor-pointer items-center justify-center border-2 border-solid border-[var(--color-ink)] bg-[var(--color-brand)] font-[inherit] text-sm font-bold text-[var(--color-ink)] shadow-[var(--shadow-hard-sm)] hover:bg-[var(--color-brand-strong)]"
          >
            Show {total.toLocaleString('en')} {total === 1 ? 'result' : 'results'}
          </button>
        </div>
      </div>
    </dialog>
  );
};

const LibraryToolbar = ({ query, meta, shownCount, onSearch, onSortChange, onReset, children }) => {
  const sheetRef = useRef(null);
  return (
  <section
    aria-label="Search, sort and filter"
    className="flex flex-col border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 py-3.5 shadow-[var(--shadow-hard)] max-sm:border-0 max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none"
  >
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex w-full max-w-[47.5rem] gap-3 sm:contents">
        <SearchBox value={query.q} onSearch={onSearch} />
        {children && (
          <button
            type="button"
            onClick={() => sheetRef.current?.showModal()}
            aria-haspopup="dialog"
            aria-label="Show filters"
            className="flex h-11 w-12 shrink-0 cursor-pointer items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 text-[var(--color-ink)] shadow-[var(--shadow-hard-sm)] sm:hidden"
          >
            <SlidersHorizontal aria-hidden="true" className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-3 max-sm:ml-0 max-sm:w-full max-sm:flex-nowrap max-sm:justify-between">
        {meta && (
          <p aria-live="polite" className="m-0 text-sm text-[var(--color-neutral-500)] max-sm:font-bold">
            Showing {shownCount} of {meta.total.toLocaleString('en')} {meta.total === 1 ? 'sheet' : 'sheets'}
          </p>
        )}
        <SortSelect value={query.sort} onChange={onSortChange} />
      </div>
    </div>
    {children && (
      <>
        <div className="mt-3.5 border-0 border-t-2 border-dashed border-[var(--color-line-dashed)] pt-3.5 max-sm:hidden">
          {children}
        </div>
        <FilterSheet dialogRef={sheetRef} sort={query.sort} total={meta?.total ?? 0} onSortChange={onSortChange} onReset={onReset}>
          {children}
        </FilterSheet>
      </>
    )}
  </section>
  );
};

export default LibraryToolbar;
