import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toggleSheetLike } from '../api/libraryApi';
import { ROUTES } from '../../../config/routes';
import { useAuthStore } from '../../../store/useAuthStore';
import { formatCount } from '../../../utils/format';

const LikeButton = ({ sheetId, liked, likes, suffix = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAuthStore((state) => Boolean(state.user));
  const [result, setResult] = useState(null);
  const [pending, setPending] = useState(false);

  const isCurrent = result && result.baseLiked === liked && result.baseLikes === likes;
  const shownLikes = isCurrent ? result.likes : likes;
  const shownLiked = isLoggedIn && (isCurrent ? result.liked : Boolean(liked));

  const goToLogin = () =>
    navigate(ROUTES.LOGIN, { state: { from: `${location.pathname}${location.search}` } });

  const handleClick = async () => {
    if (!isLoggedIn) {
      goToLogin();
      return;
    }
    setPending(true);
    try {
      const next = await toggleSheetLike(sheetId);
      setResult({ ...next, baseLiked: liked, baseLikes: likes });
    } catch (error) {
      if (error.status === 401) goToLogin();
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={shownLiked}
      aria-label={`${shownLiked ? 'Unlike' : 'Like'} this sheet, ${shownLikes} likes`}
      className="flex cursor-pointer items-center gap-1.5 border-0 bg-transparent p-0 font-[inherit] font-bold text-[var(--color-danger)] disabled:cursor-wait"
    >
      <Heart
        aria-hidden="true"
        className={`h-4 w-4 text-[var(--color-danger-bright)] ${shownLiked ? 'fill-[var(--color-danger-bright)]' : ''}`}
      />
      {formatCount(shownLikes)}{suffix}
    </button>
  );
};

export default LikeButton;
