import { CircleUserRound, Eye } from 'lucide-react';
import PianoKeysIcon from '../../../components/icons/PianoKeysIcon';
import LikeButton from '../../library/components/LikeButton';
import PrivateBadge from '../../library/components/PrivateBadge';
import { uploaderLabel } from '../../library/utils/uploader';
import { DIFFICULTY_META } from '../../library/config/difficulty';
import { formatCount } from '../../../utils/format';

const Dot = () => (
  <span aria-hidden="true" className="block h-1 w-1 bg-[var(--color-neutral-250)]" />
);

const SkeletonInfo = () => (
  <div aria-hidden="true" className="flex flex-col gap-2.5">
    <div className="h-7 w-72 animate-pulse bg-[var(--color-skeleton)]" />
    <div className="h-4 w-48 animate-pulse bg-[var(--color-skeleton)]" />
    <div className="h-4 w-64 animate-pulse bg-[var(--color-skeleton)]" />
  </div>
);

const SheetInfoPanel = ({ sheet, status, notFound = false }) => {
  const difficulty = sheet ? DIFFICULTY_META[sheet.difficulty] : null;

  return (
    <div className="flex items-center gap-5">
      <span
        aria-hidden="true"
        className="flex h-[58px] w-[58px] shrink-0 items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-brand-tint)] text-[var(--color-brand-strong)] shadow-[var(--shadow-hard)]"
      >
        <PianoKeysIcon className="h-7 w-7" />
      </span>

      {!sheet && status !== 'error' && <SkeletonInfo />}
      {!sheet && status === 'error' && (
        <h1 className="m-0 text-[26px] font-bold leading-tight text-[var(--color-ink)]">{notFound ? 'Sheet not found' : 'Sheet unavailable'}</h1>
      )}

      {sheet && (
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <h1 className="m-0 text-[26px] font-bold leading-tight text-[var(--color-ink)]">{sheet.title}</h1>
            <p className="m-0 text-xl font-semibold text-[var(--color-neutral-450)]">{sheet.composer}</p>
          </div>

          {sheet.subtitle && (
            <p className="m-0 self-start border-[1.5px] border-[var(--color-ink)] bg-[var(--color-pastel-cream)] px-2.5 py-0.5 text-[13px] font-bold text-[var(--color-ink)]">
              {sheet.subtitle}
            </p>
          )}

          <ul className="m-0 flex list-none flex-wrap items-center gap-x-3 gap-y-2 p-0 text-sm font-bold text-[var(--color-neutral-600)]">
            {sheet.visibility === 'PRIVATE' && (
              <li>
                <PrivateBadge className="text-xs" />
              </li>
            )}
            {difficulty && (
              <li>
                <span className={`flex items-center gap-1.5 border-[1.5px] border-[var(--color-ink)] px-2 py-0.5 text-xs ${difficulty.badgeClass}`}>
                  <span aria-hidden="true" className={`h-1.5 w-1.5 ${difficulty.dotClass}`} />
                  {difficulty.label}
                </span>
              </li>
            )}
            {sheet.tags.map((tag) => (
              <li key={tag} className="border-[1.5px] border-[var(--color-line-disabled)] px-2 py-0.5 text-xs text-[var(--color-ink)]">
                {tag}
              </li>
            ))}
            <li aria-hidden="true"><Dot /></li>
            <li className="flex items-center gap-1.5" aria-label={`${sheet.views} views`}>
              <Eye aria-hidden="true" className="h-4 w-4" />
              {formatCount(sheet.views)} views
            </li>
            <li aria-hidden="true"><Dot /></li>
            <li>
              <LikeButton sheetId={sheet.id} liked={sheet.likedByMe} likes={sheet.likes} suffix=" likes" />
            </li>
            {uploaderLabel(sheet) && (
              <>
                <li aria-hidden="true"><Dot /></li>
                <li className="flex min-w-0 items-center gap-1.5">
                  <CircleUserRound aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span className="truncate">{uploaderLabel(sheet)}</span>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SheetInfoPanel;
