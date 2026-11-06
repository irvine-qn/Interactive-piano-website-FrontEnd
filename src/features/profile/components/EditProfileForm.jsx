import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { getMe, updateProfile } from "../api/profileApi";

const toFormValues = (user) => ({
  displayName: user.displayName ?? "",
  city: user.city ?? "",
  country: user.country ?? "",
  instagram: user.instagram ?? "",
  bio: user.bio ?? "",
  level: user.level ?? "",
  favoriteGenres: (user.favoriteGenres ?? []).join(", "),
  favoriteArtists: (user.favoriteArtists ?? []).join(", "),
  showPracticeStats: user.showPracticeStats ?? true,
});

const splitList = (text) =>
  text
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const validate = (values) => {
  if (!values.displayName.trim()) return "Display name is required.";
  const instagram = values.instagram.trim();
  if (instagram && !INSTAGRAM_REGEX.test(instagram)) {
    return "Enter a valid Instagram username.";
  }
  for (const field of ["favoriteGenres", "favoriteArtists"]) {
    const items = splitList(values[field]);
    if (items.length > FAVORITES_MAX_ITEMS) {
      return `You can add at most ${FAVORITES_MAX_ITEMS} items in each list.`;
    }
    if (items.some((item) => item.length > FAVORITE_MAX_LENGTH)) {
      return `Each item must be at most ${FAVORITE_MAX_LENGTH} characters.`;
    }
  }
  return null;
};

const EditProfileFields = ({ user, onSaved }) => {
  const [values, setValues] = useState(() => toFormValues(user));
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = ({ target }) => {
    const value = target.type === "checkbox" ? target.checked : target.value;
    setValues((current) => ({ ...current, [target.name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate(values);
    setError(validationError);
    if (validationError) return;

    setIsSubmitting(true);
    try {
      onSaved(
        await updateProfile({
          ...values,
          favoriteGenres: splitList(values.favoriteGenres),
          favoriteArtists: splitList(values.favoriteArtists),
        }),
      );
    } catch (requestError) {
      setError(requestError.message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset>
        <legend>Basic information</legend>
        <div>
          <label htmlFor="displayName">Display name *</label>
          <input
            id="displayName"
            name="displayName"
            value={values.displayName}
            onChange={handleChange}
            maxLength={DISPLAY_NAME_MAX_LENGTH}
            required
          />
        </div>
        <div>
          <label htmlFor="username">Username</label>
          <input id="username" value={user.username} disabled />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" value={user.email} disabled />
          <span>{user.isVerified ? "Verified" : "Not verified"}</span>
        </div>
        <div>
          <label htmlFor="city">City</label>
          <input
            id="city"
            name="city"
            value={values.city}
            onChange={handleChange}
            maxLength={LOCATION_MAX_LENGTH}
          />
        </div>
        <div>
          <label htmlFor="country">Country</label>
          <input
            id="country"
            name="country"
            value={values.country}
            onChange={handleChange}
            maxLength={LOCATION_MAX_LENGTH}
          />
        </div>
        <div>
          <label htmlFor="instagram">Instagram</label>
          <input
            id="instagram"
            name="instagram"
            value={values.instagram}
            onChange={handleChange}
            maxLength={INSTAGRAM_MAX_LENGTH + 1}
            placeholder="@username"
          />
        </div>
        <div>
          <label htmlFor="bio">Bio</label>
          <textarea
            id="bio"
            name="bio"
            value={values.bio}
            onChange={handleChange}
            maxLength={BIO_MAX_LENGTH}
          />
          <span>
            {values.bio.length}/{BIO_MAX_LENGTH}
          </span>
        </div>
      </fieldset>

      <fieldset>
        <legend>Music profile</legend>
        <div>
          <label htmlFor="level">Level</label>
          <select id="level" name="level" value={values.level} onChange={handleChange}>
            <option value="">Not set</option>
            {PROFILE_LEVELS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="favoriteGenres">Favorite genres (comma separated)</label>
          <input
            id="favoriteGenres"
            name="favoriteGenres"
            value={values.favoriteGenres}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="favoriteArtists">Favorite artists (comma separated)</label>
          <input
            id="favoriteArtists"
            name="favoriteArtists"
            value={values.favoriteArtists}
            onChange={handleChange}
          />
        </div>
        <div>
          <input
            id="showPracticeStats"
            name="showPracticeStats"
            type="checkbox"
            checked={values.showPracticeStats}
            onChange={handleChange}
          />
          <label htmlFor="showPracticeStats">Show practice statistics on my profile</label>
        </div>
      </fieldset>

      {error && <p role="alert">{error}</p>}
      <Link to={ROUTES.PROFILE}>Cancel</Link>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save changes"}
      </button>
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

  if (loadError) {
    return (
      <div role="alert">
        <p>{loadError}</p>
        <button type="button" onClick={handleRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (!user) return <p role="status">Loading profile...</p>;

  return <EditProfileFields user={user} onSaved={handleSaved} />;
};

export default EditProfileForm;
