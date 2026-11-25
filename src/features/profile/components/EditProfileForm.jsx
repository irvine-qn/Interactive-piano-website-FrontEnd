import { CheckSquare, Plus, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import defaultAvatar from "../../../assets/virtual-piano-assets/default-avatar.webp";
import { toImageUrl } from "../../../config/api";
import { DISPLAY_NAME_MAX_LENGTH } from "../../../config/auth";
import {
  BIO_MAX_LENGTH,
  FAVORITES_MAX_ITEMS,
  FAVORITE_MAX_LENGTH,
  INSTAGRAM_MAX_LENGTH,
  INSTAGRAM_REGEX,
  LOCATION_MAX_LENGTH,
  PROFILE_LEVELS,
} from "../../../config/profile";
import { ROUTES } from "../../../config/routes";
import { useAuthStore } from "../../../store/useAuthStore";
import { FormError, inputClass } from "../../auth/components/AuthFormFields";
import { deleteProfileImage, getMe, updateProfile, uploadProfileImage } from "../api/profileApi";
import PhotoPositionDialog from "./PhotoPositionDialog";
import { BannerDecorations } from "./ProfileHeader";

const EDIT_BANNER_NOTES = [
  { className: "left-[54.7%] top-[52.7%] text-[var(--color-decor-lilac)]" },
  { className: "left-[65.9%] top-[19.3%] text-[var(--color-decor-peach)]" },
  { className: "left-[75.6%] top-[59.3%] text-[var(--color-decor-pink)]" },
  { className: "left-[85.4%] top-[23.3%] text-[var(--color-decor-sky)]" },
];

const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp";
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

const LABEL_CLASS = "mb-2 block text-sm font-bold text-[var(--color-ink)]";
const DISABLED_INPUT_CLASS = `${inputClass} disabled:bg-[var(--color-surface-muted)] disabled:text-[var(--color-neutral-600)]`;
const SECONDARY_BUTTON_CLASS =
  "flex h-10 cursor-pointer items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)] px-4 font-[inherit] text-sm font-bold text-[var(--color-ink)] no-underline transition-colors hover:bg-[var(--color-surface-soft)] disabled:cursor-not-allowed disabled:opacity-60";
const PRIMARY_BUTTON_CLASS =
  "flex h-10 cursor-pointer items-center justify-center gap-2 border-2 border-[var(--color-ink)] bg-[var(--color-brand)] px-4 font-[inherit] text-sm font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-brand-strong)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-disabled)] disabled:text-[var(--color-neutral-500)] disabled:opacity-60";

const toFormValues = (user) => ({
  displayName: user.displayName ?? "",
  city: user.city ?? "",
  country: user.country ?? "",
  instagram: user.instagram ?? "",
  bio: user.bio ?? "",
  level: user.level ?? "",
  favoriteGenres: user.favoriteGenres ?? [],
  favoriteArtists: user.favoriteArtists ?? [],
  showPracticeStats: user.showPracticeStats ?? true,
});

const validate = (values) => {
  if (!values.displayName.trim()) return "Display name is required.";
  const instagram = values.instagram.trim();
  if (instagram && !INSTAGRAM_REGEX.test(instagram)) {
    return "Enter a valid Instagram username.";
  }
  return null;
};

const FormCard = ({ title, hint, children }) => (
  <section className="border-2 border-[var(--color-ink)] bg-[var(--color-surface-card)]">
    <header className="flex flex-wrap items-center justify-between gap-2 border-0 border-b-2 border-solid border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-5 py-3">
      <h2 className="m-0 text-base font-bold text-[var(--color-ink)]">{title}</h2>
      {hint && <p className="m-0 text-xs font-semibold text-[var(--color-neutral-400)]">{hint}</p>}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const TextField = ({ id, label, required, ...inputProps }) => (
  <div>
    <label htmlFor={id} className={LABEL_CLASS}>
      {label}
      {required && <span className="ml-2 text-[var(--color-danger)]">*</span>}
    </label>
    <input id={id} name={id} required={required} className={inputClass} {...inputProps} />
  </div>
);

const TagField = ({ id, label, tags, onChange, tagClassName }) => {
  const [draft, setDraft] = useState("");
  const isFull = tags.length >= FAVORITES_MAX_ITEMS;

  const addTag = () => {
    const tag = draft.trim();
    if (tag && !isFull && !tags.includes(tag)) onChange([...tags, tag]);
    setDraft("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`flex h-8 items-center gap-2 border-2 px-2 text-xs font-bold ${tagClassName}`}
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(tags.filter((item) => item !== tag))}
              className="flex cursor-pointer items-center border-0 bg-transparent p-0 text-inherit"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </span>
        ))}
        {!isFull && (
          <span className="flex h-8 items-center gap-1 border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-card)] pr-1">
            <input
              id={id}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={FAVORITE_MAX_LENGTH}
              placeholder="Add..."
              className="h-full w-24 border-0 bg-transparent px-2 font-[inherit] text-xs text-[var(--color-ink)] outline-none placeholder:text-[var(--color-neutral-400)]"
            />
            <button
              type="button"
              aria-label={`Add to ${label}`}
              onClick={addTag}
              className="flex cursor-pointer items-center border-0 bg-transparent p-0 text-[var(--color-ink)]"
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </span>
        )}
      </div>
    </div>
  );
};

