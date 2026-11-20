import { Upload } from "lucide-react";

const STAT_ITEMS = [
  { key: "uploadedSheets", label: "Sheets uploaded", Icon: Upload },
];

const ProfileStats = ({ stats = {} }) => (
  <section
    aria-label="Profile statistics"
    className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
  >
    {STAT_ITEMS.map(({ key, label, Icon }) => (
      <article
        key={key}
        className="flex items-center gap-4 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-4"
      >
        <span className="flex size-12 shrink-0 items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-brand-tint)] text-[var(--color-brand-deep)]">
          <Icon size={24} aria-hidden="true" />
        </span>
        <div>
          <p className="m-0 text-3xl font-extrabold text-[var(--color-ink)]">
            {stats[key] ?? 0}
          </p>
          <p className="m-0 mt-1 text-xs font-bold uppercase text-[var(--color-neutral-600)]">
            {label}
          </p>
        </div>
      </article>
    ))}
  </section>
);

export default ProfileStats;
