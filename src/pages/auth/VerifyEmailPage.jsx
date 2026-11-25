import Footer from "../../components/common/footer";
import AuthLayout from "../../features/auth/components/AuthLayout";
import VerifyEmailStatus from "../../features/auth/components/VerifyEmailStatus";

const VerifyEmailPage = () => (
  <div className="flex flex-1 flex-col">
    <AuthLayout title="One last step!" subtitle="Confirm your email to keep your account safe.">
      <VerifyEmailStatus />
    </AuthLayout>
    <Footer />
  </div>
);

export default VerifyEmailPage;
