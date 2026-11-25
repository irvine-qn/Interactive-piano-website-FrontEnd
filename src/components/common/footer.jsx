const Footer = () => (
  <footer className="flex flex-col">
    <span
      aria-hidden="true"
      className="h-[1.125rem] bg-[repeating-linear-gradient(90deg,var(--color-grass)_0_6px,transparent_6px_12px,var(--color-grass)_12px_24px,transparent_24px_30px,var(--color-grass-light)_30px_36px,transparent_36px_42px),linear-gradient(to_bottom,transparent_0_12px,var(--color-grass)_12px)]"
    />
    <div className="flex h-[4.875rem] items-center justify-center bg-[var(--color-grass)] text-sm font-semibold text-[var(--color-ink)]">
      © {new Date().getFullYear()} - Fiano
    </div>
    <span aria-hidden="true" className="h-6 bg-[var(--color-grass-dark)]" />
  </footer>
);
export default Footer;
