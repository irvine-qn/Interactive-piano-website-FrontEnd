import { useId, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { MAX_TAGS, TAG_MAX } from '../config/upload';
import { addTag } from '../utils/sheetDetails';

const MAX_SUGGESTIONS = 8;

// Ô tag dạng chip: gõ rồi Enter / dấu phẩy (hoặc rời ô) để thêm, Backspace ở ô trống để xoá tag cuối,
// hoặc bấm tag có sẵn của Library ở dưới. Tag là dữ liệu của form (giữ trong useUploadForm),
// chỉ chữ đang gõ và lỗi của lần thêm gần nhất là state tạm của ô này.
const TagInput = ({ id, tags, knownTags, onChange, error: formError }) => {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState(null);
  const hintId = useId();
  const isFull = tags.length >= MAX_TAGS;

  const add = (raw) => {
    const result = addTag(tags, raw, knownTags);
    if (result.error) {
      setError(result.error);
      return false;
    }
    if (result.tags !== tags) onChange(result.tags);
    setDraft('');
    setError(null);
    return true;
  };

  const remove = (tag) => {
    onChange(tags.filter((item) => item !== tag));
    setError(null);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(draft);
    } else if (event.key === 'Backspace' && !draft && tags.length) {
      remove(tags[tags.length - 1]);
    }
  };

  const query = draft.trim().toLowerCase();
  const chosen = new Set(tags.map((tag) => tag.toLowerCase()));
  const suggestions = isFull
    ? []
    : knownTags
        .filter((tag) => !chosen.has(tag.toLowerCase()) && tag.toLowerCase().includes(query))
        .slice(0, MAX_SUGGESTIONS);
  const message = error ?? formError;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-h-12 flex-wrap items-center gap-2 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] px-3 py-2 focus-within:border-[var(--color-brand)]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 border-[1.5px] border-solid border-[var(--color-brand-strong)] bg-[var(--color-brand-tint)] py-0.5 pl-2 pr-1 text-xs font-bold text-[var(--color-brand-deep)]"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(tag)}
              aria-label={`Remove tag ${tag}`}
              className="flex cursor-pointer border-0 bg-transparent p-0.5 text-inherit hover:text-[var(--color-danger)]"
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          disabled={isFull}
          maxLength={TAG_MAX + 10}
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => draft.trim() && add(draft)}
          placeholder={isFull ? `Up to ${MAX_TAGS} tags` : 'Add a tag…'}
          aria-describedby={hintId}
          aria-invalid={message ? true : undefined}
          className="h-7 min-w-[7.5rem] flex-1 border-0 bg-transparent p-0 font-[inherit] text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-neutral-300)] disabled:cursor-not-allowed"
        />
      </div>

      {message ? (
        <p id={hintId} role="alert" className="m-0 text-xs font-semibold text-[var(--color-danger)]">
          {message}
        </p>
      ) : (
        <p id={hintId} className="m-0 text-xs font-medium text-[var(--color-neutral-500)]">
          Up to {MAX_TAGS} tags, like a genre or a mood. Press Enter to add.
        </p>
      )}

      {suggestions.length > 0 && (
        <ul aria-label="Tags in the Sheet Library" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
          {suggestions.map((tag) => (
            <li key={tag}>
              <button
                type="button"
                // Không cho input mất focus trước khi thêm (onBlur sẽ thêm chữ đang gõ thay vì tag được bấm)
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => add(tag)}
                className="flex cursor-pointer items-center gap-1 border-[1.5px] border-solid border-[var(--color-neutral-400)] bg-[var(--color-surface-muted)] px-2 py-0.5 font-[inherit] text-xs font-semibold text-[var(--color-neutral-600)] hover:border-[var(--color-brand-strong)] hover:text-[var(--color-brand-deep)]"
              >
                <Plus aria-hidden="true" className="h-3 w-3" />
                {tag}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagInput;
