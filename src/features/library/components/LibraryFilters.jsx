import { DIFFICULTY_META } from '../config/difficulty';
import { DIFFICULTIES } from '../hooks/useLibraryQuery';

const ChipButton = ({ active, onClick, children }) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className={`flex h-8 cursor-pointer items-center gap-1.5 border-2 border-[var(--color-ink)] px-3 font-[inherit] text-[13px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] ${
      active
        ? 'bg-[var(--color-brand)] text-[var(--color-neutral-white)] shadow-[var(--shadow-hard-sm)]'
        : 'bg-[var(--color-surface-card)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]'
    }`}
  >
    {children}
  </button>
);

const FilterRow = ({ label, children }) => (
  <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
    <span className="w-[76px] shrink-0 text-sm font-bold text-[var(--color-ink)]">{label}:</span>
    {children}
  </div>
);

// Lọc theo độ khó và thể loại (tag lấy từ GET /sheets/tags, kèm số bài)
const LibraryFilters = ({ difficulty, tag, tags, onChange }) => {
  // Link cũ có thể chứa tag không còn trong danh sách: vẫn hiện để người dùng bỏ chọn được
  const tagOptions = tag && !tags.some((t) => t.name === tag) ? [{ name: tag, count: 0 }, ...tags] : tags;

  return (
    <div className="flex flex-col gap-2.5">
      <FilterRow label="Difficulty">
        <ChipButton active={!difficulty} onClick={() => onChange({ difficulty: '' })}>
          All
        </ChipButton>
        {DIFFICULTIES.map((level) => (
          <ChipButton key={level} active={difficulty === level} onClick={() => onChange({ difficulty: level })}>
            <span aria-hidden="true" className={`h-1.5 w-1.5 ${DIFFICULTY_META[level].dotClass}`} />
            {DIFFICULTY_META[level].label}
          </ChipButton>
        ))}
      </FilterRow>

      {tagOptions.length > 0 && (
        <FilterRow label="Genre">
          <ChipButton active={!tag} onClick={() => onChange({ tag: '' })}>
            All
          </ChipButton>
          {tagOptions.map((t) => (
            <ChipButton key={t.name} active={tag === t.name} onClick={() => onChange({ tag: t.name })}>
              {t.name}
              <span className="font-normal opacity-70">({t.count})</span>
            </ChipButton>
          ))}
        </FilterRow>
      )}
    </div>
  );
};

export default LibraryFilters;
