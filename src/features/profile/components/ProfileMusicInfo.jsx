import { Link } from "react-router-dom";
import { PROFILE_LEVELS } from "../../../config/profile";
import { ROUTES } from "../../../config/routes";

const LABEL_CLASS = "m-0 mb-2 text-xs font-bold uppercase text-[var(--color-neutral-600)]";
const TAG_CLASS = "border-2 px-2 py-1 text-xs font-bold";
const EMPTY_CLASS = "m-0 text-sm font-semibold text-[var(--color-neutral-400)]";

const TagGroup = ({ label, tags, tagClassName }) => (
  <div>
    <h3 className={LABEL_CLASS}>{label}</h3>
    {tags.length === 0 ? (
      <p className={EMPTY_CLASS}>Not set</p>
    ) : (
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {tags.map((tag) => (
          <li key={tag} className={`${TAG_CLASS} ${tagClassName}`}>
            {tag}
          </li>
        ))}
      </ul>
    )}
  </div>
);

const ProfileMusicInfo = ({ user }) => {
  const level = PROFILE_LEVELS.find(({ value }) => value === user.level);

  return (
    <section
      aria-label="Music profile"
      className="mt-6 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)]"
    >
      <header className="flex flex-wrap items-center justify-between gap-2 border-0 border-b-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-5 py-3">
        <h2 className="m-0 text-base font-bold text-[var(--color-ink)]">Music profile</h2>
        <Link
          to={ROUTES.PROFILE_EDIT}
          className="text-sm font-bold text-[var(--color-brand-strong)] no-underline hover:text-[var(--color-brand-deep)]"
        >
          Edit
        </Link>
      </header>
      <div className="grid gap-5 p-5 md:grid-cols-3">
        <div>
          <h3 className={LABEL_CLASS}>Level</h3>
          {level ? (
            <p className={`${TAG_CLASS} m-0 inline-block border-[var(--color-ink)] bg-[var(--color-brand)] text-[var(--color-neutral-white)]`}>
              {level.label}
            </p>
          ) : (
            <p className={EMPTY_CLASS}>Not set</p>
          )}
        </div>
        <TagGroup
          label="Favorite genres"
          tags={user.favoriteGenres ?? []}
          tagClassName="border-[var(--color-brand-deep)] bg-[var(--color-brand-tint)] text-[var(--color-brand-deep)]"
        />
        <TagGroup
          label="Favorite artists"
          tags={user.favoriteArtists ?? []}
          tagClassName="border-[var(--color-info-strong)] bg-[var(--color-info-tint)] text-[var(--color-info-strong)]"
        />
      </div>
    </section>
  );
};

export default ProfileMusicInfo;
