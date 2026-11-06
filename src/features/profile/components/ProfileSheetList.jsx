import { ChevronDown, FileMusic, Gauge, Music } from "lucide-react";
import PrivateBadge from "../../library/components/PrivateBadge";

const ICON_BUTTON_CLASS =
  "flex size-9 cursor-pointer items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]";

export const SheetIconButton = ({ as: Component = "button", ...props }) => (
  <Component className={ICON_BUTTON_CLASS} {...props} />
);

const renderSheetMeta = (sheet) => (
  <>
    {sheet.visibility === "PRIVATE" && <PrivateBadge />}
    <p className="m-0 flex items-center gap-1 text-[var(--color-brand-deep)]">
      <Gauge size={14} aria-hidden="true" />
      {sheet.bpm} BPM
    </p>
    {sheet.keySignature && (
      <p className="m-0 flex items-center gap-1 text-[var(--color-neutral-600)]">
        <Music size={14} aria-hidden="true" />
        {sheet.keySignature}
      </p>
    )}
    <p className="m-0 text-[var(--color-ink)]">{sheet.views} plays</p>
  </>
);

const ProfileSheetItem = ({ sheet, renderMeta, renderActions }) => (
  <li className="flex flex-wrap items-center gap-4 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-4">
    <div
      aria-hidden="true"
      className="flex size-20 shrink-0 items-center justify-center border-2 border-[var(--color-ink)] text-[var(--color-file-icon)]"
      style={{ backgroundColor: `var(--color-pastel-${sheet.coverColor})` }}
    >
      <FileMusic size={32} />
    </div>
    <div className="min-w-0 flex-1">
      <h3 className="m-0 truncate text-lg font-bold text-[var(--color-ink)]">
        {sheet.title}
      </h3>
      <p className="m-0 mt-1 text-sm font-semibold text-[var(--color-neutral-600)]">
        {sheet.composer}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
        {renderMeta(sheet)}
      </div>
    </div>
    {renderActions?.(sheet)}
  </li>
);

const ProfileSheetList = ({
  sheets = [],
  total = sheets.length,
  ariaLabel = "Uploaded sheets",
  emptyMessage = "No sheets yet.",
  itemName = "sheets",
  renderMeta = renderSheetMeta,
  renderActions,
  onLoadMore,
}) => (
  <section aria-label={ariaLabel} className="mt-4">
    <header className="mb-3 flex flex-wrap items-center gap-x-6 gap-y-1">
      <h2 className="m-0 text-sm font-bold uppercase text-[var(--color-ink)]">
        All {itemName} ({total})
      </h2>
      <p className="m-0 text-sm font-semibold text-[var(--color-neutral-400)]">
        Newest first
      </p>
    </header>
    {sheets.length === 0 ? (
      <p className="m-0 border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-card)] p-8 text-center text-sm font-semibold text-[var(--color-neutral-600)]">
        {emptyMessage}
      </p>
    ) : (
      <>
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {sheets.map((sheet) => (
            <ProfileSheetItem
              key={sheet.id}
              sheet={sheet}
              renderMeta={renderMeta}
              renderActions={renderActions}
            />
          ))}
        </ul>
        <footer className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-sm font-semibold text-[var(--color-neutral-600)]">
            Showing {sheets.length} of {total} {itemName}
          </p>
          {sheets.length < total && (
            <button
              type="button"
              onClick={onLoadMore}
              className="flex h-10 cursor-pointer items-center gap-6 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 font-[inherit] text-sm font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
            >
              Load more {itemName}
              <ChevronDown size={16} aria-hidden="true" />
            </button>
          )}
        </footer>
      </>
    )}
  </section>
);

export default ProfileSheetList;
