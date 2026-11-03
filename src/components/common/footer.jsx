const Footer = () => (
  <footer className="flex flex-col">
    <span
      aria-hidden="true"
      className="h-[18px] bg-[var(--color-grass)]"
    />
    <div className="flex h-[78px] items-center justify-center bg-[var(--color-grass)] text-sm font-semibold text-[var(--color-grass-text)]">
      © {new Date().getFullYear()} - Fiano
    </div>
    <span aria-hidden="true" className="h-6 bg-[var(--color-grass-dark)]" />
  </footer>
);
export default Footer;
