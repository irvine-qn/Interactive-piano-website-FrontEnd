import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { loginUser } from "../api/authApi";
import { useAuthStore } from "../../../store/useAuthStore";
import { ROUTES } from "../../../config/routes";
import { FieldLabel, FormError, PasswordInput, inputClass } from "./AuthFormFields";

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
    setLoading(true);
    try {
      setAuth(await loginUser({ identifier, password }));
      navigate(location.state?.from || ROUTES.HOME, { replace: true });
    } catch (err) {
      setError(err?.error?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="m-0 text-[30px] font-extrabold text-[var(--color-ink)]">Đăng nhập</h2>
        <p className="mt-2 text-sm font-medium text-[var(--color-neutral-600)]">
          Đăng nhập để lưu tiến độ và bộ sưu tập sheet nhạc.
        </p>
      </div>

      <FormError message={error} />

      <div>
        <FieldLabel htmlFor="login-identifier">Email hoặc tên người dùng</FieldLabel>
        <input
          id="login-identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
          placeholder="username hoặc email@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <FieldLabel htmlFor="login-password">Mật khẩu</FieldLabel>
        <PasswordInput
          id="login-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
        />
        <div className="mt-3 flex justify-end">
          <Link
            to={ROUTES.FORGOT_PASSWORD}
            className="text-sm font-bold text-[var(--color-brand-strong)] no-underline"
          >
            Quên mật khẩu?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 cursor-pointer items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-brand)] font-[inherit] text-sm font-bold text-[var(--color-neutral-white)] shadow-[var(--shadow-hard)] disabled:cursor-not-allowed disabled:bg-[var(--color-brand-light)]"
      >
        <LogIn aria-hidden="true" className="h-4 w-4" />
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <div className="flex items-center gap-3 text-xs font-medium text-[var(--color-neutral-400)]">
        <span className="flex-1 border-t border-dashed border-[var(--color-line-dashed)]" />
        hoặc
        <span className="flex-1 border-t border-dashed border-[var(--color-line-dashed)]" />
      </div>

      <button
        type="button"
        className="h-12 cursor-pointer border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] font-[inherit] text-sm font-bold text-[var(--color-ink)] shadow-[var(--shadow-hard)]"
      >
        Đăng nhập với Google
      </button>

      <p className="m-0 text-center text-sm font-medium text-[var(--color-neutral-600)]">
        Chưa có tài khoản?{" "}
        <Link to={ROUTES.REGISTER} className="ml-2 font-bold text-[var(--color-brand-strong)] no-underline">
          Đăng ký ngay
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
