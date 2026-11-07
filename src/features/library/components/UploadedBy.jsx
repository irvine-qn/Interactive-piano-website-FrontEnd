import { CircleUserRound } from 'lucide-react';

// Dòng "Uploaded by …" của bài người dùng upload (card ở Library, Preview ở /upload)
const UploadedBy = ({ text }) => (
  <p title={text} className="m-0 mt-1.5 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-[var(--color-neutral-600)]">
    <CircleUserRound aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
    <span className="truncate">{text}</span>
  </p>
);

export default UploadedBy;
