import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { toImageUrl } from "../../config/api";
import defaultAvatar from "../../assets/virtual-piano-assets/default-avatar.webp";
const fianoLogo = "/fiano-logo.webp";
const foxMascot = "/fox-mascot-sm.webp";
import { BookOpen, LogIn, LogOut, Menu, Search, Upload, User, UserPlus, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { ROUTES } from "../../config/routes";
import NavbarSearch from "./NavbarSearch";
import PianoKeysIcon from "../icons/PianoKeysIcon";

const NAV_ITEMS = [
  { to: ROUTES.HOME, label: "Piano", Icon: PianoKeysIcon },
  { to: ROUTES.LIBRARY, label: "Sheet library", Icon: BookOpen },
  { to: ROUTES.UPLOAD, label: "Upload", Icon: Upload, authOnly: true },
  { to: ROUTES.LOGIN, label: "Log in", Icon: LogIn, guestOnly: true },
  { to: ROUTES.REGISTER, label: "Sign up", Icon: UserPlus, guestOnly: true },
];

const AUTH_PATHS = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.FORGOT_PASSWORD];

const navLinkClass = ({ isActive }) =>
  `flex h-9 items-center border-2 border-[var(--color-ink)] px-[18px] text-[15px] font-bold no-underline ${
    isActive
      ? "bg-[var(--color-brand)] text-[var(--color-ink)]"
      : "bg-[var(--color-surface-card)] text-[var(--color-ink)]"
  }`;

const drawerLinkClass = ({ isActive }) =>
  `flex h-11 items-center gap-3 border-2 px-3 text-[15px] font-bold no-underline ${
    isActive
      ? "border-[var(--color-ink)] bg-[var(--color-brand)] text-[var(--color-neutral-white)] shadow-[var(--shadow-hard-sm)]"
      : "border-transparent text-[var(--color-ink)]"
  }`;

const iconButtonClass =
  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 text-[var(--color-ink)] shadow-[var(--shadow-hard-sm)]";

