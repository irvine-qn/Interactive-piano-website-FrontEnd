import Footer from "../../components/common/footer";
import AuthLayout from "../../features/auth/components/AuthLayout";
import ResetPasswordForm from "../../features/auth/components/ResetPasswordForm";

const ResetPasswordPage = () => (
  <div className="flex flex-1 flex-col">
    <AuthLayout title="Almost there!" subtitle="Choose a new password for your account.">
      <ResetPasswordForm />
    </AuthLayout>
    <Footer />
  </div>
);

export default ResetPasswordPage;
