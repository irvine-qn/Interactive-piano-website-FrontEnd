import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../api/authApi";
import { useAuthStore } from "../../../store/useAuthStore";

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
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err?.error?.message || "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p role="alert">{error}</p>}

      <div>
        <label htmlFor="login-identifier">Username hoặc Email</label>
        <input
          id="login-identifier"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
          placeholder="username hoặc email@example.com"
        />
      </div>

      <div>
        <label htmlFor="login-password">Mật khẩu</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="Nhập mật khẩu"
        />
      </div>

      <div>
        <Link to="/forgot-password">Quên mật khẩu?</Link>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>

      <div>
        <span>hoặc</span>
      </div>

      <button type="button">Đăng nhập với Google</button>
    </form>
  );
};

export default LoginForm;
