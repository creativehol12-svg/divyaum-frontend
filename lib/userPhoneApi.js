import { getApiBaseUrl } from "@/lib/authApi";
import { persistAuthFromApiResponse } from "@/components/StoreProductCard/cartApi";

function normalizePhoneValue(value) {
  return String(value || "").replace(/\D/g, "").trim();
}

export function hasPhoneNumber(user) {
  const phone = normalizePhoneValue(user?.phoneNumber);
  return phone.length >= 10;
}

export async function fetchUserDetails(token) {
  const res = await fetch(`${getApiBaseUrl()}/api/user-details`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || "Could not load your profile.");
  }

  return data;
}

/**
 * Returns true if the authenticated user already has a phone number on file.
 * Syncs localStorage when details are fetched from the API.
 */
export async function userHasPhoneOnFile(token) {
  if (!token) return false;

  try {
    const details = await fetchUserDetails(token);
    if (details) {
      persistAuthFromApiResponse({
        user: details,
        token,
      });
    }
    return hasPhoneNumber(details);
  } catch {
    try {
      const raw = window.localStorage.getItem("user");
      const local = raw ? JSON.parse(raw) : null;
      return hasPhoneNumber(local);
    } catch {
      return false;
    }
  }
}

export async function saveUserPhone({ token, phoneNumber, countryCode }) {
  if (!token) {
    throw new Error("Please sign in again.");
  }

  let res;
  try {
    res = await fetch(`${getApiBaseUrl()}/api/user/phone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ phoneNumber, countryCode }),
    });
  } catch {
    throw new Error(
      "Could not reach the server. Check that the backend is running.",
    );
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error(
        "Phone save endpoint not found. Restart the backend so the new route is loaded.",
      );
    }
    if (res.status === 401) {
      throw new Error(
        data?.message || "Please sign in again to save your phone number.",
      );
    }
    throw new Error(data?.message || "Could not save phone number.");
  }

  if (data?.user) {
    persistAuthFromApiResponse({ user: data.user, token });
  }

  return data;
}

export function splitPhoneInput(mobile) {
  const digits = normalizePhoneValue(mobile);
  if (digits.length < 10) {
    return { phoneNumber: "", countryCode: "" };
  }
  return {
    phoneNumber: digits.slice(-10),
    countryCode: digits.slice(0, digits.length - 10) || "91",
  };
}
