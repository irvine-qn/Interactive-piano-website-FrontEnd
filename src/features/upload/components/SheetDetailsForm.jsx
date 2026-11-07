import { useId } from 'react';
import { COMPOSER_MAX, DIFFICULTIES, TITLE_MAX } from '../config/upload';
import { DIFFICULTY_META } from '../../library/config/difficulty';
import { formatDuration } from '../../../utils/format';
import { formatKey, formatTimeSignature } from '../utils/sheetDetails';
import TagInput from './TagInput';

const INPUT_CLASS =
  'h-12 w-full border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 font-[inherit] text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-neutral-300)] focus:border-[var(--color-brand)] aria-[invalid=true]:border-[var(--color-danger)]';
const LABEL_CLASS = 'mb-2 block text-sm font-bold text-[var(--color-ink)]';

// Câu dưới ô: lỗi (đỏ) thay cho gợi ý (xám)
const FieldMessage = ({ id, error, hint }) =>
  error ? (
    <p id={id} role="alert" className="m-0 mt-1.5 text-xs font-semibold text-[var(--color-danger)]">
      {error}
    </p>
  ) : (
    hint && (
      <p id={id} className="m-0 mt-1.5 text-xs font-medium text-[var(--color-neutral-500)]">
        {hint}
      </p>
    )
  );

export const TextField = ({ label, required, value, onChange, error, hint, maxLength, placeholder, autoComplete = 'off' }) => {
  const id = useId();
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
        {required && <span className="ml-2 text-[var(--color-danger)]">*</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-message`}
        className={INPUT_CLASS}
      />
      <FieldMessage id={`${id}-message`} error={error} hint={hint} />
    </div>
  );
};

// Độ khó: 4 nút liền nhau (radio), chọn sẵn mức Backend gợi ý
export const DifficultyPicker = ({ value, suggested, onChange, error }) => {
  const name = useId();
  const suggestedLabel = DIFFICULTY_META[suggested]?.label;
  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className={`${LABEL_CLASS} p-0`}>
        Difficulty<span className="ml-2 text-[var(--color-danger)]">*</span>
      </legend>
      <div className="flex w-fit max-w-full flex-wrap border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)]">
        {DIFFICULTIES.map((level) => {
          const checked = value === level;
          return (
            <label
              key={level}
              className={`flex h-11 cursor-pointer items-center px-4 text-sm font-bold has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-4 has-[:focus-visible]:outline-[var(--color-ink)] ${
                checked
                  ? 'bg-[var(--color-brand)] text-[var(--color-neutral-white)]'
                  : 'text-[var(--color-ink)] hover:bg-[var(--color-brand-glow)]'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={level}
                checked={checked}
                onChange={() => onChange(level)}
                className="sr-only"
              />
              {DIFFICULTY_META[level].label}
            </label>
          );
        })}
      </div>
      <FieldMessage
        error={error}
        hint={suggestedLabel && `We suggest ${suggestedLabel} from how many notes are played at once and how fast.`}
      />
    </fieldset>
  );
};

// Thông tin lấy từ file, chỉ hiển thị (đổi track thì số nốt và thời lượng đổi theo)
const FileFacts = ({ analysis }) => {
  const facts = [
    ['Tempo', `${analysis.bpm} BPM`],
    ['Key', formatKey(analysis.keySignature)],
    ['Time', formatTimeSignature(analysis.timeSignature)],
    ['Length', formatDuration(analysis.durationSec)],
    ['Notes', analysis.noteCount.toLocaleString('en')],
  ];
  return (
    <div>
      <p className={`${LABEL_CLASS} mb-1`}>From the file</p>
      <p className="m-0 mb-2 text-xs font-medium text-[var(--color-neutral-500)]">Read from your MIDI file, so they can’t be changed here.</p>
      <dl className="m-0 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {facts.map(([label, value]) => (
          <div key={label} className="min-w-0 border-2 border-solid border-[var(--color-line-soft)] bg-[var(--color-surface-soft)] px-3 py-2">
            <dt className="text-[11px] font-bold uppercase tracking-wide text-[var(--color-neutral-500)]">{label}</dt>
            <dd className="m-0 truncate text-sm font-bold tabular-nums text-[var(--color-ink)]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

// Thẻ ③ Sheet details: tên bài, tác giả, độ khó, tag + thông tin đọc từ file.
// Giá trị và lỗi lấy từ useUploadForm (`details`, `detailErrors`), sửa qua `onChange(name, value)`.
const SheetDetailsForm = ({ analysis, details, errors, knownTags, onChange }) => {
  const tagsId = useId();
  return (
    <div className="flex flex-col gap-5">
      <TextField
        label="Title"
        required
        value={details.title}
        onChange={(value) => onChange('title', value)}
        error={errors.title}
        hint={details.title === analysis.suggestedTitle ? 'We filled this in from the file name.' : null}
        maxLength={TITLE_MAX}
      />
      <TextField
        label="Composer / Artist"
        value={details.composer}
        onChange={(value) => onChange('composer', value)}
        error={errors.composer}
        hint="Leave it empty if you don’t know. It will show as Unknown."
        maxLength={COMPOSER_MAX}
        placeholder="Unknown"
      />
      <FileFacts analysis={analysis} />
      <div className="grid gap-5 xl:grid-cols-[auto_minmax(0,1fr)]">
        <DifficultyPicker
          value={details.difficulty}
          suggested={analysis.suggestedDifficulty}
          onChange={(level) => onChange('difficulty', level)}
          error={errors.difficulty}
        />
        <div className="min-w-0">
          <label htmlFor={tagsId} className={LABEL_CLASS}>
            Tags
          </label>
          <TagInput
            id={tagsId}
            tags={details.tags}
            knownTags={knownTags}
            onChange={(tags) => onChange('tags', tags)}
            error={errors.tags}
          />
        </div>
      </div>
    </div>
  );
};

export default SheetDetailsForm;
