/**
 * Ensures google.accounts.id.initialize() runs only once app-wide.
 * Multiple <GoogleLogin /> mounts (modal open/close, Strict Mode) cause GSI errors otherwise.
 */

let initializedClientId = null;

/** @type {((response: { credential?: string }) => void) | null} */
let activeCredentialHandler = null;

export function setGoogleCredentialHandler(handler) {
  activeCredentialHandler = handler;
}

export function initGoogleSignInOnce(clientId) {
  if (!clientId || typeof window === "undefined") {
    return false;
  }

  const gsi = window.google?.accounts?.id;
  if (!gsi) {
    return false;
  }

  if (initializedClientId === clientId) {
    return true;
  }

  gsi.initialize({
    client_id: clientId,
    callback: (credentialResponse) => {
      activeCredentialHandler?.(credentialResponse);
    },
    auto_select: false,
    cancel_on_tap_outside: true,
  });

  initializedClientId = clientId;
  return true;
}

export function renderGoogleSignInButton(container, options = {}) {
  const gsi = window.google?.accounts?.id;
  if (!gsi || !container) {
    return;
  }

  container.replaceChildren();
  gsi.renderButton(container, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "signin_with",
    shape: "rectangular",
    width: container.offsetWidth > 0 ? container.offsetWidth : 280,
    ...options,
  });
}
