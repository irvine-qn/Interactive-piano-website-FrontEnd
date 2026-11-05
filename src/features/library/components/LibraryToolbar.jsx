import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ListFilter, Search, X } from 'lucide-react';

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
      className="flex h-11 w-full max-w-[760px] items-center gap-2.5 border-2 border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--color-brand)]"
    >
      <label htmlFor={inputId} className="flex shrink-0">
        <Search aria-hidden="true" className="h-5 w-5 text-[var(--color-brand)]" />
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
      <label htmlFor={selectId} className="text-sm font-bold text-[var(--color-ink)]">
        Sort by:
      </label>
      <span className="relative flex">
        <select
          id={selectId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-[190px] cursor-pointer appearance-none border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] pl-4 pr-9 font-[inherit] text-sm font-bold text-[var(--color-ink)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
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

const LibraryToolbar = ({ query, meta, shownCount, onSearch, onSortChange, children }) => (
  <section
    aria-label="Search, sort and filter"
    className="flex flex-col border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 py-3.5 shadow-[var(--shadow-hard)]"
  >
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
      <SearchBox value={query.q} onSearch={onSearch} />
      <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-3">
        {meta && (
          <p aria-live="polite" className="m-0 text-sm text-[var(--color-neutral-500)]">
            Showing {shownCount} of {meta.total.toLocaleString('en')} {meta.total === 1 ? 'sheet' : 'sheets'}
          </p>
        )}
        <SortSelect value={query.sort} onChange={onSortChange} />
      </div>
    </div>
    {children && (
      <div className="mt-3.5 border-0 border-t-2 border-dashed border-[var(--color-line-dashed)] pt-3.5">{children}</div>
    )}
  </section>
);

export default LibraryToolbar;
