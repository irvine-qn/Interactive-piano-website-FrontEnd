import { Link } from 'react-router-dom';
import { Clock, Eye, Heart } from 'lucide-react';
import SheetCover from './SheetCover';
import PianoKeysIcon from '../../../components/icons/PianoKeysIcon';
import { formatCount, formatDuration } from '../../../utils/format';

const SheetCard = ({ sheet }) => {
  const byline = sheet.subtitle ? `${sheet.composer} · ${sheet.subtitle}` : sheet.composer;

  return (
    <article className="flex flex-col border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] shadow-[var(--shadow-hard)]">
      <div className="border-b-2 border-[var(--color-ink)]">
        <SheetCover sheet={sheet} />
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-3.5">
        <h2 title={sheet.title} className="m-0 truncate text-[19px] font-bold leading-tight text-[var(--color-ink)]">
          {sheet.title}
        </h2>
        <p title={byline} className="m-0 mt-1 truncate text-sm text-[var(--color-neutral-450)]">
          {byline}
        </p>

        <ul className="m-0 mt-3 flex list-none items-center gap-5 p-0 text-sm font-bold">
          <li className="flex items-center gap-1.5 text-[var(--color-neutral-600)]" aria-label={`${sheet.views} views`}>
            <Eye aria-hidden="true" className="h-4 w-4" />
            {formatCount(sheet.views)}
          </li>
          <li className="flex items-center gap-1.5 text-[var(--color-danger)]" aria-label={`${sheet.likes} likes`}>
            <Heart aria-hidden="true" className="h-4 w-4 fill-[var(--color-danger-bright)] text-[var(--color-danger-bright)]" />
            {formatCount(sheet.likes)}
          </li>
          <li className="flex items-center gap-1.5 text-[var(--color-neutral-600)]" aria-label={`Duration ${formatDuration(sheet.durationSec)}`}>
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
            Practice
          </Link>
        </div>
      </div>
    </article>
  );
};

export default SheetCard;
