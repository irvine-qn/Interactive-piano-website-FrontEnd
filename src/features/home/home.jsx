import { Link } from "react-router-dom";

const Home = () => (
  <main className="min-h-screen bg-[var(--color-surface-page)] px-6 py-12 text-[var(--color-ink)]">
    <section className="mx-auto w-full max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold">Home</h1>
      <nav aria-label="Home features" className="grid gap-6 sm:grid-cols-2">
        <Link
          to="/piano"
          className="block border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-6 font-semibold text-[var(--color-ink)] no-underline shadow-[var(--shadow-hard)] transition-shadow hover:shadow-[var(--shadow-hard-lg)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
        >
          Piano
        </Link>
        <Link
          to="/metronome"
          className="block border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] p-6 font-semibold text-[var(--color-ink)] no-underline shadow-[var(--shadow-hard)] transition-shadow hover:shadow-[var(--shadow-hard-lg)] focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
        >
          Metronome
        </Link>
      </nav>
    </section>
  </main>
);

export default Home;
