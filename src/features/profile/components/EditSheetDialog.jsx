import { X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useTags } from "../../library/hooks/useTags";
import PrivacyOptions from "../../upload/components/PrivacyOptions";
import { DifficultyPicker, TextField } from "../../upload/components/SheetDetailsForm";
import { CoverColorPicker } from "../../upload/components/SheetPreview";
import TagInput from "../../upload/components/TagInput";
import { COMPOSER_MAX, TITLE_MAX } from "../../upload/config/upload";
import { publishErrorTarget } from "../../upload/utils/publishError";
import { validateDetails } from "../../upload/utils/sheetDetails";
import { toEditDetails, toSheetUpdate } from "../utils/mySheets";

const BUTTON_CLASS =
  "h-10 cursor-pointer border-2 border-[var(--color-ink)] px-4 font-[inherit] text-sm font-bold disabled:cursor-not-allowed disabled:opacity-60";

// Sửa thông tin bài đã upload (không đổi nốt). Chỉ được render khi đang mở.
const EditSheetDialog = ({ sheet, onSave, onClose }) => {
  const dialogRef = useRef(null);
  const tagsId = useId();
  const knownTags = useTags().map((tag) => tag.name);
  const [details, setDetails] = useState(() => toEditDetails(sheet));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    dialogRef.current.showModal();
  }, []);

  const change = (name, value) => {
    setDetails((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateDetails(details);
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setIsSaving(true);
    try {
      await onSave(toSheetUpdate(details));
      onClose();
    } catch (error) {
      const target = publishErrorTarget(error);
      if (target.card === "details") setErrors({ [target.field]: error.message });
      else setFormError(error.message ?? "Unable to save. Please try again.");
      setIsSaving(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label={`Edit ${sheet.title}`}
      onClose={onClose}
      onCancel={(event) => {
        if (isSaving) event.preventDefault();
      }}
      className="m-auto max-h-[85dvh] w-[min(640px,calc(100vw-32px))] overflow-y-auto border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 shadow-[var(--shadow-hard-lg)]"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 px-6 py-5">
        <header className="flex items-center justify-between gap-4">
          <h2 className="m-0 text-xl font-extrabold text-[var(--color-ink)]">Edit sheet</h2>
          <button
            type="button"
            aria-label="Close"
            disabled={isSaving}
            onClick={onClose}
            className="flex size-9 cursor-pointer items-center justify-center border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 text-[var(--color-ink)]"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>
        <fieldset disabled={isSaving} className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0">
          <TextField
            label="Title"
            required
            value={details.title}
            onChange={(value) => change("title", value)}
            error={errors.title}
            maxLength={TITLE_MAX}
          />
          <TextField
            label="Composer / Artist"
            value={details.composer}
            onChange={(value) => change("composer", value)}
            error={errors.composer}
            hint="Leave it empty if you don’t know. It will show as Unknown."
            maxLength={COMPOSER_MAX}
            placeholder="Unknown"
          />
          <DifficultyPicker
            value={details.difficulty}
            onChange={(level) => change("difficulty", level)}
            error={errors.difficulty}
          />
          <div className="min-w-0">
            <label htmlFor={tagsId} className="mb-2 block text-sm font-bold text-[var(--color-ink)]">
              Tags
            </label>
            <TagInput
              id={tagsId}
              tags={details.tags}
              knownTags={knownTags}
              onChange={(tags) => change("tags", tags)}
              error={errors.tags}
            />
          </div>
          <CoverColorPicker value={details.coverColor} onChange={(color) => change("coverColor", color)} />
          <PrivacyOptions value={details.visibility} onChange={change} />
        </fieldset>
        {formError && (
          <p role="alert" className="m-0 text-sm font-semibold text-[var(--color-danger)]">
            {formError}
          </p>
        )}
        <footer className="flex justify-end gap-2">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className={`${BUTTON_CLASS} bg-[var(--color-surface-card)] text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`${BUTTON_CLASS} bg-[var(--color-brand)] text-[var(--color-neutral-white)] hover:bg-[var(--color-brand-strong)]`}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </footer>
      </form>
    </dialog>
  );
};

export default EditSheetDialog;
