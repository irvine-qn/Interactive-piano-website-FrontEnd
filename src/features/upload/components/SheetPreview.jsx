import { useId } from 'react';
import { Check, Clock, Gauge, Music } from 'lucide-react';
import SheetCover from '../../library/components/SheetCover';
import { COVER_BG } from '../../library/config/cover';
import { COVER_COLORS } from '../config/upload';
import { cleanText, formatKey, formatTimeSignature, toSlug } from '../utils/sheetDetails';
import { formatDuration } from '../../../utils/format';

// Ô chọn màu bìa: 4 ô vuông (radio)
const CoverColorPicker = ({ value, onChange }) => {
  const name = useId();
  return (
    <fieldset className="m-0 border-0 p-0">
      <legend className="mb-2 p-0 text-sm font-bold text-[var(--color-ink)]">Cover color</legend>
      <div className="flex gap-2.5">
        {Object.entries(COVER_COLORS).map(([color, label]) => {
          const checked = value === color;
          return (
            <label
              key={color}
              title={label}
              className={`flex h-10 w-10 cursor-pointer items-center justify-center border-2 border-solid border-[var(--color-ink)] ${COVER_BG[color]} ${
                checked ? 'shadow-[var(--shadow-hard-sm)]' : 'hover:-translate-y-0.5'
              } has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-ink)]`}
            >
              <input type="radio" name={name} value={color} checked={checked} onChange={() => onChange(color)} aria-label={label} className="sr-only" />
              {checked && <Check aria-hidden="true" strokeWidth={3} className="h-5 w-5 text-[var(--color-ink)]" />}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};

// Thẻ Preview: card bài giống ở Sheet Library, cập nhật ngay theo thông tin đang nhập.
// Bìa vẽ theo id dự kiến (toSlug(title)) nên giống bìa thật khi bài lên Library.
const SheetPreview = ({ analysis, details, onChange }) => {
  const title = cleanText(details.title) || 'Untitled';
  const composer = cleanText(details.composer) || 'Unknown';
  const facts = [
    { icon: Gauge, label: 'Tempo', text: `${analysis.bpm} BPM`, accent: true },
    { icon: Music, label: 'Key', text: formatKey(analysis.keySignature) },
    { label: 'Time signature', text: formatTimeSignature(analysis.timeSignature) },
    { icon: Clock, label: 'Length', text: formatDuration(analysis.durationSec) },
  ];

  return (
    <div className="flex flex-col gap-5">
      <figure className="m-0">
        <article
          aria-label={`Preview of ${title}`}
          className="border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] shadow-[var(--shadow-hard)]"
        >
          <div className="border-0 border-b-2 border-solid border-[var(--color-ink)]">
            <SheetCover sheet={{ id: toSlug(details.title), coverColor: details.coverColor, difficulty: details.difficulty }} />
          </div>
          <div className="px-4 pb-4 pt-3.5">
            <h3 title={title} className="m-0 truncate text-[19px] font-bold leading-tight text-[var(--color-ink)]">
              {title}
            </h3>
            <p title={composer} className="m-0 mt-1 truncate text-sm text-[var(--color-neutral-450)]">
              {composer}
            </p>
            <ul className="m-0 mt-3 flex list-none flex-wrap items-center gap-x-4 gap-y-1 p-0 text-sm font-bold text-[var(--color-neutral-600)]">
              {facts.map(({ icon: Icon, label, text, accent }) => (
                <li key={label} aria-label={`${label}: ${text}`} className={`flex items-center gap-1.5 ${accent ? 'text-[var(--color-brand-strong)]' : ''}`}>
                  {Icon && <Icon aria-hidden="true" className="h-4 w-4" />}
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </article>
        <figcaption className="mt-3 text-xs font-medium text-[var(--color-neutral-500)]">
          This is how your sheet will look in the Sheet Library.
        </figcaption>
      </figure>
      <CoverColorPicker value={details.coverColor} onChange={(color) => onChange('coverColor', color)} />
    </div>
  );
};

export default SheetPreview;
