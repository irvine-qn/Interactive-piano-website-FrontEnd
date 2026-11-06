import {
  BarChart3,
  FileMusic,
  ListMusic,
  ListFilter,
  Search,
} from "lucide-react";

const TAB_ITEMS = [
  { key: "uploadedSheets", label: "Uploaded sheets", Icon: FileMusic },
  { key: "savedCollections", label: "Saved collections", Icon: ListMusic },
  { key: "practiceHistory", label: "Practice history", Icon: BarChart3 },
];

const ProfileTabs = ({ counts = {}, activeTab = TAB_ITEMS[0].key }) => (
  <section
    aria-label="Profile content"
    className="flex flex-col gap-3 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-4"
  >
    <nav aria-label="Profile tabs" className="flex flex-wrap gap-2">
      {TAB_ITEMS.map(({ key, label, Icon }) => {
        const isActive = key === activeTab;

        return (
          <button
            key={key}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className={`flex h-10 cursor-pointer items-center gap-2 border-2 px-3 font-[inherit] text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)] ${
              isActive
                ? "border-[var(--color-ink)] bg-[var(--color-brand)] text-[var(--color-neutral-white)]"
                : "border-transparent bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"
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
    <div className="flex gap-2">
      <div className="flex h-10 min-w-0 flex-1 items-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-3 text-[var(--color-neutral-350)]">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search sheets..."
          aria-label="Search sheets"
          className="min-w-0 flex-1 border-0 bg-transparent font-[inherit] text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-neutral-350)]"
        />
      </div>
      <button
        type="button"
        aria-label="Filter sheets"
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-surface-soft)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-brand-tint)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
      >
        <ListFilter size={16} aria-hidden="true" />
      </button>
    </div>
  </section>
);

export default ProfileTabs;
