import { X } from 'lucide-react';
import PianoKeysIcon from '../../../components/icons/PianoKeysIcon';
import { formatFileSize } from '../../../utils/format';

const STATUS = {
  uploading: { text: (progress) => `${progress}%`, color: 'text-[var(--color-brand-deep)]', bar: 'bg-[var(--color-brand)]' },
  analyzing: { text: () => 'Analyzing…', color: 'text-[var(--color-brand-deep)]', bar: 'bg-[var(--color-brand)]' },
  ready: { text: () => 'Ready', color: 'text-[var(--color-success-strong)]', bar: 'bg-[var(--color-success)]' },
  error: { text: () => 'Failed', color: 'text-[var(--color-danger)]', bar: 'bg-[var(--color-danger)]' },
};

const plural = (count, word) => `${count.toLocaleString('en')} ${word}${count === 1 ? '' : 's'}`;

// Dòng file đã chọn (theo thiết kế): biểu tượng, tên, dung lượng + số nốt / track, thanh tiến trình, trạng thái, nút bỏ file
const FileRow = ({ file, upload, analysis, onRemove }) => {
  const status = STATUS[upload.status];
  const isBusy = upload.status === 'uploading' || upload.status === 'analyzing';
  const barWidth = upload.status === 'uploading' ? upload.progress : 100;
  const details = [formatFileSize(file.size)];
  if (analysis && upload.status === 'ready') {
    details.push(plural(analysis.noteCount, 'note'), plural(analysis.selectedTracks.length, 'track'));
  }

  return (
    <div className="flex items-center gap-4 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 py-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-solid border-[var(--color-ink)] bg-[var(--color-brand-tint)] text-[var(--color-brand-strong)]">
        <PianoKeysIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-bold text-[var(--color-ink)]" title={file.name}>
          {file.name}
        </p>
        <p className="m-0 mt-0.5 text-xs font-medium text-[var(--color-neutral-400)]">{details.join(' • ')}</p>
        {upload.status === 'error' && (
          <p role="alert" className="m-0 mt-1 text-xs font-semibold text-[var(--color-danger)]">
            {upload.error.message}
          </p>
        )}
      </div>
      {status && upload.status !== 'error' && (
        <div
          role="progressbar"
          aria-label={`${file.name}: ${status.text(upload.progress)}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={barWidth}
          className="hidden h-3 w-[200px] shrink-0 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] sm:block"
        >
          <div className={`h-full ${status.bar} ${upload.status === 'analyzing' ? 'animate-pulse' : ''}`} style={{ width: `${barWidth}%` }} />
        </div>
      )}
      {status && (
        <span aria-live="polite" className={`w-20 shrink-0 text-right text-xs font-bold ${status.color}`}>
          {status.text(upload.progress)}
        </span>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={isBusy ? `Cancel and remove ${file.name}` : `Remove ${file.name}`}
        title="Remove file"
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--color-ink)] hover:text-[var(--color-danger)]"
      >
        <X aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  );
};

export default FileRow;
