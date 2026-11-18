import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { forgotPassword } from "../api/authApi";
import { ROUTES } from "../../../config/routes";
import { EMAIL_REGEX } from "../../../config/auth";
import { FieldLabel, FormError, inputClass } from "./AuthFormFields";

const linkClass = "font-bold text-[var(--color-brand-deep)] no-underline";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Could not send the email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col gap-5">
        <h2 className="m-0 text-[24px] font-extrabold sm:text-[30px] text-[var(--color-ink)]">Check your inbox</h2>
        <p
          role="status"
          className="m-0 border-2 border-[var(--color-success-border)] bg-[var(--color-success-banner)] px-4 py-3 text-sm font-semibold text-[var(--color-success-deep)]"
        >
          We've sent you a password reset email. Please check your inbox.
        </p>
        <Link to={ROUTES.LOGIN} className={`text-center text-sm ${linkClass}`}>
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="m-0 text-[24px] font-extrabold sm:text-[30px] text-[var(--color-ink)]">Forgot password</h2>
        <p className="mt-2 text-sm font-medium text-[var(--color-neutral-600)]">
          Enter your account email to receive a password reset link.
        </p>
      </div>

      <FormError message={error} />

      <div>
        <FieldLabel htmlFor="forgot-email">Email</FieldLabel>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="email@example.com"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 cursor-pointer items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-brand)] font-[inherit] text-sm font-bold text-[var(--color-ink)] disabled:cursor-not-allowed disabled:bg-[var(--color-brand-light)]"
      >
        <Mail aria-hidden="true" className="h-4 w-4" />
        {loading ? "Sending..." : "Send reset link"}
      </button>

      <p className="m-0 text-center text-sm">
        <Link to={ROUTES.LOGIN} className={linkClass}>
          Back to log in
        </Link>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
