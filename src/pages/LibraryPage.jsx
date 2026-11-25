import Footer from "../components/common/footer";
import LibraryBrowser from "../features/library/components/LibraryBrowser";

const LibraryPage = () => (
  <div className="flex flex-1 flex-col">
    <main className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col gap-5 px-4 pb-14 pt-6 sm:gap-8 sm:pt-12">
      <h1 className="m-0 text-[28px] font-extrabold leading-tight text-[var(--color-ink)] sm:sr-only">Sheet Library</h1>
      <LibraryBrowser />
    </main>
    <Footer />
  </div>
);

export default LibraryPage;
