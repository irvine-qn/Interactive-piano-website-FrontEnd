import { Link } from "react-router-dom";
import Footer from "../components/common/footer";
import { ROUTES } from "../config/routes";

const NotFoundPage = () => (
  <div className="flex flex-1 flex-col">
    <main className="flex flex-1 items-center justify-center px-4 py-14">
      <section className="w-full max-w-[560px] border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-10 py-10 text-center">
        <p className="m-0 text-[64px] font-extrabold text-[var(--color-brand)]">404</p>
        <h1 className="mb-0 mt-2 text-[26px] font-extrabold text-[var(--color-ink)]">
          This page doesn't exist or is still under construction
        </h1>
        <p className="mt-3 text-sm font-medium text-[var(--color-neutral-600)]">
          Head back to the home page to keep playing.
        </p>
        <Link
          to={ROUTES.HOME}
          className="mt-6 inline-flex h-12 items-center border-2 border-[var(--color-ink)] bg-[var(--color-brand)] px-8 text-sm font-bold text-[var(--color-neutral-white)] no-underline"
        >
          Back to home
        </Link>
      </section>
    </main>
    <Footer />
  </div>
);

export default NotFoundPage;
