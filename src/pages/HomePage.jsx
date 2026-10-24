import Footer from "../components/common/footer";
import Metronome from "../features/workspace/components/metronome";
import Piano from "../features/workspace/components/piano";

const HomePage = () => (
  <div className="flex flex-1 flex-col">
    <main className="mx-auto w-full max-w-[1600px] flex-1 overflow-x-auto px-4 pb-14 pt-10">
      <Piano>
        <Metronome />
      </Piano>
    </main>
    <Footer />
  </div>
);

export default HomePage;
