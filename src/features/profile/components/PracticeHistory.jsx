import { Clock, Eye, Piano } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import { formatDuration } from "../../../utils/format";
import { usePracticeHistory } from "../hooks/usePracticeHistory";
import ProfileSheetList, { SheetIconButton } from "./ProfileSheetList";

const MESSAGE_CLASS =
  "m-0 mt-4 border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-card)] p-8 text-center text-sm font-semibold text-[var(--color-neutral-600)]";
const BUTTON_CLASS =
  "h-10 cursor-pointer border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 font-[inherit] text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]";

const renderSessionMeta = (session) => (
  <>
    <p className="m-0 flex items-center gap-1 text-[var(--color-brand-deep)]">
      <Piano size={14} aria-hidden="true" />
      {session.noteCount} keys
    </p>
    <p className="m-0 flex items-center gap-1 text-[var(--color-neutral-600)]">
      <Clock size={14} aria-hidden="true" />
      {formatDuration(session.durationSec)}
    </p>
  </>
);

const renderSessionActions = (session) => (
  <SheetIconButton
    as={Link}
    to={`${ROUTES.WORKSPACE}/${encodeURIComponent(session.sheetId)}`}
    aria-label={`View ${session.title}`}
  >
    <Eye size={16} aria-hidden="true" />
  </SheetIconButton>
);

const PracticeHistory = () => {
  const { sessions, total, status, retry, loadMore } = usePracticeHistory();

  if (status === "loading") {
    return (
      <p role="status" className={MESSAGE_CLASS}>
        Loading practice history...
      </p>
    );
  }

  if (status === "error" && sessions.length === 0) {
    return (
      <div role="alert" className="mt-4 flex flex-col items-center gap-3 border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-card)] p-8 text-sm font-semibold text-[var(--color-danger)]">
        Unable to load practice history.
        <button type="button" onClick={retry} className={BUTTON_CLASS}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <ProfileSheetList
      ariaLabel="Practice history"
      emptyMessage="No practice history yet."
      itemName="sessions"
      sheets={sessions}
      total={total}
      onLoadMore={loadMore}
      renderMeta={renderSessionMeta}
      renderActions={renderSessionActions}
    />
  );
};

export default PracticeHistory;
