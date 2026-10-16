"use client";

import { useEffect, useState } from "react";

const FB_SDK_ID = "facebook-jssdk";

export function useFacebookSdk() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

    if (!appId) {
      setError("Facebook login is not configured.");
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const handleReady = () => {
      setReady(true);
      setError("");
    };

    if (window.FB) {
      handleReady();
      return;
    }

    const previousInit = window.fbAsyncInit;

    window.fbAsyncInit = function fbAsyncInit() {
      if (typeof previousInit === "function") {
        previousInit();
      }

      window.FB.init({
        appId,
        cookie: true,
        xfbml: false,
        version: "v19.0",
      });

      handleReady();
    };

    if (!document.getElementById(FB_SDK_ID)) {
      const script = document.createElement("script");
      script.id = FB_SDK_ID;
      script.src = "https://connect.facebook.net/en_US/sdk.js";
      script.async = true;
      script.defer = true;
      script.crossOrigin = "anonymous";
      script.onerror = () => {
        setError("Failed to load Facebook. Check your connection or ad blocker.");
      };
      document.body.appendChild(script);
    }

    return () => {
      if (window.fbAsyncInit === fbAsyncInit) {
        window.fbAsyncInit = previousInit;
      }
    };
  }, []);

  return { ready, error };
}
