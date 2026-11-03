import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateUsername = (val) => /^[a-z0-9]+$/.test(val);
  const validatePassword = (val) => /^(?=.*[A-Z])(?=.*\d).{8,}$/.test(val);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateUsername(username)) {
      setError("Username chỉ được chứa chữ thường và số, không có khoảng trắng hay ký tự đặc biệt.");
      return;
    }
    if (!validatePassword(password)) {
      setError("Mật khẩu tối thiểu 8 ký tự, ít nhất 1 chữ hoa và 1 chữ số.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({ username, email, password });
      navigate("/login");
    } catch (err) {
      setError(err?.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && <p role="alert">{error}</p>}

      <div>
        <label htmlFor="register-username">Username</label>
        <input
          id="register-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          autoComplete="username"
          placeholder="chỉ chữ thường và số"
        />
      </div>

      <div>
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="email@example.com"
        />
      </div>

      <div>
        <label htmlFor="register-password">Mật khẩu</label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          placeholder="Tối thiểu 8 ký tự, 1 chữ hoa, 1 chữ số"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Đang đăng ký..." : "Đăng ký"}
      </button>

      <p>
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </form>
  );
};

export default RegisterForm;
