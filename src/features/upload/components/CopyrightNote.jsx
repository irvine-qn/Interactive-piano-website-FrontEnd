import { ShieldCheck } from 'lucide-react';

// Khung "Lưu ý bản quyền" ở cuối cột phải (thiết kế User_Upload_Sheet_Cartoon)
const CopyrightNote = () => (
  <aside
    aria-label="Copyright note"
    className="flex gap-3 border-2 border-solid border-[var(--color-info-blue)] bg-[var(--color-info-blue-tint)] px-5 py-4 shadow-[var(--shadow-hard)]"
  >
    <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-info-blue)]" />
    <div>
      <p className="m-0 text-sm font-bold text-[var(--color-ink)]">Copyright note</p>
      <p className="m-0 mt-1 text-sm leading-relaxed text-[var(--color-neutral-600)]">
        By publishing, you confirm that you have the right to share this arrangement on Fiano.
      </p>
    </div>
  </aside>
);

export default CopyrightNote;
