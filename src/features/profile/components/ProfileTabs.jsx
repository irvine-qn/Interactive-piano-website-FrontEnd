import {
  BarChart3,
  FileMusic,
  ListMusic,
  ListFilter,
  Search,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DIFFICULTY_META } from "../../library/config/difficulty";

const SEARCH_DEBOUNCE_MS = 300;

const TAB_ITEMS = [
  { key: "uploadedSheets", label: "Uploaded sheets", Icon: FileMusic },
  { key: "savedCollections", label: "Saved collections", Icon: ListMusic },
  { key: "practiceHistory", label: "Practice history", Icon: BarChart3 },
];

const TABS_WITH_SEARCH = ["uploadedSheets", "savedCollections"];

const DIFFICULTY_OPTIONS = [
  { value: undefined, label: "All" },
  ...Object.entries(DIFFICULTY_META).map(([value, { label }]) => ({ value, label })),
];

const SheetSearchControls = ({ search, onSearchChange, difficulty, onDifficultyChange }) => {
  const [draft, setDraft] = useState(search);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const onSearchChangeRef = useRef(onSearchChange);

  useEffect(() => {
    onSearchChangeRef.current = onSearchChange;
  }, [onSearchChange]);

  useEffect(() => {
    const timer = setTimeout(() => onSearchChangeRef.current?.(draft.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft]);

  return (
    <>
      <div className="flex gap-2">
        <div className="flex h-10 min-w-0 flex-1 items-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-3 text-[var(--color-neutral-350)]">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search sheets..."
            aria-label="Search sheets"
            className="min-w-0 flex-1 border-0 bg-transparent font-[inherit] text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-neutral-350)]"
          />
        </div>
        <button
          type="button"
          aria-label="Filter sheets"
          aria-expanded={isFilterOpen}
          onClick={() => setIsFilterOpen((open) => !open)}
          className={`flex size-10 shrink-0 cursor-pointer items-center justify-center border-2 border-[var(--color-ink)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-brand-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] ${
            difficulty ? "bg-[var(--color-brand-tint)]" : "bg-[var(--color-surface-soft)]"
          }`}
        >
          <ListFilter size={16} aria-hidden="true" />
        </button>
      </div>
      {isFilterOpen && (
        <div role="group" aria-label="Filter by difficulty" className="flex flex-wrap gap-2">
          {DIFFICULTY_OPTIONS.map(({ value, label }) => {
            const isSelected = value === difficulty;

            return (
              <button
                key={label}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onDifficultyChange?.(value)}
                className={`h-8 cursor-pointer border-2 border-[var(--color-ink)] px-3 font-[inherit] text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] ${
                  isSelected
                    ? "bg-[var(--color-brand)] text-[var(--color-ink)]"
                    : "bg-[var(--color-surface-card)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
    </>
  );
};

const ProfileTabs = ({
  counts = {},
  activeTab = TAB_ITEMS[0].key,
  onTabChange,
  search = "",
  onSearchChange,
  difficulty,
  onDifficultyChange,
}) => (
  <section
    aria-label="Profile content"
    className="flex flex-col gap-3 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-4 max-sm:border-0 max-sm:bg-transparent max-sm:p-0"
  >
    <nav aria-label="Profile tabs" className="flex flex-wrap gap-2 max-sm:-mx-4 max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:px-4 max-sm:pb-1 max-sm:[scrollbar-width:none]">
      {TAB_ITEMS.map(({ key, label, Icon }) => {
        const isActive = key === activeTab;

        return (
          <button
            key={key}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onTabChange?.(key)}
            className={`flex h-10 shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap border-2 px-3 font-[inherit] text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] ${
              isActive
                ? "border-[var(--color-ink)] bg-[var(--color-brand)] text-[var(--color-ink)]"
                : "border-transparent bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)] max-sm:border-[var(--color-ink)] max-sm:bg-[var(--color-surface-card)]"
            }`}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
            {counts[key] !== undefined && (
              <span className="border border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-1.5 text-xs text-[var(--color-ink)]">
                {counts[key]}
              </span>
            )}
          </button>
        );
      })}
    </nav>
    {TABS_WITH_SEARCH.includes(activeTab) && (
      <SheetSearchControls
        search={search}
        onSearchChange={onSearchChange}
        difficulty={difficulty}
        onDifficultyChange={onDifficultyChange}
      />
    )}
  </section>
);

export default ProfileTabs;
