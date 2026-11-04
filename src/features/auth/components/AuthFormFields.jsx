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
        className="absolute right-3 top-1/2 flex -translate-y-1/2 cursor-pointer border-0 bg-transparent p-1 text-[var(--color-ink)]"
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
