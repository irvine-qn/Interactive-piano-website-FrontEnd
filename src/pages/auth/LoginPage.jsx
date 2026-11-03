import Footer from "../../components/common/footer";
import AuthLayout from "../../features/auth/components/AuthLayout";
import LoginForm from "../../features/auth/components/LoginForm";

const LoginPage = () => (
  <div className="flex flex-1 flex-col">
    <AuthLayout title="Chào mừng trở lại!" subtitle="Tiếp tục hành trình luyện piano của bạn.">
      <LoginForm />
    </AuthLayout>
    <Footer />
  </div>
);

export default LoginPage;
