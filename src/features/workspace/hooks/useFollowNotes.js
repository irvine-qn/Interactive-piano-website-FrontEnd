import { useEffect } from "react";
import { getSongTime } from "../audio/songClock";

const LOOKAHEAD_SECONDS = 3;
const CHECK_INTERVAL_MS = 250;

const octaveOf = (midi) => Math.floor(midi / 12) - 1;

export const pickViewOctave = (notes, songTime, currentOctave, octaves) => {
  const upcoming = notes.filter((note) => note.time + note.duration >= songTime && note.time <= songTime + LOOKAHEAD_SECONDS);
  if (upcoming.length === 0) return currentOctave;
  const midis = upcoming.map((note) => note.midi);
  const low = octaveOf(Math.min(...midis));
  const high = octaveOf(Math.max(...midis));
  const lastVisible = currentOctave + octaves - 1;
  if (low >= currentOctave && high <= lastVisible) return currentOctave;
  if (high - low + 1 >= octaves) return low;
  return high > lastVisible ? high - octaves + 1 : low;
};

export const useFollowNotes = ({ notes, isPlaying, view, viewOctave, setViewOctave }) => {
  const octaves = view?.octaves;

  useEffect(() => {
    if (!isPlaying || !octaves || !notes?.length) return undefined;
    const timer = setInterval(() => {
      const next = pickViewOctave(notes, getSongTime(), viewOctave, octaves);
      if (next !== viewOctave) setViewOctave(next);
    }, CHECK_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [notes, isPlaying, octaves, viewOctave, setViewOctave]);
};
