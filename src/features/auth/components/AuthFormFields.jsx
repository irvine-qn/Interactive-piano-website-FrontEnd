import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const inputClass =
  "h-12 w-full border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 font-[inherit] text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-neutral-300)] focus:border-[var(--color-brand)]";

export const FieldLabel = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="mb-2 block text-sm font-bold text-[var(--color-ink)]"
  >
    {children}
    <span className="ml-2 text-[var(--color-danger)]">*</span>
  </label>
);

export const PasswordInput = ({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
}) => {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 flex h-8 w-8 items-center justify-center -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0 text-[var(--color-ink)]"
      >
        <Icon aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
};

export const FormError = ({ message }) =>
  message ? (
    <p
      role="alert"
      className="m-0 border-2 border-[var(--color-danger)] bg-[var(--color-danger-wash)] px-4 py-3 text-sm font-semibold text-[var(--color-danger-strong)]"
    >
      {message}
    </p>
  ) : null;

export const primaryButtonClass =
  "flex h-12 cursor-pointer items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-brand)] font-[inherit] text-sm font-bold text-[var(--color-ink)] no-underline disabled:cursor-not-allowed disabled:bg-[var(--color-brand-light)]";

export const AuthStatus = ({ Icon, tone = "brand", title, children }) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <span
      className={`flex size-14 items-center justify-center border-2 border-[var(--color-ink)] shadow-[var(--shadow-hard-sm)] ${
        tone === "success"
          ? "bg-[var(--color-success-tint)] text-[var(--color-success-strong)]"
          : "bg-[var(--color-brand-tint)] text-[var(--color-brand-deep)]"
      }`}
    >
      <Icon aria-hidden="true" className="h-7 w-7" />
    </span>
    <h2 className="m-0 text-[24px] font-extrabold text-[var(--color-ink)] sm:text-[28px]">{title}</h2>
    {children}
  </div>
);
