import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../config/routes";
import { getSheets } from "../../features/library/api/libraryApi";

const SEARCH_DELAY_MS = 300;
const RESULT_LIMIT = 5;
const MESSAGE_CLASS =
  "m-0 px-4 py-3 text-sm font-semibold text-[var(--color-neutral-600)]";

const NavbarSearch = ({ className = "" }) => {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const [text, setText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [result, setResult] = useState({ q: "", sheets: [], hasError: false });
  const q = text.trim();
  const isLoading = result.q !== q;

  useEffect(() => {
    if (!q) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      getSheets({ q, pageSize: RESULT_LIMIT }, { signal: controller.signal })
        .then(({ data }) => setResult({ q, sheets: data, hasError: false }))
        .catch(() => {
          if (!controller.signal.aborted)
            setResult({ q, sheets: [], hasError: true });
        });
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handlePointerDown = (event) => {
      if (!formRef.current?.contains(event.target)) setIsOpen(false);
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

  const resetSearch = () => {
    setText("");
    setIsOpen(false);
    document.activeElement?.blur();
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    resetSearch();
    navigate(
      q ? `${ROUTES.LIBRARY}?q=${encodeURIComponent(q)}` : ROUTES.LIBRARY,
    );
  };

  return (
    <form
      ref={formRef}
      role="search"
      onSubmit={handleSubmit}
      className={`relative h-10 shrink items-center border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 md:flex ${className}`}
    >
      <input
        type="search"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder="Find some music?"
        aria-label="Search sheets"
        className="min-w-0 flex-1 appearance-none border-0 bg-transparent p-0 font-[inherit] text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-neutral-350)]"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex cursor-pointer border-0 bg-transparent p-0"
      >
        <Search
          aria-hidden="true"
          className="h-[1.625rem] w-7 text-[var(--color-brand-deep)]"
        />
      </button>

      {isOpen && q && (
        <div className="absolute -left-[2px] -right-[2px] top-full mt-2 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)]">
          {isLoading && (
            <p role="status" className={MESSAGE_CLASS}>
              Searching...
            </p>
          )}
          {!isLoading && result.hasError && (
            <p role="alert" className={MESSAGE_CLASS}>
              Unable to search right now.
            </p>
          )}
          {!isLoading && !result.hasError && result.sheets.length === 0 && (
            <p className={MESSAGE_CLASS}>No sheets found.</p>
          )}
          {!isLoading && result.sheets.length > 0 && (
            <ul className="m-0 list-none p-0">
              {result.sheets.map((sheet) => (
                <li key={sheet.id}>
                  <Link
                    to={`${ROUTES.WORKSPACE}/${encodeURIComponent(sheet.id)}`}
                    onClick={resetSearch}
                    className="block px-4 py-2 no-underline hover:bg-[var(--color-brand-tint)]"
                  >
                    <span className="block truncate text-sm font-bold text-[var(--color-ink)]">
                      {sheet.title}
                    </span>
                    <span className="block truncate text-xs text-[var(--color-neutral-600)]">
                      {sheet.composer}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
};

export default NavbarSearch;
