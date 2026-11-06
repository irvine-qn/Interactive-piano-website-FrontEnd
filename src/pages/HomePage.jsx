import Footer from "../components/common/footer";
import HowToPlay from "../features/home/components/HowToPlay";
import Metronome from "../features/home/components/metronome";
import Piano from "../features/home/components/piano";

const HomePage = () => (
  <div className="flex flex-1 flex-col">
    <main className="mx-auto w-full max-w-[1600px] flex-1 overflow-x-auto px-4 pb-14">
      <Piano>
        <Metronome />
      </Piano>
    </main>
    <HowToPlay />
    <Footer />
  </div>
);

export default HomePage;
