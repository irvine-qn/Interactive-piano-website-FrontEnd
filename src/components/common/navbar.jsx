import { NavLink, useLocation } from "react-router-dom";
import defaultAvatar from "../../assets/virtual-piano-assets/default-avatar.jpeg";
import fianoLogo from "../../assets/virtual-piano-assets/fiano-logo.png";
import foxMascot from "../../assets/virtual-piano-assets/fox-mascot.png";
import { Search } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const NAV_ITEMS = [
  { to: "/", label: "Piano" },
  { to: "/library", label: "Library" },
  { to: "/workspace", label: "Practice_sample" },
  { to: "/upload", label: "Upload" },
  { to: "/profile", label: "Profile" },
  { to: "/login", label: "Login", guestOnly: true },
  { to: "/register", label: "Register", guestOnly: true },
];

const AUTH_PATHS = ["/login", "/register", "/forgot-password"];

const Navbar = () => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const navItems = NAV_ITEMS.filter((item) => !(user && item.guestOnly));
  const from = AUTH_PATHS.includes(location.pathname)
    ? location.state?.from
    : `${location.pathname}${location.search}`;

  return (
    <header className="relative z-20 border-b-4 border-[var(--color-ink)] bg-[linear-gradient(to_bottom,var(--color-sky-1)_0_16px,var(--color-sky-2)_16px_32px,var(--color-sky-3)_32px_48px,var(--color-sky-4)_48px_64px,var(--color-sky-5)_64px_80px,var(--color-sky-6)_80px)]">
      <div className="relative mx-auto flex h-[92px] w-full max-w-[1600px] items-center gap-6 px-4">
        <NavLink
          to="/"
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
              state={item.to === "/login" ? { from } : undefined}
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
        <img
          src={defaultAvatar}
          alt="User avatar"
          className="avatar ml-auto h-10 w-10 shrink-0 border-[2.5px] border-[var(--color-ink)] object-cover"
        />
      </div>
    </header>
  );
};

export default Navbar;
