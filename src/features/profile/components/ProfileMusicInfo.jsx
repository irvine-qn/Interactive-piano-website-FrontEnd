import { Link } from "react-router-dom";
import { PROFILE_LEVELS } from "../../../config/profile";
import { ROUTES } from "../../../config/routes";

const LABEL_CLASS = "m-0 mb-2 text-xs font-bold uppercase text-[var(--color-neutral-600)]";
const TAG_CLASS = "border-2 px-2 py-1 text-xs font-bold";

const TagGroup = ({ label, tags, tagClassName }) =>
  tags.length > 0 && (
    <div>
      <h3 className={LABEL_CLASS}>{label}</h3>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {tags.map((tag) => (
          <li key={tag} className={`${TAG_CLASS} ${tagClassName}`}>
            {tag}
          </li>
        ))}
      </ul>
    </div>
  );

const ProfileMusicInfo = ({ user }) => {
  const level = PROFILE_LEVELS.find(({ value }) => value === user.level);
  const genres = user.favoriteGenres ?? [];
  const artists = user.favoriteArtists ?? [];

  if (!level && genres.length === 0 && artists.length === 0) return null;

  return (
    <section
      aria-label="Music profile"
      className="mt-6 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)]"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-0 border-b-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-5 py-3">
        <h2 className="m-0 text-base font-bold text-[var(--color-ink)]">Music profile</h2>
        <Link
          to={ROUTES.PROFILE_EDIT}
          className="text-sm font-bold text-[var(--color-brand-deep)] no-underline hover:text-[var(--color-brand-deep)]"
        >
          Edit
        </Link>
      </header>
      <div className="grid gap-5 p-5 md:grid-cols-3">
        {level && (
          <div>
            <h3 className={LABEL_CLASS}>Level</h3>
            <p className={`${TAG_CLASS} m-0 inline-block border-[var(--color-ink)] bg-[var(--color-brand)] text-[var(--color-ink)]`}>
              {level.label}
            </p>
          </div>
        )}
        <TagGroup
          label="Favorite genres"
          tags={genres}
          tagClassName="border-[var(--color-brand-deep)] bg-[var(--color-brand-tint)] text-[var(--color-brand-deep)]"
        />
        <TagGroup
          label="Favorite artists"
          tags={artists}
          tagClassName="border-[var(--color-info-strong)] bg-[var(--color-info-tint)] text-[var(--color-info-strong)]"
        />
      </div>
    </section>
  );
};

export default ProfileMusicInfo;
