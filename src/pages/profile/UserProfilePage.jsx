import { useLocation } from "react-router-dom";
import Footer from "../../components/common/footer";
import { useAuthStore } from "../../store/useAuthStore";

const UserProfilePage = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-14">
        {location.state?.welcome && (
          <p
            role="status"
            className="mb-6 mt-0 border-2 border-[var(--color-success-border)] bg-[var(--color-success-banner)] px-4 py-3 text-sm font-semibold text-[var(--color-success-deep)]"
          >
            Chào mừng {user.displayName} đến với Fiano! Tài khoản của bạn đã được tạo.
          </p>
        )}
        <section className="border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-10 py-8 shadow-[var(--shadow-hard)]">
          <h1 className="m-0 text-[30px] font-extrabold text-[var(--color-ink)]">
            {user.displayName}
          </h1>
          <p className="mt-2 text-sm font-medium text-[var(--color-neutral-600)]">
            @{user.username}
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
