import { Link } from 'react-router-dom';
import { Clock, Eye, Heart } from 'lucide-react';
import SheetCover from './SheetCover';
import { formatCount, formatDuration } from '../../../utils/format';

// Icon bàn phím (khung vuông + phím) theo thiết kế; lucide chỉ có icon đàn grand
const PianoKeysIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="1.5" y="1.5" width="13" height="13" />
    <path d="M5.5 1.5v13M10.5 1.5v13" />
    <path d="M4 1.5v7h3v-7M9 1.5v7h3v-7" fill="currentColor" strokeWidth="0" />
  </svg>
);

// Card một bản nhạc trong lưới Library. Nút Thích / Thêm vào bộ sưu tập chờ Feature User nên chưa hiển thị.
const SheetCard = ({ sheet }) => {
  const byline = sheet.subtitle ? `${sheet.composer} · ${sheet.subtitle}` : sheet.composer;

  return (
    <article className="flex flex-col border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] shadow-[var(--shadow-hard)]">
      <div className="border-b-2 border-[var(--color-ink)]">
        <SheetCover sheet={sheet} />
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        {/* index.css không nạp preflight nên phải tự bỏ margin/padding mặc định của h2, p, ul */}
        <h2 title={sheet.title} className="m-0 truncate text-[19px] font-bold leading-tight text-[var(--color-ink)]">
          {sheet.title}
        </h2>
        <p title={byline} className="m-0 mt-1 truncate text-sm text-[var(--color-neutral-450)]">
          {byline}
        </p>

        <ul className="m-0 mt-3 flex list-none items-center gap-5 p-0 text-sm font-bold">
          <li className="flex items-center gap-1.5 text-[var(--color-neutral-600)]" aria-label={`${sheet.views} lượt xem`}>
            <Eye aria-hidden="true" className="h-4 w-4" />
            {formatCount(sheet.views)}
          </li>
          <li className="flex items-center gap-1.5 text-[var(--color-danger)]" aria-label={`${sheet.likes} lượt thích`}>
            <Heart aria-hidden="true" className="h-4 w-4 fill-[var(--color-danger-bright)] text-[var(--color-danger-bright)]" />
            {formatCount(sheet.likes)}
          </li>
          <li className="flex items-center gap-1.5 text-[var(--color-neutral-600)]" aria-label={`Thời lượng ${formatDuration(sheet.durationSec)}`}>
            <Clock aria-hidden="true" className="h-4 w-4" />
            {formatDuration(sheet.durationSec)}
          </li>
        </ul>

        <div className="mt-auto pt-3">
          <div aria-hidden="true" className="mb-3 border-0 border-t-2 border-dashed border-[var(--color-line-dashed)]" />
          <Link
            to={`/workspace/${encodeURIComponent(sheet.id)}`}
            className="flex h-10 items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-brand)] text-[15px] font-bold text-[var(--color-neutral-white)] no-underline shadow-[var(--shadow-hard-sm)] transition-colors hover:bg-[var(--color-brand-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
          >
            <PianoKeysIcon />
            Luyện tập
          </Link>
        </div>
      </div>
    </article>
  );
};

export default SheetCard;
