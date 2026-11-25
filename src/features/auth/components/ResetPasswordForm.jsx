import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckSquare, Clock, LogIn, RotateCw } from "lucide-react";
import { resetPassword } from "../api/authApi";
import { ROUTES } from "../../../config/routes";
import { DIGIT_REGEX, PASSWORD_MIN_LENGTH, UPPERCASE_REGEX } from "../../../config/auth";
import { AuthStatus, FieldLabel, FormError, PasswordInput, primaryButtonClass } from "./AuthFormFields";

const linkClass = "inline-flex items-center justify-center gap-1.5 text-sm font-bold text-[var(--color-brand-deep)] no-underline";

const isStrongPassword = (value) =>
  value.length >= PASSWORD_MIN_LENGTH && UPPERCASE_REGEX.test(value) && DIGIT_REGEX.test(value);

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState(token ? "form" : "expired");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!isStrongPassword(password)) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters with 1 uppercase letter and 1 digit.`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, password });
      setStatus("done");
    } catch (err) {
      if (err?.code === "INVALID_TOKEN") setStatus("expired");
      else setError(err?.message || "Could not update your password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "done") {
    return (
      <AuthStatus Icon={CheckSquare} tone="success" title="Password changed!">
        <p className="m-0 text-sm text-[var(--color-neutral-600)]">You can now log in with your new password.</p>
        <Link to={ROUTES.LOGIN} className={`${primaryButtonClass} mt-2 w-full`}>
          <LogIn size={16} aria-hidden="true" />
          Log in now
        </Link>
      </AuthStatus>
    );
  }

  if (status === "expired") {
    return (
      <AuthStatus Icon={Clock} title="This link has expired">
        <p className="m-0 text-sm text-[var(--color-neutral-600)]">
          Reset links work only once and expire after a short time. Ask for a new one below.
        </p>
        <Link to={ROUTES.FORGOT_PASSWORD} className={`${primaryButtonClass} mt-2 w-full`}>
          <RotateCw size={16} aria-hidden="true" />
          Send a new link
        </Link>
        <Link to={ROUTES.LOGIN} className={linkClass}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to log in
        </Link>
      </AuthStatus>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="m-0 text-[24px] font-extrabold text-[var(--color-ink)] sm:text-[30px]">Set a new password</h2>
        <p className="mt-2 text-sm font-medium text-[var(--color-neutral-600)]">
          At least {PASSWORD_MIN_LENGTH} characters, with 1 uppercase letter and 1 digit.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="reset-password">New password</FieldLabel>
        <PasswordInput
          id="reset-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="Enter a new password"
        />
      </div>

      <div className="flex flex-col gap-2">
        <FieldLabel htmlFor="reset-confirm">Confirm password</FieldLabel>
        <PasswordInput
          id="reset-confirm"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          autoComplete="new-password"
          placeholder="Re-enter the new password"
        />
      </div>

      <FormError message={error} />

      <button type="submit" disabled={loading} className={primaryButtonClass}>
        <CheckSquare size={16} aria-hidden="true" />
        {loading ? "Saving..." : "Save new password"}
      </button>

      <Link to={ROUTES.LOGIN} className={linkClass}>
        <ArrowLeft size={16} aria-hidden="true" />
        Back to log in
      </Link>
    </form>
  );
};

export default ResetPasswordForm;
