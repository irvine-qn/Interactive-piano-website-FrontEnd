const compactNumber = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

export const formatCount = (value) => compactNumber.format(value ?? 0);

// 820 B, 48 KB, 1.2 MB
export const formatFileSize = (bytes) => {
  const size = Math.max(0, bytes ?? 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`;
};

export const formatDuration = (totalSeconds) => {
  const seconds = Math.max(0, Math.round(totalSeconds ?? 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${String(m).padStart(2, '0')}:${s}`;
};
