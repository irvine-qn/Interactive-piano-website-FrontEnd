import Metronome from "../metronome/metronome";
import Piano from "../piano/piano";

const Home = () => (
  <div className="flex flex-1 flex-col">
    <main className="mx-auto w-full max-w-[1600px] flex-1 overflow-x-auto px-4 pb-14 pt-10">
      <Piano>
        <Metronome />
      </Piano>
    </main>
    <footer className="flex flex-col">
      <span
        aria-hidden="true"
        className="h-[18px] bg-[repeating-linear-gradient(90deg,var(--color-grass)_0_6px,transparent_6px_12px,var(--color-grass)_12px_24px,transparent_24px_30px,var(--color-grass-light)_30px_36px,transparent_36px_42px),linear-gradient(to_bottom,transparent_0_12px,var(--color-grass)_12px)]"
      />
      <div className="flex h-[78px] items-center justify-center bg-[var(--color-grass)] text-sm font-semibold text-[var(--color-grass-text)]">
        @2026 - Team 5
      </div>
      <span aria-hidden="true" className="h-6 bg-[var(--color-grass-dark)]" />
    </footer>
  </div>
);

export default Home;
