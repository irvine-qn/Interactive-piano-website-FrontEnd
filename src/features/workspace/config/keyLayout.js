// Vị trí 88 phím (A0 - C8) theo % chiều ngang vùng phím, cùng công thức với bàn phím HomePage.
// Bàn phím và Waterfall dùng chung để nốt rơi thẳng xuống đúng phím.
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FIRST_MIDI = 21; // A0
const LAST_MIDI = 108; // C8
// Phím đen rộng 62% phím trắng và nằm giữa ranh giới hai phím trắng (như Home)
export const BLACK_KEY_RATIO = 0.62;

const KEYS = Array.from({ length: LAST_MIDI - FIRST_MIDI + 1 }, (_, i) => {
  const midi = FIRST_MIDI + i;
  const name = NOTE_NAMES[midi % 12];
  return { midi, note: `${name}${Math.floor(midi / 12) - 1}`, isBlack: name.includes('#') };
});

const WHITE_COUNT = KEYS.filter((k) => !k.isBlack).length; // 52
const WHITE_WIDTH = 100 / WHITE_COUNT;
const BLACK_WIDTH = WHITE_WIDTH * BLACK_KEY_RATIO;

// [{ midi, note, isBlack, left, width }] với left/width tính theo %
export const KEY_LAYOUT = (() => {
  let whiteIndex = 0;
  return KEYS.map((key) => {
    if (key.isBlack) return { ...key, left: whiteIndex * WHITE_WIDTH - BLACK_WIDTH / 2, width: BLACK_WIDTH };
    const layout = { ...key, left: whiteIndex * WHITE_WIDTH, width: WHITE_WIDTH };
    whiteIndex += 1;
    return layout;
  });
})();

export const KEY_LAYOUT_BY_NOTE = new Map(KEY_LAYOUT.map((key) => [key.note, key]));
