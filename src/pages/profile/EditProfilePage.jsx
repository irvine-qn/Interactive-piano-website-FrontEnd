import { Bell, Clock, FileX, Lock, Piano, Shield, UserRound } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/common/footer";
import { ROUTES } from "../../config/routes";
import EditProfileForm from "../../features/profile/components/EditProfileForm";

const PERSONAL_SECTION = "personal";

const COMING_SOON_SECTIONS = [
  { key: "security", label: "Account & security", Icon: Shield },
  { key: "notifications", label: "Notifications", Icon: Bell },
  { key: "piano", label: "Piano settings", Icon: Piano },
  { key: "privacy", label: "Privacy", Icon: Lock },
];

const DELETE_SECTION = { key: "delete", label: "Delete account", Icon: FileX, isDanger: true };

const MenuItem = ({ label, Icon, isActive, isDanger, onClick }) => {
  const inactiveClass = isDanger
    ? "text-[var(--color-danger)] hover:bg-[var(--color-danger-wash)]"
    : "text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]";

  return (
    <button
      type="button"
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
      className={`flex h-11 w-full cursor-pointer items-center gap-3 border-2 px-3 font-[inherit] text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] ${
        isActive
          ? "border-[var(--color-ink)] bg-[var(--color-brand)] text-[var(--color-neutral-white)]"
          : `border-transparent bg-transparent ${inactiveClass}`
      }`}
    >
      <Icon size={18} aria-hidden="true" />
      {label}
    </button>
  );
};

const ComingSoonPanel = ({ title }) => (
  <section className="border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)]">
    <h2 className="m-0 border-0 border-b-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-5 py-3 text-base font-bold text-[var(--color-ink)]">
      {title}
    </h2>
    <div className="flex flex-col items-center gap-3 p-12 text-center">
      <span className="flex size-12 items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-brand-tint)] text-[var(--color-brand-strong)]">
        <Clock size={24} aria-hidden="true" />
      </span>
      <p className="m-0 text-xl font-extrabold text-[var(--color-ink)]">Coming soon</p>
    </div>
  </section>
);

const EditProfilePage = () => {
  const [activeSection, setActiveSection] = useState(PERSONAL_SECTION);
  const comingSoonSection = [...COMING_SOON_SECTIONS, DELETE_SECTION].find(
    ({ key }) => key === activeSection,
  );

  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-14 pt-6">
        <nav aria-label="Breadcrumb" className="text-sm font-semibold text-[var(--color-neutral-400)]">
          <Link to={ROUTES.PROFILE} className="text-inherit no-underline hover:text-[var(--color-ink)]">
            Profile
          </Link>
          {" / Edit profile"}
        </nav>
        <h1 className="m-0 mt-2 text-3xl font-extrabold text-[var(--color-ink)] sm:text-4xl">Edit profile</h1>
        <p className="m-0 mt-2 text-sm text-[var(--color-neutral-600)]">
          Update the information shown on your profile.
        </p>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-4">
          <aside className="flex flex-col gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-3">
            <MenuItem
              label="Personal information"
              Icon={UserRound}
              isActive={activeSection === PERSONAL_SECTION}
              onClick={() => setActiveSection(PERSONAL_SECTION)}
            />
            {COMING_SOON_SECTIONS.map(({ key, label, Icon }) => (
              <MenuItem
                key={key}
                label={label}
                Icon={Icon}
                isActive={activeSection === key}
                onClick={() => setActiveSection(key)}
              />
            ))}
            <div className="border-0 border-t-2 border-dashed border-[var(--color-line-dashed)] pt-2">
              <MenuItem
                label={DELETE_SECTION.label}
                Icon={DELETE_SECTION.Icon}
                isDanger
                isActive={activeSection === DELETE_SECTION.key}
                onClick={() => setActiveSection(DELETE_SECTION.key)}
              />
            </div>
          </aside>
          <div className="min-w-0 lg:col-span-3">
            {comingSoonSection && <ComingSoonPanel title={comingSoonSection.label} />}
            <div className={comingSoonSection ? "hidden" : undefined}>
              <EditProfileForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfilePage;
