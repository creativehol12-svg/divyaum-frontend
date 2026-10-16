export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    "http://localhost:4000"
  );
}

async function parseAuthResponse(res) {
  let data = null;

  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.message ||
      (res.status === 401
        ? "Your session has expired. Please sign in again."
        : "Authentication failed. Please try again.");
    throw new Error(message);
  }

  return data;
}

export async function loginWithGoogle(credential) {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken: credential }),
  });

  return parseAuthResponse(res);
}

export async function loginWithFacebook(accessToken) {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/facebook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ accessToken }),
  });

  return parseAuthResponse(res);
}

export async function logoutFromApi() {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  return parseAuthResponse(res);
}
