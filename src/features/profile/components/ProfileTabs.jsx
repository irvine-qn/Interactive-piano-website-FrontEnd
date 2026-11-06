const TAB_ITEMS = [
  { key: "uploadedSheets", label: "Uploaded sheets" },
  { key: "savedCollections", label: "Saved collections" },
  { key: "practiceHistory", label: "Practice history" },
];

const ProfileTabs = ({ counts = {} }) => (
  <section aria-label="Profile content">
    <nav aria-label="Profile tabs">
      {TAB_ITEMS.map((tab) => (
        <button key={tab.key} type="button">
          {tab.label}
          {counts[tab.key] !== undefined && <span>{counts[tab.key]}</span>}
        </button>
      ))}
    </nav>
    <div>
      <input type="search" placeholder="Search sheets..." aria-label="Search sheets" />
      <button type="button" aria-label="Filter sheets" />
    </div>
  </section>
);

export default ProfileTabs;
