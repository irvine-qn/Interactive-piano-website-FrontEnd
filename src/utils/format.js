const compactNumber = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

// 950 -> "950", 45200 -> "45.2K", 1250000 -> "1.3M"
export const formatCount = (value) => compactNumber.format(value ?? 0);

// 225 -> "03:45", 3725 -> "1:02:05"
export const formatDuration = (totalSeconds) => {
  const seconds = Math.max(0, Math.round(totalSeconds ?? 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${String(m).padStart(2, '0')}:${s}`;
};
