import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/authApi";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword({ email });
      setSuccess(true);
    } catch (err) {
      setError(err?.message || "Không thể gửi email. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <p>Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.</p>
        <Link to="/login">Quay lại đăng nhập</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <p>Nhập email tài khoản để nhận link đặt lại mật khẩu.</p>

      {error && <p role="alert">{error}</p>}

      <div>
        <label htmlFor="forgot-email">Email</label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="email@example.com"
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
      </button>

      <p>
        <Link to="/login">Quay lại đăng nhập</Link>
      </p>
    </form>
  );
};

export default ForgotPasswordForm;
