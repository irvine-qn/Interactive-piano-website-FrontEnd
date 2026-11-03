import Footer from "../../components/common/footer";
import AuthLayout from "../../features/auth/components/AuthLayout";
import ForgotPasswordForm from "../../features/auth/components/ForgotPasswordForm";

const ForgotPasswordPage = () => (
  <div className="flex flex-1 flex-col">
    <AuthLayout
      title="Don't worry!"
      subtitle="We'll help you get back into your account."
    >
      <ForgotPasswordForm />
    </AuthLayout>
    <Footer />
  </div>
);

export default ForgotPasswordPage;
