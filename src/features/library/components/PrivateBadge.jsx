import { Lock } from 'lucide-react';

// Nhãn bài PRIVATE (chỉ người upload thấy). Dùng ở bìa bài và thông tin bài ở Workspace.
const PrivateBadge = ({ className = 'text-xs' }) => (
  <span
    title="Only you can see this sheet"
    className={`flex items-center gap-1 border-[1.5px] border-[var(--color-ink)] bg-[var(--color-ink)] px-2 py-0.5 font-bold text-[var(--color-neutral-white)] ${className}`}
  >
    <Lock aria-hidden="true" className="h-3 w-3" />
    Private
  </span>
);

export default PrivateBadge;
