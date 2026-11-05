import Footer from "../components/common/footer";
import LibraryBrowser from "../features/library/components/LibraryBrowser";

const LibraryPage = () => (
  <div className="flex flex-1 flex-col">
    <main className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-8 px-4 pb-14 pt-12">
      <h1 className="sr-only">Sheet Library</h1>
      <LibraryBrowser />
    </main>
    <Footer />
  </div>
);

export default LibraryPage;
