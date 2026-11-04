import Footer from "../../components/common/footer";
import AuthLayout from "../../features/auth/components/AuthLayout";
import RegisterForm from "../../features/auth/components/RegisterForm";

const RegisterPage = () => (
  <div className="flex flex-1 flex-col">
    <AuthLayout
      title="Get started with Fiano!"
      subtitle="Create a free account and practice every day."
    >
      <RegisterForm />
    </AuthLayout>
    <Footer />
  </div>
);

export default RegisterPage;
