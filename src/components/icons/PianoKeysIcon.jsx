import pianoKeysIcon from '../../assets/virtual-piano-assets/piano-keys-icon.svg';

const PianoKeysIcon = ({ className = 'h-4 w-4' }) => (
  <span
    aria-hidden="true"
    className={`inline-block bg-current ${className}`}
    style={{ maskImage: `url("${pianoKeysIcon}")`, maskSize: '100% 100%', maskRepeat: 'no-repeat' }}
  />
);

export default PianoKeysIcon;
