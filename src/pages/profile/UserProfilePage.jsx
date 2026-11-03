import { Navigate } from "react-router-dom";
import Footer from "../../components/common/footer";
import { useAuthStore } from "../../store/useAuthStore";

const UserProfilePage = () => {
  const user = useAuthStore((state) => state.user);

  if (!user)
    return <Navigate to="/login" replace state={{ from: "/profile" }} />;

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-4 py-14">
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
