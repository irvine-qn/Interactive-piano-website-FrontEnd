import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckSquare, Clock, LoaderCircle, LogIn, MailCheck, RotateCw, UserRound } from "lucide-react";
import { resendVerification, verifyEmail } from "../api/authApi";
import { ROUTES } from "../../../config/routes";
import { useAuthStore } from "../../../store/useAuthStore";
import { AuthStatus, FormError, primaryButtonClass } from "./AuthFormFields";

// Moi token chi duoc gui mot lan, ke ca khi effect chay lai
const requests = new Map();
const verifyOnce = (token) => {
  if (!requests.has(token)) requests.set(token, verifyEmail({ token }));
  return requests.get(token);
};

const textClass = "m-0 text-sm text-[var(--color-neutral-600)]";

const VerifyEmailStatus = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [result, setResult] = useState({ token: null, status: "loading" });
  const [resend, setResend] = useState({ status: "idle", error: "" });

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    verifyOnce(token)
      .then(() => {
        if (!active) return;
        setResult({ token, status: "verified" });
        const current = useAuthStore.getState().user;
        if (current) updateUser({ ...current, isVerified: true });
      })
      .catch(() => active && setResult({ token, status: "expired" }));
    return () => {
      active = false;
    };
  }, [token, updateUser]);

  const status = !token ? "expired" : result.token === token ? result.status : "loading";

  const handleResend = async () => {
    setResend({ status: "sending", error: "" });
    try {
      await resendVerification();
      setResend({ status: "sent", error: "" });
    } catch (err) {
      if (err?.code === "ALREADY_VERIFIED") setResult({ token, status: "verified" });
      else setResend({ status: "idle", error: err?.message || "Could not send the email. Please try again." });
    }
  };

  if (status === "loading") {
    return (
      <AuthStatus Icon={LoaderCircle} title="Verifying your email...">
        <p role="status" className={textClass}>This only takes a moment.</p>
      </AuthStatus>
    );
  }

  if (status === "verified") {
    return (
      <AuthStatus Icon={CheckSquare} tone="success" title="Email verified!">
        <p className={textClass}>You can now reset your password by email if you ever forget it.</p>
        <Link to={user ? ROUTES.PROFILE : ROUTES.LOGIN} className={`${primaryButtonClass} mt-2 w-full`}>
          {user ? <UserRound size={16} aria-hidden="true" /> : <LogIn size={16} aria-hidden="true" />}
          {user ? "Go to your profile" : "Log in"}
        </Link>
      </AuthStatus>
    );
  }

  if (resend.status === "sent") {
    return (
      <AuthStatus Icon={MailCheck} tone="success" title="Check your inbox">
        <p className={textClass}>We sent a new verification link to {user?.email ?? "your email"}.</p>
      </AuthStatus>
    );
  }

  return (
    <AuthStatus Icon={Clock} title="This link has expired">
      <p className={textClass}>Verification links work only once and expire after 24 hours.</p>
      <FormError message={resend.error} />
      {user ? (
        <button type="button" onClick={handleResend} disabled={resend.status === "sending"} className={`${primaryButtonClass} mt-2 w-full`}>
          <RotateCw size={16} aria-hidden="true" />
          {resend.status === "sending" ? "Sending..." : "Send a new link"}
        </button>
      ) : (
        <Link to={ROUTES.LOGIN} state={{ from: ROUTES.PROFILE }} className={`${primaryButtonClass} mt-2 w-full`}>
          <LogIn size={16} aria-hidden="true" />
          Log in to get a new link
        </Link>
      )}
    </AuthStatus>
  );
};

export default VerifyEmailStatus;
