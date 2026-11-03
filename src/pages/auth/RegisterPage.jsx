import Footer from "../../components/common/footer";
import AuthLayout from "../../features/auth/components/AuthLayout";
import RegisterForm from "../../features/auth/components/RegisterForm";

const RegisterPage = () => (
  <div className="flex flex-1 flex-col">
    <AuthLayout
      title="Bắt đầu cùng Fiano!"
      subtitle="Tạo tài khoản miễn phí, luyện đàn mỗi ngày."
    >
      <RegisterForm />
    </AuthLayout>
    <Footer />
  </div>
);

export default RegisterPage;
