import { Bell, FileX, Piano, Shield, UserRound, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../../components/common/footer";
import { ROUTES } from "../../config/routes";
import EditProfileForm from "../../features/profile/components/EditProfileForm";

const MENU_ITEM_CLASS =
  "flex h-11 w-full items-center gap-3 border-2 px-3 font-[inherit] text-sm font-bold";

const DISABLED_MENU_ITEMS = [
  { label: "Account & security", Icon: Shield },
  { label: "Notifications", Icon: Bell },
  { label: "Piano settings", Icon: Piano },
  { label: "Privacy", Icon: Lock },
];

const EditProfilePage = () => (
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
          <p
            aria-current="page"
            className={`${MENU_ITEM_CLASS} m-0 border-[var(--color-ink)] bg-[var(--color-brand)] text-[var(--color-neutral-white)]`}
          >
            <UserRound size={18} aria-hidden="true" />
            Personal information
          </p>
          {DISABLED_MENU_ITEMS.map(({ label, Icon }) => (
            <button
              key={label}
              type="button"
              disabled
              className={`${MENU_ITEM_CLASS} cursor-not-allowed border-transparent bg-transparent text-[var(--color-neutral-400)]`}
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </button>
          ))}
          <div className="border-0 border-t-2 border-dashed border-[var(--color-line-dashed)] pt-2">
            <button
              type="button"
              disabled
              className={`${MENU_ITEM_CLASS} cursor-not-allowed border-transparent bg-transparent text-[var(--color-danger)] opacity-60`}
            >
              <FileX size={18} aria-hidden="true" />
              Delete account
            </button>
          </div>
        </aside>
        <div className="min-w-0 lg:col-span-3">
          <EditProfileForm />
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default EditProfilePage;