const closeFocusedMenu = () => document.activeElement?.blur();

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const routeKey = `${location.pathname}${location.search}`;
  const [openPanel, setOpenPanel] = useState(null);
  const panel = openPanel?.routeKey === routeKey ? openPanel.name : null;
  const mobileOpen = panel === "menu";
  const searchOpen = panel === "search";
  const togglePanel = (name) =>
    setOpenPanel(panel === name ? null : { name, routeKey });
  const setMobileOpen = (open) => setOpenPanel(open ? { name: "menu", routeKey } : null);
  const isLibrary = location.pathname === ROUTES.LIBRARY;
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

  const renderNavLinks = (onItemClick, linkClass = navLinkClass) =>
    navItems.map(({ Icon, ...item }) => (
      <NavLink
        key={item.to}
        to={item.to}
        state={
          item.to === ROUTES.LOGIN || item.to === ROUTES.REGISTER
            ? { from }
            : undefined
        }
        end
        onClick={onItemClick}
        className={linkClass}
      >
        {linkClass === drawerLinkClass && <Icon aria-hidden="true" className="h-5 w-5" />}
        {item.label}
      </NavLink>
    ));

  return (
    <header className="sticky top-0 z-20 border-b-4 border-[var(--color-ink)] bg-[linear-gradient(to_bottom,var(--color-sky-1)_0_11px,var(--color-sky-2)_11px_22px,var(--color-sky-3)_22px_33px,var(--color-sky-4)_33px_44px,var(--color-sky-5)_44px_55px,var(--color-sky-6)_55px)]">
      <div className="relative mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-4 lg:gap-6">
        <NavLink
          to={ROUTES.HOME}
          aria-label="Fiano home"
          className="flex shrink-0 items-center"
        >
          <img
            src={foxMascot}
            alt=""
            width={94}
            height={88}
            fetchPriority="high"
            className="absolute left-2 top-[0.9375rem] h-[4.5rem] w-[4.75rem] -rotate-2 md:left-[1.3125rem] md:h-[5.5rem] md:w-[5.875rem]"
          />
          <img
            src={fianoLogo}
            alt="Fiano"
            width={95}
            height={46}
            fetchPriority="high"
            className="ml-[5.25rem] h-[2.5rem] w-[5.1875rem] md:ml-[7.5rem] md:h-[2.875rem] md:w-[5.9375rem]"
          />
        </NavLink>
        <NavbarSearch
          className={`ml-10 hidden w-[23.75rem] md:flex max-lg:landscape:hidden ${isLibrary ? "invisible" : ""}`}
        />
        <nav
          aria-label="Main navigation"
          className="ml-12 hidden items-center gap-[14px] lg:flex"
        >
          {renderNavLinks()}
        </nav>

        <button
          type="button"
          onClick={() => togglePanel("menu")}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className={`${iconButtonClass} order-3 lg:hidden ${user ? "" : isLibrary ? "ml-auto" : "md:ml-auto max-lg:landscape:ml-0"}`}
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>

        {!isLibrary && (
          <button
            type="button"
            onClick={() => togglePanel("search")}
            aria-expanded={searchOpen}
            aria-controls="mobile-search"
            aria-label={searchOpen ? "Close search" : "Open search"}
            className={`${iconButtonClass} order-2 md:hidden max-lg:landscape:flex ${user ? "" : "ml-auto"}`}
          >
            {searchOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Search aria-hidden="true" className="h-5 w-5" />
            )}
          </button>
        )}

        {user && (
          <div className="group relative order-1 ml-auto shrink-0 lg:order-none">
            <NavLink
              to={ROUTES.PROFILE}
              aria-haspopup="menu"
              aria-label="Go to profile"
              onClick={closeFocusedMenu}
              className="avatar flex"
            >
              <img
                src={toImageUrl(user?.avatarUrl) || defaultAvatar}
                alt=""
                width={48}
                height={48}
                className="avatar h-10 w-10 border-[2.5px] lg:h-12 lg:w-12 border-[var(--color-ink)] object-cover"
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

      {searchOpen && !isLibrary && (
        <div
          id="mobile-search"
          className="absolute left-0 right-0 top-full border-b-4 border-[var(--color-ink)] bg-[var(--color-surface-page)] px-4 py-3 md:hidden max-lg:landscape:block"
        >
          <NavbarSearch className="flex w-full" />
        </div>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 cursor-pointer border-0 bg-[var(--color-overlay)] p-0"
          />
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="absolute bottom-0 right-0 top-0 flex w-[min(18.75rem,80vw)] flex-col overflow-y-auto border-l-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-3 py-4"
          >
            <div className="flex items-center justify-between px-2">
              <span className="text-xl font-extrabold text-[var(--color-ink)]">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-[var(--color-ink)]"
              >
                <X aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>

            {user && (
              <div className="mt-5 flex items-center gap-3 px-2">
                <img
                  src={toImageUrl(user.avatarUrl) || defaultAvatar}
                  alt=""
                  width={56}
                  height={56}
                  className="avatar h-14 w-14 shrink-0 border-[2.5px] border-[var(--color-ink)] object-cover"
                />
                <div className="min-w-0">
                  <p className="m-0 truncate text-base font-bold text-[var(--color-ink)]">
                    {user.displayName || user.username}
                  </p>
                  <p className="m-0 truncate text-sm font-bold text-[var(--color-brand-strong)]">
                    @{user.username}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-1">
              {renderNavLinks(() => setMobileOpen(false), drawerLinkClass)}
            </div>

            {user && (
              <>
                <hr className="my-4 w-full border-0 border-t-2 border-dashed border-[var(--color-line-dashed)]" />
                <NavLink
                  to={ROUTES.PROFILE}
                  end
                  onClick={() => setMobileOpen(false)}
                  className={drawerLinkClass}
                >
                  <User aria-hidden="true" className="h-5 w-5" />
                  Profile
                </NavLink>
                <hr className="my-4 w-full border-0 border-t-2 border-dashed border-[var(--color-line-dashed)]" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-11 cursor-pointer items-center gap-3 border-0 bg-transparent px-3 text-left font-[inherit] text-[15px] font-bold text-[var(--color-danger)]"
                >
                  <LogOut aria-hidden="true" className="h-5 w-5" />
                  Log out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
