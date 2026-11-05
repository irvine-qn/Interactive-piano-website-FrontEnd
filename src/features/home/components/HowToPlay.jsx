import { useRef } from "react";
import { CircleHelp, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import guide from "../../../assets/how-to-play.md?raw";

const MARKDOWN_COMPONENTS = {
  h1: ({ children }) => (
    <h1 className="m-0 pr-10 text-[26px] font-extrabold text-[var(--color-ink)]">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-6 text-xl font-bold text-[var(--color-brand-strong)]">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-bold text-[var(--color-ink)]">{children}</h3>
  ),
  p: ({ children }) => <p className="my-2 text-sm leading-6 text-[var(--color-ink)]">{children}</p>,
  ul: ({ children }) => <ul className="my-2 list-disc pl-5 text-sm leading-6 text-[var(--color-ink)]">{children}</ul>,
  table: ({ children }) => <table className="my-3 w-full border-collapse text-left text-sm text-[var(--color-ink)]">{children}</table>,
  th: ({ children }) => <th className="border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-3 py-2">{children}</th>,
  td: ({ children }) => <td className="border-2 border-solid border-[var(--color-ink)] px-3 py-2">{children}</td>,
  code: ({ children }) => <code className="bg-[var(--color-brand-tint)] px-1 font-bold">{children}</code>,
};

const HowToPlay = () => {
  const dialogRef = useRef(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current.showModal()}
        className="fixed right-4 top-[100px] z-30 flex h-8 cursor-pointer items-center gap-2 border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] px-3 font-[inherit] text-sm font-bold text-[var(--color-brand-strong)] shadow-[var(--shadow-hard-sm)] hover:bg-[var(--color-brand-tint)]"
      >
        <CircleHelp aria-hidden="true" className="h-4 w-4" />
        How to play
      </button>

      <dialog
        ref={dialogRef}
        aria-label="How to play"
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
        className="m-auto max-h-[85dvh] w-[min(720px,calc(100vw-32px))] overflow-hidden border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 shadow-[var(--shadow-hard-lg)]"
      >
        <div className="relative max-h-[85dvh] overflow-y-auto px-6 py-5">
          <button
            type="button"
            onClick={() => dialogRef.current.close()}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center border-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-card)] p-0 text-[var(--color-ink)]"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
            {guide}
          </ReactMarkdown>
        </div>
      </dialog>
    </>
  );
};

export default HowToPlay;
