import { AlertTriangle } from 'lucide-react';
import { formatDuration } from '../../../utils/format';

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const plural = (count, word) => `${count.toLocaleString('en')} ${word}${count === 1 ? '' : 's'}`;

const Badge = ({ tone, children }) => (
  <span
    className={`inline-block border-[1.5px] border-solid px-1.5 py-px text-[11px] font-bold leading-4 ${
      tone === 'brand'
        ? 'border-[var(--color-brand-strong)] bg-[var(--color-brand-tint)] text-[var(--color-brand-deep)]'
        : 'border-[var(--color-neutral-400)] bg-[var(--color-surface-muted)] text-[var(--color-neutral-600)]'
    }`}
  >
    {children}
  </span>
);

const HEADER_CELL = 'border-0 border-b-2 border-solid border-[var(--color-ink)] px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-[var(--color-neutral-600)]';
const CELL = 'border-0 border-b border-solid border-[var(--color-line-soft)] px-3 py-2.5 text-sm text-[var(--color-ink)]';

// Thẻ ② Tracks: chọn track của file MIDI (BE gợi ý sẵn, tự chọn chỉ đúng 8/9 bài mẫu nên người dùng xác nhận).
// Đổi lựa chọn -> onChange(tracks) để BE tính lại số nốt, thời lượng, độ khó, cảnh báo.
const TrackTable = ({ analysis, selectedTracks, isUpdating, error, onChange }) => {
  const selected = new Set(selectedTracks);
  const toggle = (index) => {
    const next = selected.has(index) ? selectedTracks.filter((track) => track !== index) : [...selectedTracks, index];
    // Giữ thứ tự track như trong file để BE nhận cùng một lựa chọn dù người dùng bấm theo thứ tự nào
    onChange(next.sort((a, b) => a - b));
  };

  return (
    <div className="flex flex-col gap-4">
      <p aria-live="polite" className="m-0 text-sm font-semibold text-[var(--color-neutral-600)]">
        {selectedTracks.length} of {plural(analysis.tracks.length, 'track')} selected •{' '}
        {isUpdating ? 'Updating…' : `${plural(analysis.noteCount, 'note')} • ${formatDuration(analysis.durationSec)}`}
      </p>

      <div className="overflow-x-auto border-2 border-solid border-[var(--color-ink)]">
        <table className="w-full min-w-[560px] border-collapse">
          <thead className="bg-[var(--color-surface-soft)]">
            <tr>
              <th scope="col" className={HEADER_CELL}>Track</th>
              <th scope="col" className={HEADER_CELL}>Instrument</th>
              <th scope="col" className={`${HEADER_CELL} text-right`}>Notes</th>
              <th scope="col" className={HEADER_CELL}>Range</th>
            </tr>
          </thead>
          <tbody>
            {analysis.tracks.map((track) => {
              const checked = selected.has(track.index);
              const isLastChecked = checked && selectedTracks.length === 1;
              const label = `Track ${track.index + 1}`;
              return (
                <tr key={track.index} className={checked ? 'bg-[var(--color-brand-glow)]' : undefined}>
                  <td className={CELL}>
                    <label className={`flex items-center gap-3 ${isLastChecked ? 'cursor-not-allowed' : 'cursor-pointer'}`} title={isLastChecked ? 'Keep at least one track.' : undefined}>
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={isLastChecked}
                        onChange={() => toggle(track.index)}
                        className="h-4 w-4 shrink-0 cursor-[inherit] accent-[var(--color-brand)]"
                      />
                      <span className="flex min-w-0 flex-col">
                        <span className="font-bold">{label}</span>
                        {track.name && <span className="truncate text-xs text-[var(--color-neutral-500)]">{track.name}</span>}
                      </span>
                    </label>
                  </td>
                  <td className={CELL}>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span>{track.instrument ? capitalize(track.instrument) : 'Unknown instrument'}</span>
                      {track.suggested && <Badge tone="brand">Suggested</Badge>}
                      {track.isPercussion && <Badge>Drums</Badge>}
                    </span>
                  </td>
                  <td className={`${CELL} text-right tabular-nums`}>{track.noteCount.toLocaleString('en')}</td>
                  <td className={`${CELL} whitespace-nowrap tabular-nums`}>
                    {track.minNote} – {track.maxNote}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {error && (
        <p role="alert" className="m-0 text-sm font-semibold text-[var(--color-danger)]">
          {error.message} Your previous selection was kept.
        </p>
      )}

      {analysis.warnings.length > 0 && (
        <ul aria-label="Warnings" className="m-0 flex list-none flex-col gap-2 p-0">
          {analysis.warnings.map((warning) => (
            <li
              key={warning.code}
              className="flex items-start gap-2 border-2 border-solid border-[var(--color-warning-border)] bg-[var(--color-warning-tint)] px-3 py-2 text-sm text-[var(--color-warning-deep)]"
            >
              <AlertTriangle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{warning.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrackTable;
