import { useState } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../../components/common/footer";
import PracticeHistory from "../../features/profile/components/PracticeHistory";
import ProfileHeader from "../../features/profile/components/ProfileHeader";
import ProfileMusicInfo from "../../features/profile/components/ProfileMusicInfo";
import ProfileSheetList from "../../features/profile/components/ProfileSheetList";
import ProfileStats from "../../features/profile/components/ProfileStats";
import ProfileTabs from "../../features/profile/components/ProfileTabs";
import SavedSheets from "../../features/profile/components/SavedSheets";
import { useProfile } from "../../features/profile/hooks/useProfile";

const UserProfilePage = () => {
  const location = useLocation();
  const user = useProfile();
  const [activeTab, setActiveTab] = useState("uploadedSheets");
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState();

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
          <ProfileMusicInfo user={user} />
          <div className="mt-6">
            <ProfileTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              search={search}
              onSearchChange={setSearch}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
            />
            {activeTab === "uploadedSheets" && <ProfileSheetList />}
            {activeTab === "practiceHistory" && <PracticeHistory />}
            {activeTab === "savedCollections" && (
              <SavedSheets
                key={`${search}|${difficulty}`}
                q={search}
                difficulty={difficulty}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfilePage;
