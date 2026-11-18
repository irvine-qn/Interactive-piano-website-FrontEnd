import { Music, Sun } from "lucide-react";
const fianoLogo = "/fiano-logo.webp";
const foxMascot = "/fox-mascot.webp";

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
  <main className="relative flex flex-1 flex-col items-stretch justify-start px-4 pb-10 lg:flex-row lg:items-center lg:justify-center lg:py-14">
    <div
      aria-hidden="true"
      className="relative -mx-4 mb-6 overflow-hidden bg-[linear-gradient(to_bottom,var(--color-sky-1)_0_20%,var(--color-sky-2)_20%_40%,var(--color-sky-3)_40%_60%,var(--color-sky-4)_60%_80%,var(--color-sky-5)_80%)] lg:hidden"
    >
      <Sun className="absolute right-8 top-6 h-10 w-10 fill-[var(--color-sun)] text-[var(--color-sun-ray)]" />
      <span className="absolute right-[9.5rem] top-4 h-2 w-8 bg-[var(--color-cloud)]" />
      <div className="relative z-10 max-w-[calc(100%-9.5rem)] px-4 pb-14 pt-10">
        <p className="m-0 text-[22px] font-extrabold leading-tight text-[var(--color-ink)]">{title}</p>
        <p className="m-0 mt-2 text-sm font-medium text-[var(--color-ink-soft)]">{subtitle}</p>
      </div>
      <img
        src={foxMascot}
        alt=""
        width={245}
        height={230}
        className="absolute bottom-6 right-2 z-10 h-auto w-[9.5rem]"
      />
      <div className="relative border-y-2 border-[var(--color-ink)]">
        {Array.from({ length: 3 }, (_, i) => (
          <span
            key={i}
            className={`block h-5 border-b-2 border-[var(--color-brick-mortar)] bg-[var(--color-brick)] bg-[repeating-linear-gradient(90deg,var(--color-brick-mortar)_0_2px,transparent_2px_40px)] last:border-b-0 ${
              i % 2 ? "bg-[position:20px_0]" : ""
            }`}
          />
        ))}
      </div>
    </div>
    {DECOR_NOTES.map((note) => (
      <Music
        key={note.className}
        aria-hidden="true"
        className={`absolute hidden h-7 w-7 xl:block ${note.className}`}
      />
    ))}

    <section className="grid w-full max-w-[70rem] grid-cols-1 self-center shadow-[var(--shadow-hard)] lg:shadow-none border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] lg:grid-cols-2">
      <div className="relative hidden min-h-[40rem] flex-col overflow-hidden border-r-2 border-[var(--color-ink)] bg-[linear-gradient(to_bottom,var(--color-sky-1)_0_16%,var(--color-sky-2)_16%_33%,var(--color-sky-3)_33%_50%,var(--color-sky-4)_50%_66%,var(--color-sky-5)_66%_83%,var(--color-sky-6)_83%)] lg:flex">
        <Sun
          aria-hidden="true"
          className="absolute right-8 top-8 h-14 w-14 fill-[var(--color-sun)] text-[var(--color-sun-ray)]"
        />
        <span
          aria-hidden="true"
          className="absolute left-[3.75rem] top-[14.875rem] h-2 w-9 bg-[var(--color-cloud)]"
        />
        <span
          aria-hidden="true"
          className="absolute right-[6.25rem] top-[13.875rem] h-3 w-12 bg-[var(--color-cloud)]"
        />

        <div className="relative px-10 pt-14">
          <img src={fianoLogo} alt="Fiano" width={120} height={58} className="h-[3.625rem] w-[7.5rem]" />
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
            width={245}
            height={230}
            className="absolute bottom-[5.75rem] left-1/2 z-10 h-auto w-[15.3125rem] -translate-x-1/2"
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

      <div className="flex flex-col justify-center px-4 py-6 sm:px-14 sm:py-10">
        {children}
      </div>
    </section>
  </main>
);

export default AuthLayout;