const PhotoUploadButton = ({ label, disabled, onSelect, className }) => (
  <label
    className={`${className} has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-ink)] ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
  >
    <input
      type="file"
      accept={PHOTO_ACCEPT}
      disabled={disabled}
      className="sr-only"
      onChange={(event) => {
        const file = event.target.files[0];
        event.target.value = "";
        if (file) onSelect(file);
      }}
    />
    <Upload size={16} aria-hidden="true" />
    {label}
  </label>
);

const ProfilePhotos = ({ user, onChange }) => {
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState(null);
  const [pendingPhoto, setPendingPhoto] = useState(null);
  const backgroundUrl = toImageUrl(user.backgroundUrl);

  const run = async (request) => {
    setIsBusy(true);
    setError(null);
    try {
      onChange(await request());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsBusy(false);
    }
  };

  const upload = (kind) => (file) => {
    if (file.size > PHOTO_MAX_BYTES) {
      setError("The image must be at most 5 MB.");
      return;
    }
    setError(null);
    setPendingPhoto({ kind, url: URL.createObjectURL(file) });
  };

  const closePendingPhoto = () => {
    URL.revokeObjectURL(pendingPhoto.url);
    setPendingPhoto(null);
  };

  const handlePhotoConfirm = (blob) => {
    const { kind } = pendingPhoto;
    closePendingPhoto();
    run(() => uploadProfileImage(kind, blob));
  };

  const handlePhotoError = (message) => {
    closePendingPhoto();
    setError(message);
  };

  return (
    <FormCard title="Profile photos" hint="JPG, PNG or WebP, up to 5 MB.">
      <div
        className="relative h-36 border-2 border-[var(--color-ink)] bg-[var(--color-banner-peach)] bg-cover bg-center"
        style={backgroundUrl ? { backgroundImage: `url("${backgroundUrl}")` } : undefined}
      >
        {!backgroundUrl && <BannerDecorations notes={EDIT_BANNER_NOTES} showStar={false} />}
        <div className="absolute bottom-3 right-3 flex flex-wrap justify-end gap-2">
          {backgroundUrl && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => run(() => deleteProfileImage("background"))}
              className={SECONDARY_BUTTON_CLASS}
            >
              Remove cover
            </button>
          )}
          <PhotoUploadButton
            label="Change cover"
            disabled={isBusy}
            onSelect={upload("background")}
            className={SECONDARY_BUTTON_CLASS}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-start gap-4 px-2">
        <img
          src={toImageUrl(user.avatarUrl) || defaultAvatar}
          alt={`${user.username} avatar`}
          className="avatar relative -mt-14 size-32 shrink-0 border-4 border-[var(--color-ink)] bg-[var(--color-surface-card)] object-cover"
        />
        <div className="flex flex-wrap gap-2 pt-4">
          <PhotoUploadButton
            label={isBusy ? "Saving..." : "Change avatar"}
            disabled={isBusy}
            onSelect={upload("avatar")}
            className={PRIMARY_BUTTON_CLASS}
          />
          {user.avatarUrl && (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => run(() => deleteProfileImage("avatar"))}
              className={SECONDARY_BUTTON_CLASS}
            >
              Remove photo
            </button>
          )}
        </div>
      </div>
      <FormError message={error} />
      {pendingPhoto && (
        <PhotoPositionDialog
          kind={pendingPhoto.kind}
          url={pendingPhoto.url}
          onConfirm={handlePhotoConfirm}
          onCancel={closePendingPhoto}
          onError={handlePhotoError}
        />
      )}
    </FormCard>
  );
};

const EditProfileFields = ({ user, onSaved, onPhotoChange }) => {
  const [initialValues] = useState(() => toFormValues(user));
  const [values, setValues] = useState(initialValues);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues);

  const setField = (name, value) => {
    setValues((current) => ({ ...current, [name]: value }));
  };

  const handleChange = ({ target }) => {
    setField(target.name, target.type === "checkbox" ? target.checked : target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate(values);
    setError(validationError);
    if (validationError) return;

    setIsSubmitting(true);
    try {
      onSaved(await updateProfile(values));
    } catch (requestError) {
      setError(requestError.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-6">
      <ProfilePhotos user={user} onChange={onPhotoChange} />

      <FormCard title="Basic information">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField
            id="displayName"
            label="Display name"
            required
            value={values.displayName}
            onChange={handleChange}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
          />
          <div>
            <label htmlFor="username" className={LABEL_CLASS}>
              Username
            </label>
            <input id="username" value={user.username} disabled className={DISABLED_INPUT_CLASS} />
          </div>
          <div>
            <label htmlFor="email" className={LABEL_CLASS}>
              Email
            </label>
            <div className="relative">
              <input id="email" value={user.email} disabled className={`${DISABLED_INPUT_CLASS} pr-28`} />
              <span
                className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold ${
                  user.isVerified ? "text-[var(--color-success)]" : "text-[var(--color-warning)]"
                }`}
              >
                {user.isVerified ? "Verified" : "Not verified"}
              </span>
            </div>
          </div>
          <TextField
            id="instagram"
            label="Instagram"
            value={values.instagram}
            onChange={handleChange}
            maxLength={INSTAGRAM_MAX_LENGTH + 1}
            placeholder="@username"
          />
          <TextField
            id="city"
            label="City"
            value={values.city}
            onChange={handleChange}
            maxLength={LOCATION_MAX_LENGTH}
            placeholder="Where do you live?"
          />
          <TextField
            id="country"
            label="Country"
            value={values.country}
            onChange={handleChange}
            maxLength={LOCATION_MAX_LENGTH}
            placeholder="Your country"
          />
          <div className="md:col-span-2">
            <label htmlFor="bio" className={LABEL_CLASS}>
              Bio
            </label>
            <div className="relative">
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={values.bio}
                onChange={handleChange}
                maxLength={BIO_MAX_LENGTH}
                className={`${inputClass} block h-auto resize-none py-3 pb-7`}
              />
              <span className="absolute bottom-2 right-3 text-xs font-semibold text-[var(--color-neutral-400)]">
                {values.bio.length}/{BIO_MAX_LENGTH}
              </span>
            </div>
          </div>
        </div>
      </FormCard>

      <FormCard title="Music profile">
        <div className="flex flex-col gap-6">
          <div role="group" aria-labelledby="level-label">
            <p id="level-label" className={`${LABEL_CLASS} m-0`}>
              Level
            </p>
            <div className="inline-flex flex-wrap gap-1 border-2 border-[var(--color-ink)] p-1">
              {PROFILE_LEVELS.map(({ value, label }) => {
                const isSelected = values.level === value;

                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setField("level", isSelected ? "" : value)}
                    className={`h-9 cursor-pointer border-2 px-4 font-[inherit] text-sm font-bold transition-colors ${
                      isSelected
                        ? "border-[var(--color-ink)] bg-[var(--color-brand)] text-[var(--color-ink)]"
                        : "border-transparent bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-surface-soft)]"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <TagField
              id="favoriteGenres"
              label="Favorite genres"
              tags={values.favoriteGenres}
              onChange={(tags) => setField("favoriteGenres", tags)}
              tagClassName="border-[var(--color-brand-deep)] bg-[var(--color-brand-tint)] text-[var(--color-brand-deep)]"
            />
            <TagField
              id="favoriteArtists"
              label="Favorite artists"
              tags={values.favoriteArtists}
              onChange={(tags) => setField("favoriteArtists", tags)}
              tagClassName="border-[var(--color-info-strong)] bg-[var(--color-info-tint)] text-[var(--color-info-strong)]"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--color-neutral-600)]">
            <input
              name="showPracticeStats"
              type="checkbox"
              checked={values.showPracticeStats}
              onChange={handleChange}
              className="size-5 cursor-pointer accent-[var(--color-brand)]"
            />
            Show practice statistics on my profile
          </label>
        </div>
      </FormCard>

      <FormError message={error} />

      <div className="flex flex-wrap items-center justify-between gap-3 border-2 border-[var(--color-ink)] bg-[var(--color-surface-soft)] px-5 py-3 max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-20 max-sm:gap-2 max-sm:border-x-0 max-sm:border-b-0 max-sm:bg-[var(--color-surface-card)] max-sm:px-4">
        <p className="m-0 flex items-center gap-2 text-sm font-semibold text-[var(--color-neutral-600)]">
          {isDirty && (
            <>
              <span aria-hidden="true" className="size-3 border border-[var(--color-ink)] bg-[var(--color-brand)]" />
              You have unsaved changes
            </>
          )}
        </p>
        <div className="flex gap-2 max-sm:w-full max-sm:[&>*]:flex-1 max-sm:[&>*]:justify-center">
          <Link to={ROUTES.PROFILE} className={SECONDARY_BUTTON_CLASS}>
            Cancel
          </Link>
          <button type="submit" disabled={isSubmitting || !isDirty} className={PRIMARY_BUTTON_CLASS}>
            <CheckSquare size={16} aria-hidden="true" />
            {isSubmitting ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </form>
  );
};

const EditProfileForm = () => {
  const navigate = useNavigate();
  const updateUser = useAuthStore((state) => state.updateUser);
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    getMe({ signal: controller.signal })
      .then(setUser)
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error.message);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const handleRetry = () => {
    setLoadError(null);
    setReloadKey((key) => key + 1);
  };

  const handleSaved = (savedUser) => {
    updateUser(savedUser);
    navigate(ROUTES.PROFILE);
  };

  const handlePhotoChange = (savedUser) => {
    setUser(savedUser);
    updateUser(savedUser);
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-start gap-3">
        <FormError message={loadError} />
        <button type="button" onClick={handleRetry} className={SECONDARY_BUTTON_CLASS}>
          Try again
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <p role="status" className="m-0 border-2 border-dashed border-[var(--color-ink)] bg-[var(--color-surface-card)] p-8 text-center text-sm font-semibold text-[var(--color-neutral-600)]">
        Loading profile...
      </p>
    );
  }

  return <EditProfileFields user={user} onSaved={handleSaved} onPhotoChange={handlePhotoChange} />;
};

export default EditProfileForm;
