import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, ListFilter, Search, X } from 'lucide-react';

const SEARCH_DELAY_MS = 300;

const SORT_LABELS = {
  popular: 'Phổ biến nhất',
  likes: 'Lượt thích',
  newest: 'Mới nhất',
  title: 'Tên (A–Z)',
};

// Ô tìm kiếm: gõ xong 300ms mới cập nhật URL, Enter thì tìm ngay.
// `draft` chỉ tồn tại khi đang có chữ gõ chưa gửi; gửi xong thì bỏ draft và ô nhập hiển thị theo URL,
// nhờ vậy URL đổi từ nơi khác (Back/Forward, link) thì ô nhập tự cập nhật theo.
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
        <span className="sr-only">Tìm bản nhạc</span>
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="search"
        value={text}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Tìm theo tên bài hoặc tác giả..."
        autoComplete="off"
        className="h-full min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 font-[inherit] text-[15px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-neutral-350)] [&::-webkit-search-cancel-button]:appearance-none"
      />
      {text && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Xoá từ khoá"
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
        Sắp xếp:
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

// Thanh công cụ của Library: tìm kiếm, số bài đang hiển thị, sắp xếp
const LibraryToolbar = ({ query, meta, shownCount, onSearch, onSortChange }) => (
  <section
    aria-label="Tìm kiếm và sắp xếp"
    className="flex flex-wrap items-center gap-x-6 gap-y-3 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 py-3.5 shadow-[var(--shadow-hard)]"
  >
    <SearchBox value={query.q} onSearch={onSearch} />
    <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-3">
      {meta && (
        <p aria-live="polite" className="m-0 text-sm text-[var(--color-neutral-500)]">
          Hiển thị {shownCount} / {meta.total.toLocaleString('en')} bản
        </p>
      )}
      <SortSelect value={query.sort} onChange={onSortChange} />
    </div>
  </section>
);

export default LibraryToolbar;
