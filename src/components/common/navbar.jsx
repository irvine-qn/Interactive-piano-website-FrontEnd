import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import defaultAvatar from "../../assets/virtual-piano-assets/default-avatar.jpeg";
import fianoLogo from "../../assets/virtual-piano-assets/fiano-logo.png";
import foxMascot from "../../assets/virtual-piano-assets/fox-mascot.png";
import { LogOut, Menu, Search, User, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { ROUTES } from "../../config/routes";

const NAV_ITEMS = [
  { to: ROUTES.HOME, label: "Piano" },
  { to: ROUTES.LIBRARY, label: "Sheet library" },
  { to: ROUTES.UPLOAD, label: "Upload", authOnly: true },
  { to: ROUTES.LOGIN, label: "Log in", guestOnly: true },
  { to: ROUTES.REGISTER, label: "Sign up", guestOnly: true },
];

const AUTH_PATHS = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD];

const navLinkClass = ({ isActive }) =>
  `flex h-9 items-center border-2 border-[var(--color-ink)] px-[18px] text-[15px] font-bold no-underline ${
    isActive
      ? "bg-[var(--color-brand)] text-[var(--color-neutral-white)]"
      : "bg-[var(--color-surface-card)] text-[var(--color-ink)]"
  }`;

const closeFocusedMenu = () => document.activeElement?.blur();

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = NAV_ITEMS.filter((item) =>
    user ? !item.guestOnly : !item.authOnly,
  );
  const from = AUTH_PATHS.includes(location.pathname)
    ? location.state?.from
    : `${location.pathname}${location.search}`;

  const handleLogout = () => {
    closeFocusedMenu();
    clearAuth();
    navigate(ROUTES.HOME, { replace: true });
  };

  const renderNavLinks = (onItemClick) =>
    navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        state={item.to === ROUTES.LOGIN || item.to === ROUTES.REGISTER ? { from } : undefined}
        end
        onClick={onItemClick}
        className={navLinkClass}
      >
        {item.label}
      </NavLink>
    ));

  return (
    <header className="sticky top-0 z-20 border-b-4 border-[var(--color-ink)] bg-[linear-gradient(to_bottom,var(--color-sky-1)_0_11px,var(--color-sky-2)_11px_22px,var(--color-sky-3)_22px_33px,var(--color-sky-4)_33px_44px,var(--color-sky-5)_44px_55px,var(--color-sky-6)_55px)]">
      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4">
        <NavLink
          to={ROUTES.HOME}
          aria-label="Fiano home"
          className="flex shrink-0 items-center"
        >
          <img
            src={foxMascot}
            alt=""
            className="absolute left-[21px] top-[15px] h-[88px] w-[94px] -rotate-2"
          />
          <img
            src={fianoLogo}
            alt="Fiano"
            className="ml-[120px] h-[46px] w-[95px]"
          />
        </NavLink>
        <label className="ml-10 hidden h-10 w-[380px] shrink items-center border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 md:flex">
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
          className="ml-12 hidden items-center gap-[14px] lg:flex"
        >
          {renderNavLinks()}
        </nav>

        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className="ml-auto flex h-10 w-10 cursor-pointer items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] text-[var(--color-ink)] lg:hidden"
        >
          {mobileOpen ? (
            <X aria-hidden="true" className="h-5 w-5" />
          ) : (
            <Menu aria-hidden="true" className="h-5 w-5" />
          )}
        </button>

        {user && (
          <div className="group relative shrink-0 lg:ml-auto">
            <NavLink
              to={ROUTES.PROFILE}
              aria-haspopup="menu"
              aria-label="Go to profile"
              onClick={closeFocusedMenu}
              className="avatar flex"
            >
              <img
                src={defaultAvatar}
                alt=""
                className="avatar h-12 w-12 border-[2.5px] border-[var(--color-ink)] object-cover"
              />
            </NavLink>
            <div className="invisible absolute right-0 top-full pt-3 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              <div
                role="menu"
                className="flex w-48 flex-col border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)]"
              >
                <p className="m-0 truncate border-b-2 border-[var(--color-line-dashed)] px-4 py-3 text-sm font-bold text-[var(--color-ink)]">
                  {user.displayName}
                </p>
                <NavLink
                  to={ROUTES.PROFILE}
                  role="menuitem"
                  onClick={closeFocusedMenu}
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
                  Log out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute left-0 right-0 top-full flex flex-col gap-3 border-b-4 border-[var(--color-ink)] bg-[var(--color-surface-page)] px-4 py-4 lg:hidden"
        >
          {renderNavLinks(() => setMobileOpen(false))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
