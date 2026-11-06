import {
  CalendarDays,
  Pencil,
  PlusSquare,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import defaultAvatar from "../../../assets/virtual-piano-assets/default-avatar.jpeg";
import { ROUTES } from "../../../config/routes";
import AccountSecurityPanel from "./AccountSecurityPanel";

const OUTLINE_BUTTON_CLASS =
  "flex h-10 cursor-pointer items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-3 font-[inherit] text-sm font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]";

const NOTE_PIXELS = [
  [12, 0, 8, 4],
  [12, 4, 12, 4],
  [12, 8, 4, 4],
  [20, 8, 4, 4],
  [12, 12, 4, 4],
  [0, 16, 16, 8],
  [4, 24, 8, 4],
];

const STAR_PIXELS = [
  [30, 0, 6, 6],
  [24, 6, 18, 12],
  [0, 18, 66, 6],
  [6, 24, 54, 6],
  [12, 30, 42, 12],
  [6, 42, 24, 6],
  [36, 42, 24, 6],
  [6, 48, 18, 6],
  [42, 48, 18, 6],
  [6, 54, 12, 6],
  [48, 54, 12, 6],
];

const STAR_EYE_PIXELS = [
  [24, 30, 6, 6],
  [42, 30, 6, 6],
];

const BANNER_NOTES = [
  { className: "left-[4.17%] top-[26.3%] text-[var(--color-decor-lilac)]" },
  { className: "left-[36.46%] top-[11.6%] text-[var(--color-decor-sky)]" },
  { className: "left-[46.88%] top-[14.7%] text-[var(--color-decor-pink)]" },
  { className: "left-[55.21%] top-[31.6%] text-[var(--color-decor-peach)]" },
  { className: "left-[65.1%] top-[63.2%] text-[var(--color-decor-lilac)]" },
  { className: "left-[72.92%] top-[15.8%] text-[var(--color-decor-peach)]" },
  { className: "left-[80.21%] top-[57.9%] text-[var(--color-decor-pink)]" },
  { className: "left-[87.5%] top-[21.1%] text-[var(--color-decor-sky)]" },
];

const PixelRects = ({ pixels }) =>
  pixels.map(([x, y, width, height]) => (
    <rect
      key={`${x}-${y}`}
      x={x}
      y={y}
      width={width}
      height={height}
      fill="currentColor"
    />
  ));

const BannerDecorations = () => (
  <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
    {BANNER_NOTES.map(({ className }) => (
      <svg
        key={className}
        viewBox="0 0 24 28"
        shapeRendering="crispEdges"
        className={`absolute h-7 w-6 ${className}`}
      >
        <PixelRects pixels={NOTE_PIXELS} />
      </svg>
    ))}
    <svg
      viewBox="0 0 66 60"
      shapeRendering="crispEdges"
      className="absolute left-[83.85%] top-[13.7%] h-[60px] w-[66px] text-[var(--color-sun)]"
    >
      <PixelRects pixels={STAR_PIXELS} />
      <g className="text-[var(--color-ink)]">
        <PixelRects pixels={STAR_EYE_PIXELS} />
      </g>
    </svg>
  </div>
);

const formatJoinedDate = (createdAt) =>
  new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const ProfileSettingsMenu = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Profile settings"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={OUTLINE_BUTTON_CLASS}
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-2 w-[calc(100vw-2rem)] max-w-md">
          <AccountSecurityPanel user={user} />
        </div>
      )}
    </div>
  );
};

const ProfileHeader = ({ user }) => (
  <header>
    <div className="relative border-0 border-b-4 border-solid border-[var(--color-ink)] bg-[var(--color-banner-peach)]">
      <BannerDecorations />
      <div className="relative mx-auto flex h-32 w-full max-w-7xl items-end gap-4 px-4 sm:h-48 sm:gap-6">
        <img
          src={user.avatarUrl || defaultAvatar}
          alt={`${user.username} avatar`}
          className="avatar relative -mb-12 size-24 shrink-0 border-4 border-[var(--color-ink)] bg-[var(--color-surface-card)] object-cover sm:-mb-20 sm:size-40"
        />
        <h1 className="m-0 min-w-0 truncate pb-2 text-2xl font-extrabold text-[var(--color-ink)] sm:text-5xl">
          {user.displayName || user.username}
        </h1>
      </div>
    </div>

    <div className="mx-auto flex w-full max-w-7xl flex-wrap items-start justify-between gap-4 px-4 pt-14 sm:pl-48 sm:pt-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold">
          <p className="m-0 font-bold text-[var(--color-brand-strong)]">
            @{user.username}
          </p>
          {user.createdAt && (
            <p className="m-0 flex items-center gap-1.5 text-[var(--color-neutral-600)]">
              <CalendarDays size={16} aria-hidden="true" />
              Joined {formatJoinedDate(user.createdAt)}
            </p>
          )}
        </div>
        {user.bio && (
          <p className="m-0 mt-2 text-sm text-[var(--color-neutral-600)]">
            {user.bio}
          </p>
        )}
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto">
        <div className="flex gap-2">
          <Link
            to={ROUTES.PROFILE_EDIT}
            className={`${OUTLINE_BUTTON_CLASS} flex-1 no-underline`}
          >
            <Pencil size={16} aria-hidden="true" />
            Edit profile
          </Link>
          <ProfileSettingsMenu user={user} />
        </div>
        <Link
          to={ROUTES.UPLOAD}
          className="flex h-10 items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-brand)] px-4 text-sm font-bold text-[var(--color-neutral-white)] no-underline transition-colors hover:bg-[var(--color-brand-strong)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-ink)]"
        >
          <PlusSquare size={16} aria-hidden="true" />
          Upload new sheet (+ MIDI)
        </Link>
      </div>
    </div>
  </header>
);

export default ProfileHeader;
