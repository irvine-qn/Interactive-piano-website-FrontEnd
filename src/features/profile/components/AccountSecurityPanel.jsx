import { CheckSquare, History, ShieldCheck, Smartphone } from "lucide-react";

const TEXT_BUTTON_CLASS =
  "flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 font-[inherit] text-sm font-semibold text-[var(--color-neutral-600)] hover:text-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]";

const AccountSecurityPanel = ({ user, securityScore, deviceCount }) => (
  <aside
    aria-label="Account security"
    className="flex flex-col gap-4 self-start border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-5"
  >
    <header className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="m-0 text-xl font-bold text-[var(--color-ink)]">
        Account security
      </h2>
      {securityScore !== undefined && (
        <p className="m-0 flex items-center gap-1 border border-[var(--color-success)] bg-[var(--color-success-tint)] px-2 py-0.5 text-xs font-bold text-[var(--color-success)]">
          <ShieldCheck size={14} aria-hidden="true" />
          {securityScore}%
        </p>
      )}
    </header>

    <div className="flex items-center gap-3 border-2 border-[var(--color-ink)] bg-[var(--color-success-wash)] p-4">
      <CheckSquare
        size={20}
        aria-hidden="true"
        className="shrink-0 text-[var(--color-success)]"
      />
      <div className="min-w-0 flex-1">
        <h3 className="m-0 text-sm font-bold text-[var(--color-ink)]">
          Primary email
        </h3>
        <p className="m-0 mt-1 truncate text-xs text-[var(--color-neutral-600)]">
          {user.email}
        </p>
      </div>
      <p
        className={`m-0 shrink-0 text-xs font-bold ${
          user.isVerified
            ? "text-[var(--color-success)]"
            : "text-[var(--color-warning)]"
        }`}
      >
        {user.isVerified ? "Verified" : "Not verified"}
      </p>
    </div>

    <div className="flex items-center gap-3 border-2 border-[var(--color-ink)] bg-[var(--color-warning-wash)] p-4">
      <Smartphone
        size={20}
        aria-hidden="true"
        className="shrink-0 text-[var(--color-brand-deep)]"
      />
      <div className="min-w-0 flex-1">
        <h3 className="m-0 text-sm font-bold text-[var(--color-ink)]">
          Two-factor authentication (2FA)
        </h3>
        <p className="m-0 mt-1 text-xs text-[var(--color-neutral-600)]">
          Protect your account with SMS or an app
        </p>
      </div>
      <button
        type="button"
        className="shrink-0 cursor-pointer border-0 bg-transparent p-0 font-[inherit] text-xs font-bold text-[var(--color-brand-deep)] hover:text-[var(--color-brand-deep)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
      >
        Enable now
      </button>
    </div>

    <footer className="flex flex-wrap items-center justify-between gap-2 border-0 border-t-2 border-dashed border-[var(--color-line-dashed)] pt-4">
      <button type="button" className={TEXT_BUTTON_CLASS}>
        <History size={16} aria-hidden="true" />
        Change password
      </button>
      <button type="button" className={TEXT_BUTTON_CLASS}>
        Device log{deviceCount !== undefined && ` (${deviceCount})`}
      </button>
    </footer>
  </aside>
);

export default AccountSecurityPanel;
