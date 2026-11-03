import { Music, Sun } from "lucide-react";
import fianoLogo from "../../../assets/virtual-piano-assets/fiano-logo.png";
import foxMascot from "../../../assets/virtual-piano-assets/fox-mascot.png";

const DECOR_NOTES = [
  { className: "left-[9%] top-[8%] text-[var(--color-decor-peach)]" },
  { className: "left-[12%] top-[48%] text-[var(--color-decor-lilac)]" },
  { className: "left-[10%] top-[85%] text-[var(--color-decor-sky)]" },
  { className: "right-[10%] top-[12%] text-[var(--color-decor-sky)]" },
  { className: "right-[13%] top-[58%] text-[var(--color-decor-pink)]" },
  { className: "right-[9%] top-[88%] text-[var(--color-decor-peach)]" },
];

const BRICK_ROWS = 7;

const AuthLayout = ({ title, subtitle, children }) => (
  <main className="relative flex flex-1 items-center justify-center px-4 py-14">
    {DECOR_NOTES.map((note) => (
      <Music
        key={note.className}
        aria-hidden="true"
        className={`absolute hidden h-7 w-7 xl:block ${note.className}`}
      />
    ))}

    <section className="grid w-full max-w-[1120px] grid-cols-1 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] shadow-[var(--shadow-hard-lg)] lg:grid-cols-2">
      <div className="relative hidden min-h-[640px] flex-col overflow-hidden border-r-2 border-[var(--color-ink)] bg-[linear-gradient(to_bottom,var(--color-sky-1)_0_16%,var(--color-sky-2)_16%_33%,var(--color-sky-3)_33%_50%,var(--color-sky-4)_50%_66%,var(--color-sky-5)_66%_83%,var(--color-sky-6)_83%)] lg:flex">
        <Sun
          aria-hidden="true"
          className="absolute right-8 top-8 h-14 w-14 fill-[var(--color-sun)] text-[var(--color-sun-ray)]"
        />
        <span
          aria-hidden="true"
          className="absolute left-[60px] top-[238px] h-2 w-9 bg-[var(--color-cloud)]"
        />
        <span
          aria-hidden="true"
          className="absolute right-[100px] top-[222px] h-3 w-12 bg-[var(--color-cloud)]"
        />

        <div className="relative px-10 pt-14">
          <img src={fianoLogo} alt="Fiano" className="h-[58px] w-[120px]" />
          <h1 className="mb-0 mt-6 text-[26px] font-extrabold text-[var(--color-ink)]">
            {title}
          </h1>
          <p className="mt-2 text-sm font-medium text-[var(--color-ink-soft)]">
            {subtitle}
          </p>
        </div>

        <div className="relative mt-auto">
          <img
            src={foxMascot}
            alt=""
            className="absolute bottom-[92px] left-1/2 z-10 w-[245px] -translate-x-1/2"
          />
          <div
            aria-hidden="true"
            className="relative border-t-2 border-[var(--color-ink)]"
          >
            {Array.from({ length: BRICK_ROWS }, (_, i) => (
              <span
                key={i}
                className={`block h-6 border-b-2 border-[var(--color-brick-mortar)] bg-[var(--color-brick)] bg-[repeating-linear-gradient(90deg,var(--color-brick-mortar)_0_2px,transparent_2px_48px)] ${
                  i % 2 ? "bg-[position:24px_0]" : ""
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center px-6 py-10 sm:px-14">
        {children}
      </div>
    </section>
  </main>
);

export default AuthLayout;
