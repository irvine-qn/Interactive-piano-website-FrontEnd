// Icon bàn phím (khung vuông + phím) theo thiết kế; lucide chỉ có icon đàn grand
const PianoKeysIcon = ({ className = 'h-4 w-4' }) => (
  <svg aria-hidden="true" viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="1.5" y="1.5" width="13" height="13" />
    <path d="M5.5 1.5v13M10.5 1.5v13" />
    <path d="M4 1.5v7h3v-7M9 1.5v7h3v-7" fill="currentColor" strokeWidth="0" />
  </svg>
);

export default PianoKeysIcon;
