"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();

export default function Providers({ children }) {
  if (!googleClientId) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing — Google Sign-In disabled",
      );
    }
    return children;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
}
