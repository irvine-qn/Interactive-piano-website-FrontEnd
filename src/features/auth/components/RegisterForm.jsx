import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SquareCheck, UserPlus } from "lucide-react";
import { registerUser } from "../api/authApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { ROUTES } from "../../../config/routes";
import {
  DIGIT_REGEX,
  DISPLAY_NAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  SPECIAL_CHAR_REGEX,
  UPPERCASE_REGEX,
  USERNAME_MAX_LENGTH,
  USERNAME_REGEX,
} from "../../../config/auth";
import { FieldLabel, FormError, PasswordInput, inputClass } from "./AuthFormFields";

const STRENGTH_LEVELS = [
  { label: "Yếu", textClass: "text-[var(--color-danger)]" },
  { label: "Yếu", textClass: "text-[var(--color-danger)]" },
  { label: "Trung bình", textClass: "text-[var(--color-warning)]" },
  { label: "Khá tốt", textClass: "text-[var(--color-success)]" },
  { label: "Mạnh", textClass: "text-[var(--color-success)]" },
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
      setError("Vui lòng nhập họ và tên.");
      return;
    }
    if (!validateUsername(username)) {
      setError(
        "Username chỉ được chứa chữ thường và số, không có khoảng trắng hay ký tự đặc biệt.",
      );
      return;
    }
    if (!validatePassword(password)) {
      setError("Mật khẩu tối thiểu 8 ký tự, ít nhất 1 chữ hoa và 1 chữ số.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      setAuth(
        await registerUser({
          displayName: displayName.trim(),
          username,
          email,
          password,
        }),
      );
      navigate(ROUTES.PROFILE, { replace: true });
    } catch (err) {
      setError(err?.error?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="m-0 text-[30px] font-extrabold text-[var(--color-ink)]">
          Tạo tài khoản
        </h2>
        <p className="mt-2 text-sm font-medium text-[var(--color-neutral-600)]">
          Chỉ mất 1 phút để bắt đầu luyện tập.
        </p>
      </div>

      <FormError message={error} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <FieldLabel htmlFor="register-display-name">Họ và tên</FieldLabel>
          <input
            id="register-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            autoComplete="name"
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            placeholder="Nguyễn Văn A"
            className={inputClass}
          />
        </div>
        <div>
          <FieldLabel htmlFor="register-username">Tên người dùng</FieldLabel>
          <div className="relative">
            <input
              id="register-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              maxLength={USERNAME_MAX_LENGTH}
              placeholder="chỉ chữ thường và số"
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
        <FieldLabel htmlFor="register-password">Mật khẩu</FieldLabel>
        <PasswordInput
          id="register-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 chữ số"
        />
        {password && (
          <>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {STRENGTH_BAR_COLORS.map((color, i) => (
                <span
                  key={color}
                  className={`h-[6px] border border-[var(--color-ink)] ${
                    i < passwordScore ? color : "bg-[var(--color-line-handle)]"
                  }`}
                />
              ))}
            </div>
            <p
              className={`mb-0 mt-2 text-xs font-medium ${strength.textClass}`}
            >
              Độ mạnh: {strength.label}
              {passwordScore === 3 &&
                !hasSpecialChar(password) &&
                " - thêm ký tự đặc biệt để an toàn hơn"}
            </p>
          </>
        )}
      </div>

      <div>
        <FieldLabel htmlFor="register-confirm-password">
          Xác nhận mật khẩu
        </FieldLabel>
        <PasswordInput
          id="register-confirm-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 cursor-pointer items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-brand)] font-[inherit] text-sm font-bold text-[var(--color-neutral-white)] shadow-[var(--shadow-hard)] disabled:cursor-not-allowed disabled:bg-[var(--color-brand-light)]"
      >
        <UserPlus aria-hidden="true" className="h-4 w-4" />
        {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
      </button>

      <p className="m-0 text-center text-sm font-medium text-[var(--color-neutral-600)]">
        Đã có tài khoản?{" "}
        <Link
          to={ROUTES.LOGIN}
          className="ml-2 font-bold text-[var(--color-brand-strong)] no-underline"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
