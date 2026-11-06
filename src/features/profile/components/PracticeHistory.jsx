import { ChevronDown, Clock, Piano } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import { formatDuration } from "../../../utils/format";
import { usePracticeHistory } from "../hooks/usePracticeHistory";

const MESSAGE_CLASS =
  "m-0 mt-4 border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-card)] p-8 text-center text-sm font-semibold text-[var(--color-neutral-600)]";
const BUTTON_CLASS =
  "flex h-10 cursor-pointer items-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 font-[inherit] text-sm font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-soft)]";

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
      <div role="alert" className={`${MESSAGE_CLASS} flex flex-col items-center gap-3`}>
        Unable to load practice history.
        <button type="button" onClick={retry} className={BUTTON_CLASS}>
          Try again
        </button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return <p className={MESSAGE_CLASS}>No practice history yet.</p>;
  }

  return (
    <section aria-label="Practice history" className="mt-4">
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-4"
          >
            <h3 className="m-0 min-w-0 truncate text-lg font-bold">
              <Link
                to={`${ROUTES.WORKSPACE}/${encodeURIComponent(session.sheetId)}`}
                className="text-[var(--color-ink)] no-underline hover:text-[var(--color-brand-strong)]"
              >
                {session.title}
              </Link>
            </h3>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-semibold">
              <p className="m-0 flex items-center gap-1.5 text-[var(--color-brand-deep)]">
                <Piano size={16} aria-hidden="true" />
                {session.noteCount} keys
              </p>
              <p className="m-0 flex items-center gap-1.5 text-[var(--color-neutral-600)]">
                <Clock size={16} aria-hidden="true" />
                {formatDuration(session.durationSec)}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {sessions.length < total && (
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={loadMore} className={BUTTON_CLASS}>
            Load more
            <ChevronDown size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
};

export default PracticeHistory;
