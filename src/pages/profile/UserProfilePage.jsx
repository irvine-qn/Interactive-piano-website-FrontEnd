import { useLocation } from "react-router-dom";
import Footer from "../../components/common/footer";
import ProfileHeader from "../../features/profile/components/ProfileHeader";
import ProfileSheetList from "../../features/profile/components/ProfileSheetList";
import ProfileStats from "../../features/profile/components/ProfileStats";
import ProfileTabs from "../../features/profile/components/ProfileTabs";
import { useAuthStore } from "../../store/useAuthStore";

const UserProfilePage = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex flex-1 flex-col">
      <main className="w-full flex-1 pb-14">
        <ProfileHeader user={user} />
        <div className="mx-auto w-full max-w-7xl px-4 pt-6">
          {location.state?.welcome && (
            <p
              role="status"
              className="mb-6 mt-0 border-2 border-[var(--color-success-border)] bg-[var(--color-success-banner)] px-4 py-3 text-sm font-semibold text-[var(--color-success-deep)]"
            >
              Welcome to Fiano, {user.displayName}! Your account has been
              created.
            </p>
          )}
          <ProfileStats />
          <div className="mt-6">
            <ProfileTabs />
            <ProfileSheetList />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
