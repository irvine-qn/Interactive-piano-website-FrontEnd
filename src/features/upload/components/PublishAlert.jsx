import { AlertCircle } from 'lucide-react';

// Lỗi khi gửi bài, hiện trong thẻ liên quan (hoặc dưới nút Publish). message của BE hiện thẳng.
const PublishAlert = ({ error, hint }) =>
  error ? (
    <p
      role="alert"
      className="m-0 flex items-start gap-2 border-2 border-solid border-[var(--color-danger)] bg-[var(--color-danger-wash)] px-4 py-3 text-sm font-semibold text-[var(--color-danger-strong)]"
    >
      <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>
        Could not publish: {error.message}
        {hint && ` ${hint}`}
      </span>
    </p>
  ) : null;

export default PublishAlert;
