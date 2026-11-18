import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SquareCheck, UserPlus } from "lucide-react";
import { registerUser } from "../api/authApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { ROUTES } from "../../../config/routes";
import {
  DIGIT_REGEX,
  EMAIL_REGEX,
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  SPECIAL_CHAR_REGEX,
  UPPERCASE_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX,
} from "../../../config/auth";
import { FieldLabel, FormError, PasswordInput, inputClass } from "./AuthFormFields";

const STRENGTH_LEVELS = [
  { label: "Weak", textClass: "text-[var(--color-danger)]" },
  { label: "Weak", textClass: "text-[var(--color-danger)]" },
  { label: "Fair", textClass: "text-[var(--color-warning)]" },
  { label: "Good", textClass: "text-[var(--color-success)]" },
  { label: "Strong", textClass: "text-[var(--color-success)]" },
];

const STRENGTH_BAR_COLORS = [
  "bg-[var(--color-danger)]",
  "bg-[var(--color-sun-ray)]",
  "bg-[var(--color-success-bright)]",
  "bg-[var(--color-success)]",
];

const validateUsername = (val) =>
  val.length <= USERNAME_MAX_LENGTH && USERNAME_REGEX.test(val);

const hasMinLength = (val) => val.length >= PASSWORD_MIN_LENGTH;
const hasUppercase = (val) => UPPERCASE_REGEX.test(val);
const hasDigit = (val) => DIGIT_REGEX.test(val);
const hasSpecialChar = (val) => SPECIAL_CHAR_REGEX.test(val);

const validatePassword = (val) =>
  hasMinLength(val) && hasUppercase(val) && hasDigit(val);

const getPasswordScore = (val) =>
  [hasMinLength(val), hasUppercase(val), hasDigit(val), hasSpecialChar(val)].filter(Boolean).length;

const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordScore = getPasswordScore(password);
  const strength = STRENGTH_LEVELS[passwordScore];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!displayName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!validateUsername(username)) {
      setError(
        "Username can only contain lowercase letters and numbers, with no spaces or special characters.",
      );
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Password must be at least 8 characters with 1 uppercase letter and 1 number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      setAuth(
        await registerUser({
          displayName: displayName.trim(),
          username,
          email: email.trim(),
          password,
        }),
      );
      navigate(ROUTES.PROFILE, { replace: true, state: { welcome: true } });
    } catch (err) {
      setError(err?.message || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="m-0 text-[24px] font-extrabold sm:text-[30px] text-[var(--color-ink)]">
          Create account
        </h2>
        <p className="mt-2 text-sm font-medium text-[var(--color-neutral-600)]">
          It only takes a minute to start practicing.
        </p>
      </div>

      <FormError message={error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="register-display-name">Full name</FieldLabel>
          <input
            id="register-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            placeholder="John Smith"
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel htmlFor="register-username">Username</FieldLabel>
          <div className="relative">
            <input
              id="register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              maxLength={USERNAME_MAX_LENGTH}
              placeholder="lowercase letters and numbers only"
              className={`${inputClass} pr-12`}
            />
            {validateUsername(username) && (
              <SquareCheck
                aria-hidden="true"
                className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-success)]"
              />
            )}
          </div>
        </div>
      </div>

      <div>
        <FieldLabel htmlFor="register-email">Email</FieldLabel>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="email@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <FieldLabel htmlFor="register-password">Password</FieldLabel>
        <PasswordInput
          id="register-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="At least 8 characters, 1 uppercase, 1 number"
        />
        {password && (
          <>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {STRENGTH_BAR_COLORS.map((color, i) => (
                <span
                  key={color}
                  className={`h-[0.375rem] border border-[var(--color-ink)] ${
                    i < passwordScore ? color : "bg-[var(--color-line-handle)]"
                  }`}
                />
              ))}
            </div>
            <p
              className={`mb-0 mt-2 text-xs font-medium ${strength.textClass}`}
            >
              Strength: {strength.label}
              {passwordScore === 3 &&
                !hasSpecialChar(password) &&
                " - add a special character to make it stronger"}
            </p>
          </>
        )}
      </div>

      <div>
        <FieldLabel htmlFor="register-confirm-password">
          Confirm password
        </FieldLabel>
        <PasswordInput
          id="register-confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Re-enter your password"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 cursor-pointer items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-brand)] font-[inherit] text-sm font-bold text-[var(--color-ink)] disabled:cursor-not-allowed disabled:bg-[var(--color-brand-light)]"
      >
        <UserPlus aria-hidden="true" className="h-4 w-4" />
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="m-0 text-center text-sm font-medium text-[var(--color-neutral-600)]">
        Already have an account?{" "}
        <Link
          to={ROUTES.LOGIN}
          state={location.state}
          className="ml-2 font-bold text-[var(--color-brand-deep)] no-underline"
        >
          Log in
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
