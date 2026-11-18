import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import LikeButton from './LikeButton';
import SheetCover from './SheetCover';
import PrivateBadge from './PrivateBadge';
import UploadedBy from './UploadedBy';
import { uploaderLabel } from '../utils/uploader';
import PianoKeysIcon from '../../../components/icons/PianoKeysIcon';
import { formatCount, formatDuration } from '../../../utils/format';

const SheetCard = ({ sheet }) => {
  const byline = sheet.subtitle ? `${sheet.composer} · ${sheet.subtitle}` : sheet.composer;
  const uploadedBy = uploaderLabel(sheet);

  return (
    <article className="grid grid-cols-[8.5rem_minmax(0,1fr)] sm:flex sm:flex-col border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] shadow-[var(--shadow-hard)]">
      <div className="border-r-2 border-[var(--color-ink)] sm:border-r-0 sm:border-b-2">
        <SheetCover sheet={sheet} className="max-sm:aspect-auto max-sm:h-full max-sm:min-h-[9.5rem]" />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3.5">
        <div className="mb-1.5 flex gap-1.5 sm:hidden">
          {sheet.visibility === 'PRIVATE' && <PrivateBadge />}
          <span className="border-[1.5px] border-[var(--color-ink)] bg-[var(--color-surface-card)] px-1.5 py-px text-[11px] font-bold text-[var(--color-brand-deep)]">
            MIDI
          </span>
        </div>
        <h2 title={sheet.title} className="m-0 truncate text-[17px] sm:text-[19px] font-bold leading-tight text-[var(--color-ink)]">
          {sheet.title}
        </h2>
        <p title={byline} className="m-0 mt-1 truncate text-sm text-[var(--color-neutral-450)]">
          {byline}
        </p>
        {uploadedBy && <UploadedBy text={uploadedBy} />}

        <ul className="m-0 mt-2 sm:mt-3 flex list-none flex-wrap items-center gap-x-3 gap-y-1 sm:gap-5 p-0 text-sm font-bold">
          <li className="flex items-center gap-1.5 text-[var(--color-neutral-600)]" aria-label={`${sheet.views} views`}>
            <Eye aria-hidden="true" className="h-4 w-4" />
            {formatCount(sheet.views)}
          </li>
          <li>
            <LikeButton sheetId={sheet.id} liked={sheet.likedByMe} likes={sheet.likes} />
          </li>
          <li className="flex items-center gap-1.5 text-[var(--color-neutral-600)]" aria-label={`Duration ${formatDuration(sheet.durationSec)}`}>
            <Clock aria-hidden="true" className="h-4 w-4" />
            {formatDuration(sheet.durationSec)}
          </li>
        </ul>

        <div className="mt-auto pt-3">
          <div aria-hidden="true" className="mb-3 hidden sm:block border-0 border-t-2 border-dashed border-[var(--color-line-dashed)]" />
          <Link
            to={`/workspace/${encodeURIComponent(sheet.id)}`}
            state={{ countView: true }}
            className="flex h-10 items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-brand)] text-[15px] font-bold text-[var(--color-ink)] no-underline shadow-[var(--shadow-hard-sm)] transition-colors hover:bg-[var(--color-brand-strong)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
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
