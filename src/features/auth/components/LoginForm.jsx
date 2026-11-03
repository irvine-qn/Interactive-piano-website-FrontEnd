import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { loginUser } from "../api/authApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { ROUTES } from "../../../config/routes";
import {
  FieldLabel,
  FormError,
  PasswordInput,
  inputClass,
} from "./AuthFormFields";

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim() || !password) {
      setError("Please enter your username/email and password.");
      return;
    }

    setLoading(true);
    try {
      setAuth(await loginUser({ identifier: identifier.trim(), password }));
      navigate(location.state?.from || ROUTES.HOME, { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="m-0 text-[30px] font-extrabold text-[var(--color-ink)]">
          Log in
        </h2>
        <p className="mt-2 text-sm font-medium text-[var(--color-neutral-600)]">
          Log in to save your progress and sheet collections.
        </p>
      </div>

      <FormError message={error} />

      <div>
        <FieldLabel htmlFor="login-identifier">
          Email or username
        </FieldLabel>
        <input
          id="login-identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
          placeholder="username or email@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <FieldLabel htmlFor="login-password">Password</FieldLabel>
        <PasswordInput
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="Enter your password"
        />
        <div className="mt-3 flex justify-end">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-sm font-bold text-[var(--color-brand-strong)] no-underline"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 cursor-pointer items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-brand)] font-[inherit] text-sm font-bold text-[var(--color-neutral-white)] disabled:cursor-not-allowed disabled:bg-[var(--color-brand-light)]"
      >
        <LogIn aria-hidden="true" className="h-4 w-4" />
        {loading ? "Logging in..." : "Log in"}
      </button>

      <div className="flex items-center gap-3 text-xs font-medium text-[var(--color-neutral-400)]">
        <span className="flex-1 border-t border-dashed border-[var(--color-line-dashed)]" />
        or
        <span className="flex-1 border-t border-dashed border-[var(--color-line-dashed)]" />
      </div>

      <button
        type="button"
        disabled
        title="Coming soon"
        className="h-12 cursor-not-allowed border-2 border-[var(--color-line-disabled)] bg-[var(--color-surface-disabled)] font-[inherit] text-sm font-bold text-[var(--color-neutral-400)]"
      >
        Continue with Google (coming soon)
      </button>

      <p className="m-0 text-center text-sm font-medium text-[var(--color-neutral-600)]">
        Don't have an account?{" "}
        <Link
          to={ROUTES.REGISTER}
          state={location.state}
          className="ml-2 font-bold text-[var(--color-brand-strong)] no-underline"
        >
          Sign up now
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
