import { BarChart3, Eye, Globe, Lock, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import { useMySheets } from "../hooks/useMySheets";
import EditSheetDialog from "./EditSheetDialog";
import ProfileSheetList, { SheetIconButton } from "./ProfileSheetList";

const TEXT_BUTTON_CLASS =
  "h-9 cursor-pointer border-2 border-[var(--color-ink)] px-3 font-[inherit] text-xs font-bold disabled:cursor-not-allowed disabled:opacity-60";

const UploadedSheetActions = ({ sheet, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const isPrivate = sheet.visibility === "PRIVATE";

  const run = async (action, message) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await action();
      setIsSubmitting(false);
    } catch {
      setError(message);
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
      <SheetIconButton type="button" aria-label={`Edit ${sheet.title}`} onClick={() => setIsEditing(true)}>
        <Pencil size={16} aria-hidden="true" />
      </SheetIconButton>
      <SheetIconButton
        type="button"
        aria-label={`Make ${sheet.title} ${isPrivate ? "public" : "private"}`}
        title={isPrivate ? "Make public" : "Make private"}
        disabled={isSubmitting}
        onClick={() =>
          run(
            () => onUpdate(sheet.id, { visibility: isPrivate ? "PUBLIC" : "PRIVATE" }),
            "Unable to update. Please try again.",
          )
        }
      >
        {isPrivate ? <Globe size={16} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
      </SheetIconButton>
      {isConfirmingDelete ? (
        <div role="group" aria-label={`Confirm deleting ${sheet.title}`} className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => run(() => onRemove(sheet.id), "Unable to delete. Please try again.")}
            className={`${TEXT_BUTTON_CLASS} bg-[var(--color-danger)] text-[var(--color-neutral-white)]`}
          >
            Delete forever
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setIsConfirmingDelete(false)}
            className={`${TEXT_BUTTON_CLASS} bg-[var(--color-surface-card)] text-[var(--color-ink)]`}
          >
            Keep
          </button>
        </div>
      ) : (
        <SheetIconButton
          type="button"
          aria-label={`Delete ${sheet.title}`}
          onClick={() => setIsConfirmingDelete(true)}
        >
          <Trash2 size={16} aria-hidden="true" />
        </SheetIconButton>
      )}
      <p className="m-0 flex items-center gap-2 border-2 border-[var(--color-brand-deep)] bg-[var(--color-brand-tint)] px-3 py-1.5 text-xs font-bold text-[var(--color-brand-deep)]">
        <BarChart3 size={16} aria-hidden="true" />
        {sheet.likes} likes
      </p>
      {error && (
        <p role="alert" className="m-0 w-full text-xs font-semibold text-[var(--color-danger)]">
          {error}
        </p>
      )}
      {isEditing && (
        <EditSheetDialog
          sheet={sheet}
          onSave={(fields) => onUpdate(sheet.id, fields)}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

const NoUploads = () => (
  <>
    You haven’t uploaded any sheets yet.{" "}
    <Link to={ROUTES.UPLOAD} className="text-[var(--color-brand-deep)]">
      Upload your first MIDI file
    </Link>
  </>
);

const UploadedSheets = ({ q, difficulty, onDeleted }) => {
  const { sheets, total, status, retry, loadMore, update, remove } = useMySheets({ q, difficulty });

  const handleRemove = async (id) => {
    await remove(id);
    onDeleted?.();
  };

  if (status === "loading" && sheets.length === 0) {
    return (
      <p role="status" className="m-0 mt-4 border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-card)] p-8 text-center text-sm font-semibold text-[var(--color-neutral-600)]">
        Loading your sheets...
      </p>
    );
  }

  return (
    <>
      {status === "error" && (
        <div role="alert" className="mt-4 flex flex-col items-center gap-3 border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-card)] p-8 text-sm font-semibold text-[var(--color-danger)]">
          Unable to load your sheets.
          <button
            type="button"
            onClick={retry}
            className="h-10 cursor-pointer border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 font-[inherit] text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"
          >
            Try again
          </button>
        </div>
      )}
      {(status !== "error" || sheets.length > 0) && (
        <ProfileSheetList
          ariaLabel="Uploaded sheets"
          emptyMessage={q || difficulty ? "No sheets match your search." : <NoUploads />}
          sheets={sheets}
          total={total}
          onLoadMore={loadMore}
          renderActions={(sheet) => (
            <UploadedSheetActions sheet={sheet} onUpdate={update} onRemove={handleRemove} />
          )}
        />
      )}
    </>
  );
};

export default UploadedSheets;
