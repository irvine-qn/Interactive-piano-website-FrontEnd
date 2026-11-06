const AccountSecurityPanel = ({ user, securityScore, deviceCount }) => (
  <aside aria-label="Account security">
    <header>
      <h2>Account security</h2>
      {securityScore !== undefined && <p>{securityScore}%</p>}
    </header>
    <div>
      <h3>Primary email</h3>
      <p>{user.email}</p>
      <p>{user.isVerified ? "Verified" : "Not verified"}</p>
    </div>
    <div>
      <h3>Two-factor authentication (2FA)</h3>
      <p>Protect your account with SMS or an app</p>
      <button type="button">Enable now</button>
    </div>
    <footer>
      <button type="button">Change password</button>
      <button type="button">
        Device log{deviceCount !== undefined && ` (${deviceCount})`}
      </button>
    </footer>
  </aside>
);

export default AccountSecurityPanel;
