import { NavLink, useLocation, useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/virtual-piano-assets/default-avatar.jpeg";
import fianoLogo from "../../assets/virtual-piano-assets/fiano-logo.png";
import foxMascot from "../../assets/virtual-piano-assets/fox-mascot.png";
import { LogOut, Search, User } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { ROUTES } from "../../config/routes";

const NAV_ITEMS = [
  { to: ROUTES.HOME, label: "Piano" },
  { to: ROUTES.LIBRARY, label: "Library" },
  { to: ROUTES.WORKSPACE, label: "Practice_sample" },
  { to: ROUTES.UPLOAD, label: "Upload", authOnly: true },
  { to: ROUTES.LOGIN, label: "Login", guestOnly: true },
  { to: ROUTES.REGISTER, label: "Register", guestOnly: true },
];

const AUTH_PATHS = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navItems = NAV_ITEMS.filter((item) =>
    user ? !item.guestOnly : !item.authOnly,
  );
  const from = AUTH_PATHS.includes(location.pathname)
    ? location.state?.from
    : `${location.pathname}${location.search}`;

  const handleLogout = () => {
    clearAuth();
    navigate(ROUTES.HOME, { replace: true });
  };

  return (
    <header className="relative z-20 border-b-4 border-[var(--color-ink)] bg-[linear-gradient(to_bottom,var(--color-sky-1)_0_16px,var(--color-sky-2)_16px_32px,var(--color-sky-3)_32px_48px,var(--color-sky-4)_48px_64px,var(--color-sky-5)_64px_80px,var(--color-sky-6)_80px)]">
      <div className="relative mx-auto flex h-[92px] w-full max-w-[1600px] items-center gap-6 px-4">
        <NavLink
          to={ROUTES.HOME}
          aria-label="Fiano home"
          className="flex shrink-0 items-center"
        >
          <img
            src={foxMascot}
            alt=""
            className="absolute left-[21px] top-[43px] h-[88px] w-[94px] -rotate-2"
          />
          <img
            src={fianoLogo}
            alt="Fiano"
            className="ml-[120px] h-[46px] w-[95px]"
          />
        </NavLink>
        <label className="ml-10 hidden h-10 w-[380px] shrink items-center border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 shadow-[var(--shadow-hard-sm)] md:flex">
          <input
            type="search"
            placeholder="Find some music?"
            className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 font-[inherit] text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-neutral-350)]"
          />
          <Search
            aria-hidden="true"
            className="h-[26px] w-7 text-[var(--color-brand)]"
          />
        </label>
        <nav
          aria-label="Main navigation"
          className="ml-12 flex items-center gap-[14px]"
        >
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              state={item.to === ROUTES.LOGIN ? { from } : undefined}
              end
              className={({ isActive }) =>
                `flex h-9 items-center border-2 border-[var(--color-ink)] px-[18px] text-[15px] font-bold no-underline shadow-[var(--shadow-hard-sm)] ${
                  isActive
                    ? "bg-[var(--color-brand)] text-[var(--color-neutral-white)]"
                    : "bg-[var(--color-surface-card)] text-[var(--color-ink)]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="group relative ml-auto shrink-0">
            <button
              type="button"
              aria-haspopup="menu"
              className="avatar flex cursor-pointer border-0 bg-transparent p-0"
            >
              <img
                src={defaultAvatar}
                alt="User avatar"
                className="avatar h-10 w-10 border-[2.5px] border-[var(--color-ink)] object-cover"
              />
            </button>
            <div className="invisible absolute right-0 top-full pt-3 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div
                role="menu"
                className="flex w-48 flex-col border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] shadow-[var(--shadow-hard)]"
              >
                <p className="m-0 truncate border-b-2 border-[var(--color-line-dashed)] px-4 py-3 text-sm font-bold text-[var(--color-ink)]">
                  {user.displayName}
                </p>
                <NavLink
                  to={ROUTES.PROFILE}
                  role="menuitem"
                  className="flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[var(--color-ink)] no-underline hover:bg-[var(--color-brand-tint)]"
                >
                  <User aria-hidden="true" className="h-4 w-4" />
                  Profile
                </NavLink>
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2 border-0 bg-transparent px-4 py-3 text-left font-[inherit] text-sm font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-wash)]"
                >
                  <LogOut aria-hidden="true" className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
