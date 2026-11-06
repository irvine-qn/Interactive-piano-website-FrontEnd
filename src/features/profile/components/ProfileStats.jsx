const STAT_ITEMS = [
  { key: "uploadedSheets", label: "Sheets uploaded" },
];

const ProfileStats = ({ stats = {} }) => (
  <section aria-label="Profile statistics">
    {STAT_ITEMS.map((item) => (
      <article key={item.key}>
        <p>{stats[item.key] ?? "-"}</p>
        <p>{item.label}</p>
      </article>
    ))}
  </section>
);

export default ProfileStats;
