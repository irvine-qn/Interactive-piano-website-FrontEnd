import { BarChart3, Ellipsis, Eye, Globe, Lock, Pencil, Trash2, X } from "lucide-react";
import PianoKeysIcon from "../../../components/icons/PianoKeysIcon";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../../../config/routes";
import { useMySheets } from "../hooks/useMySheets";
import EditSheetDialog from "./EditSheetDialog";
import ProfileSheetList, { SheetIconButton } from "./ProfileSheetList";

const TEXT_BUTTON_CLASS =
  "h-9 cursor-pointer border-2 border-[var(--color-ink)] px-3 font-[inherit] text-xs font-bold disabled:cursor-not-allowed disabled:opacity-60";

const MENU_ITEM_CLASS =
  "flex h-12 w-full cursor-pointer items-center gap-3 border-0 border-b-2 border-solid border-[var(--color-line-soft)] bg-transparent px-0 font-[inherit] text-[15px] font-bold text-[var(--color-ink)] no-underline disabled:cursor-not-allowed disabled:opacity-60";

const SheetActionSheet = ({ dialogRef, sheet, isPrivate, isSubmitting, isConfirmingDelete, onEdit, onToggleVisibility, onAskDelete, onConfirmDelete, onCancelDelete }) => {
  const close = () => dialogRef.current?.close();
  return (
    <dialog
      ref={dialogRef}
      aria-label={`Actions for ${sheet.title}`}
      onClick={(event) => {
        if (event.target === dialogRef.current) close();
      }}
      onClose={onCancelDelete}
      className="mb-0 mt-auto max-h-[85dvh] w-full max-w-none border-0 border-t-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 backdrop:bg-(--color-ink)/40 sm:hidden"
    >
      <div className="px-4 pb-5 pt-3">
        <span aria-hidden="true" className="mx-auto mb-3 block h-1 w-12 bg-[var(--color-line-dashed)]" />
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="m-0 truncate text-xl font-bold text-[var(--color-ink)]">{sheet.title}</h2>
            <p className="m-0 mt-0.5 truncate text-sm font-semibold text-[var(--color-neutral-600)]">{sheet.composer}</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--color-ink)]"
          >
            <X aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
        <Link to={`${ROUTES.WORKSPACE}/${encodeURIComponent(sheet.id)}`} className={MENU_ITEM_CLASS}>
          <PianoKeysIcon />
          Practice now
        </Link>
        <button type="button" className={MENU_ITEM_CLASS} onClick={() => { close(); onEdit(); }}>
          <Pencil size={18} aria-hidden="true" />
          Edit info
        </button>
        <button type="button" className={MENU_ITEM_CLASS} disabled={isSubmitting} onClick={onToggleVisibility}>
          {isPrivate ? <Globe size={18} aria-hidden="true" /> : <Lock size={18} aria-hidden="true" />}
          {isPrivate ? "Make public" : "Make private"}
        </button>
        {isConfirmingDelete ? (
          <div role="group" aria-label={`Confirm deleting ${sheet.title}`} className="flex items-center gap-2 pt-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirmDelete}
              className={`${TEXT_BUTTON_CLASS} h-11 flex-1 bg-[var(--color-danger)] text-sm text-[var(--color-neutral-white)]`}
            >
              Delete forever
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onCancelDelete}
              className={`${TEXT_BUTTON_CLASS} h-11 flex-1 bg-[var(--color-surface-card)] text-sm text-[var(--color-ink)]`}
            >
              Keep
            </button>
          </div>
        ) : (
          <button type="button" className={`${MENU_ITEM_CLASS} border-b-0 text-[var(--color-danger)]!`} onClick={onAskDelete}>
            <Trash2 size={18} aria-hidden="true" />
            Delete sheet
          </button>
        )}
      </div>
    </dialog>
  );
};

const UploadedSheetActions = ({ sheet, onUpdate, onRemove }) => {
  const menuRef = useRef(null);
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

  const toggleVisibility = () =>
    run(
      () => onUpdate(sheet.id, { visibility: isPrivate ? "PUBLIC" : "PRIVATE" }),
      "Unable to update. Please try again.",
    );
  const confirmDelete = () => run(() => onRemove(sheet.id), "Unable to delete. Please try again.");

  return (
    <div className="flex flex-wrap items-center gap-2 max-sm:basis-full max-sm:justify-end">
      <button
        type="button"
        aria-label={`More actions for ${sheet.title}`}
        aria-haspopup="dialog"
        onClick={() => menuRef.current?.showModal()}
        className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 text-[var(--color-ink)] sm:hidden"
      >
        <Ellipsis size={18} aria-hidden="true" />
      </button>
      <SheetActionSheet
        dialogRef={menuRef}
        sheet={sheet}
        isPrivate={isPrivate}
        isSubmitting={isSubmitting}
        isConfirmingDelete={isConfirmingDelete}
        onEdit={() => setIsEditing(true)}
        onToggleVisibility={toggleVisibility}
        onAskDelete={() => setIsConfirmingDelete(true)}
        onConfirmDelete={confirmDelete}
        onCancelDelete={() => setIsConfirmingDelete(false)}
      />
      <div className="contents max-sm:hidden">
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
        onClick={toggleVisibility}
      >
        {isPrivate ? <Globe size={16} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
      </SheetIconButton>
      {isConfirmingDelete ? (
        <div role="group" aria-label={`Confirm deleting ${sheet.title}`} className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={confirmDelete}
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
      </div>
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
