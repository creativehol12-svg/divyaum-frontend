"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGoogleOAuth } from "@react-oauth/google";

import { persistAuthFromApiResponse } from "@/components/StoreProductCard/cartApi";
import { loginWithFacebook, loginWithGoogle } from "@/lib/authApi";
import {
  initGoogleSignInOnce,
  renderGoogleSignInButton,
  setGoogleCredentialHandler,
} from "@/lib/googleSignIn";
import { useFacebookSdk } from "./useFacebookSdk";
import styles from "./SocialLoginButtons.module.scss";
import cardStyles from "@/components/Card/Card.module.scss";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

const GOOGLE_ORIGIN_HINT =
  "In Google Cloud Console → Credentials → your Web client, add Authorized JavaScript origins: http://localhost:3000, http://localhost:3000, and http://127.0.0.1:3000 (use http://localhost:3000 when running npm run dev:https).";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6.2 7.1l6.2 5.2C39 36.7 44 31 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function SocialLoginButtons({ onClose }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loadingProvider, setLoadingProvider] = useState(null);
  const { ready: facebookReady, error: facebookSdkError } = useFacebookSdk();
  const { clientId, scriptLoadedSuccessfully } = useGoogleOAuth();
  const googleButtonHostRef = useRef(null);

  const isHttps =
    typeof window !== "undefined" && window.location?.protocol === "https:";

  const completeAuth = useCallback(
    (data) => {
      persistAuthFromApiResponse(data);
      window.dispatchEvent(new Event("userUpdated"));
      onClose?.();
      router.refresh();
    },
    [onClose, router],
  );

  const handleGoogleCredential = useCallback(
    async (credentialResponse) => {
      const credential = credentialResponse?.credential;

      if (!credential) {
        setError("Google sign-in was cancelled or did not return a token.");
        return;
      }

      setError("");
      setLoadingProvider("google");

      try {
        const data = await loginWithGoogle(credential);
        completeAuth(data);
      } catch (err) {
        const message = err?.message || "Google sign-in failed. Please try again.";
        setError(
          /origin|client|audience/i.test(message)
            ? `${message} ${GOOGLE_ORIGIN_HINT}`
            : message,
        );
      } finally {
        setLoadingProvider(null);
      }
    },
    [completeAuth],
  );

  useEffect(() => {
    setGoogleCredentialHandler(handleGoogleCredential);
    return () => {
      setGoogleCredentialHandler(null);
    };
  }, [handleGoogleCredential]);

  useEffect(() => {
    if (!scriptLoadedSuccessfully || !clientId || !googleButtonHostRef.current) {
      return;
    }

    const host = googleButtonHostRef.current;

    const setup = () => {
      if (!initGoogleSignInOnce(clientId)) {
        return;
      }
      renderGoogleSignInButton(host);
    };

    setup();

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (host.offsetWidth > 0) {
              renderGoogleSignInButton(host);
            }
          })
        : null;

    resizeObserver?.observe(host);

    return () => {
      resizeObserver?.disconnect();
      host.replaceChildren();
    };
  }, [scriptLoadedSuccessfully, clientId]);

  const handleFacebookClick = () => {
    if (!isHttps) {
      setError(
        "Facebook Login requires HTTPS. Run: npm run dev:https and open http://localhost:3000",
      );
      return;
    }

    if (facebookSdkError) {
      setError(facebookSdkError);
      return;
    }

    if (!facebookReady || !window.FB) {
      setError("Facebook is still loading. Please try again in a moment.");
      return;
    }

    setError("");
    setLoadingProvider("facebook");

    window.FB.login(
      (response) => {
        if (response.authResponse?.accessToken) {
          const accessToken = response.authResponse.accessToken;

          loginWithFacebook(accessToken)
            .then((data) => {
              completeAuth(data);
            })
            .catch((err) => {
              setError(
                err?.message ||
                  "Facebook sign-in failed. Please try again or use email login.",
              );
            })
            .finally(() => {
              setLoadingProvider(null);
            });
          return;
        }

        setLoadingProvider(null);

        if (response.status === "not_authorized") {
          setError("Facebook permission was denied. Email access is required.");
          return;
        }

        setError("Facebook sign-in was cancelled.");
      },
      { scope: "email,public_profile" },
    );
  };

  const googleLoading = loadingProvider === "google";
  const facebookLoading = loadingProvider === "facebook";

  const facebookDisabled =
    facebookLoading ||
    !process.env.NEXT_PUBLIC_FACEBOOK_APP_ID ||
    !facebookReady ||
    !isHttps;

  const showFacebookHttpsNote =
    !!process.env.NEXT_PUBLIC_FACEBOOK_APP_ID && !isHttps;

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className={styles.socialSection}>
        <p className={styles.error} role="alert">
          Google login is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID in
          .env.local
        </p>
      </div>
    );
  }

  return (
    <div className={styles.socialSection}>
      <div className={cardStyles.divider}>
        <span className={cardStyles.dividerLine} />
        <span className={cardStyles.dividerText}>or</span>
        <span className={cardStyles.dividerLine} />
      </div>

      <div className={styles.socialButtons}>
        <div
          className={`${styles.socialBtn} ${styles.googleBtnWrap} ${googleLoading ? styles.isLoading : ""}`}
          aria-busy={googleLoading ? "true" : "false"}
        >
          <span className={styles.socialBtnFace}>
            <GoogleIcon />
            <span>Continue with Google</span>
          </span>

          {googleLoading && (
            <span className={styles.loadingOverlay}>
              <span className={styles.spinner} aria-hidden="true" />
            </span>
          )}

          <div
            ref={googleButtonHostRef}
            className={styles.googleClickLayer}
            aria-label="Continue with Google"
            role="button"
            tabIndex={0}
          />
        </div>

        {/* <button
          type="button"
          className={`${styles.socialBtn} ${styles.facebookBtn}`}
          onClick={handleFacebookClick}
          disabled={facebookDisabled}
          aria-label="Continue with Facebook"
          aria-busy={facebookLoading ? "true" : "false"}
        >
          {facebookLoading ? (
            <span className={styles.spinner} aria-hidden="true" />
          ) : (
            <FacebookIcon />
          )}
          <span>{facebookLoading ? "Connecting…" : "Facebook"}</span>
        </button> */}
      </div>

      {/* {showFacebookHttpsNote && !error && (
        <p className={styles.note} role="note">
          Facebook requires HTTPS in development. Use{" "}
          <span className={styles.mono}>npm run dev:https</span>.
        </p>
      )} */}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!scriptLoadedSuccessfully && !error && (
        <p className={styles.note} role="status">
          Loading Google Sign-In…
        </p>
      )}
    </div>
  );
}
