import { Eye, Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import { useLikedSheets } from "../hooks/useLikedSheets";
import ProfileSheetList, { SheetIconButton } from "./ProfileSheetList";

const SavedSheetActions = ({ sheet, onUnlike }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleUnlike = async () => {
    setIsSubmitting(true);
    setHasError(false);
    try {
      await onUnlike(sheet.id);
    } catch {
      setHasError(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SheetIconButton
        as={Link}
        to={`${ROUTES.WORKSPACE}/${encodeURIComponent(sheet.id)}`}
        aria-label={`View ${sheet.title}`}
      >
        <Eye size={16} aria-hidden="true" />
      </SheetIconButton>
      <SheetIconButton
        type="button"
        aria-label={`Remove ${sheet.title} from saved collections`}
        disabled={isSubmitting}
        onClick={handleUnlike}
      >
        <Heart size={16} fill="var(--color-danger)" className="text-[var(--color-danger)]" aria-hidden="true" />
      </SheetIconButton>
      <p className="m-0 flex items-center gap-2 border-2 border-[var(--color-brand-deep)] bg-[var(--color-brand-tint)] px-3 py-1.5 text-xs font-bold text-[var(--color-brand-deep)]">
        {sheet.likes} likes
      </p>
      {hasError && (
        <p role="alert" className="m-0 w-full text-xs font-semibold text-[var(--color-danger)]">
          Unable to update. Please try again.
        </p>
      )}
    </div>
  );
};

const SavedSheets = () => {
  const { sheets, total, status, retry, loadMore, unlike } = useLikedSheets();

  if (status === "loading") {
    return (
      <p role="status" className="m-0 mt-4 border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-card)] p-8 text-center text-sm font-semibold text-[var(--color-neutral-600)]">
        Loading saved sheets...
      </p>
    );
  }

  if (status === "error" && sheets.length === 0) {
    return (
      <div role="alert" className="mt-4 flex flex-col items-center gap-3 border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-card)] p-8 text-sm font-semibold text-[var(--color-danger)]">
        Unable to load saved sheets.
        <button
          type="button"
          onClick={retry}
          className="h-10 cursor-pointer border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 font-[inherit] text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <ProfileSheetList
      ariaLabel="Saved collections"
      emptyMessage="No liked sheets yet."
      sheets={sheets}
      total={total}
      onLoadMore={loadMore}
      renderActions={(sheet) => <SavedSheetActions sheet={sheet} onUnlike={unlike} />}
    />
  );
};

export default SavedSheets;
