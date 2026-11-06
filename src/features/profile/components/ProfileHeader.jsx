import { Link } from "react-router-dom";
import defaultAvatar from "../../../assets/virtual-piano-assets/default-avatar.jpeg";
import { ROUTES } from "../../../config/routes";

const formatJoinedDate = (createdAt) =>
  new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const ProfileHeader = ({ user }) => (
  <header>
    <img src={user.avatarUrl || defaultAvatar} alt={`${user.username} avatar`} />
    <h1>{user.displayName || user.username}</h1>
    <p>@{user.username}</p>
    {user.createdAt && <p>Joined {formatJoinedDate(user.createdAt)}</p>}
    {user.bio && <p>{user.bio}</p>}
    <div>
      <button type="button">Edit profile</button>
      <button type="button" aria-label="Profile settings" />
      <Link to={ROUTES.UPLOAD}>Upload new sheet (+ MIDI)</Link>
    </div>
  </header>
);

export default ProfileHeader;
