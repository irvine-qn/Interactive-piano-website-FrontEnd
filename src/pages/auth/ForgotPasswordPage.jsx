import Footer from "../../components/common/footer";
import AuthLayout from "../../features/auth/components/AuthLayout";
import ForgotPasswordForm from "../../features/auth/components/ForgotPasswordForm";

const ForgotPasswordPage = () => (
  <div className="flex flex-1 flex-col">
    <AuthLayout
      title="Đừng lo lắng!"
      subtitle="Chúng mình sẽ giúp bạn lấy lại mật khẩu."
    >
      <ForgotPasswordForm />
    </AuthLayout>
    <Footer />
  </div>
);

export default ForgotPasswordPage;
