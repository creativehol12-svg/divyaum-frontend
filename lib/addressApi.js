const BASE_URL=process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
const ADD_ADDRESS_URL = `${BASE_URL}/api/address/add`;
const UPDATE_ADDRESS_URL = `${BASE_URL}/api/address/update`;
const DELETE_ADDRESS_URL = `${BASE_URL}/api/address/delete`;
const LIST_ADDRESSES_BASE = `${BASE_URL}/api/address`;

/**
 * Maps address API document to the card shape used in the UI.
 */
export function mapApiAddressToCard(api) {
  if (!api) return null;
  const Line1 = api.Line1 ?? "";
  const Line2 = api.Line2 ?? "";
  const city = api.city ?? "";
  const parts = [Line1, Line2, city].filter(Boolean);
  const address = parts.length ? parts.join(", ") : Line1;
  return {
    id: api._id || api.id,
    address,
    pincode: String(api.Pincode ?? api.pincode ?? ""),
    state: api.state ?? "",
    country: api.country ?? "",
  };
}

/**
 * GET /api/address/:userId — returns `{ total, addresses: [...] }`.
 *
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.token Bearer token
 * @returns {Promise<{ total: number, addresses: ReturnType<typeof mapApiAddressToCard>[] }>}
 */
export async function fetchCustomerAddresses(params) {
  const { userId, token } = params;
  if (!userId || !token) {
    throw new Error("Please sign in again to load your addresses.");
  }

  const url = `${LIST_ADDRESSES_BASE}/${encodeURIComponent(userId)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const msg =
      (payload && (payload.message || payload.error)) ||
      `Could not load addresses (${response.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  const rawList = Array.isArray(payload?.addresses) ? payload.addresses : [];
  const addresses = rawList.map(mapApiAddressToCard).filter(Boolean);
  const total =
    typeof payload?.total === "number" && Number.isFinite(payload.total)
      ? payload.total
      : addresses.length;

  return { total, addresses };
}

/**
 * @param {object} params
 * @param {string} params.userId
 * @param {string} params.token Bearer token
 * @param {string} params.Line1
 * @param {string} [params.Line2]
 * @param {string} params.city
 * @param {string} params.state
 * @param {string} params.country
 * @param {string} params.Pincode
 * @returns {Promise<ReturnType<typeof mapApiAddressToCard>>}
 */
export async function addCustomerAddress(params) {
  const { userId, token, Line1, Line2 = "", city, state, country, Pincode } = params;
  if (!userId || !token) {
    throw new Error("Please sign in again to save your address.");
  }

  const response = await fetch(ADD_ADDRESS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      Line1,
      Line2,
      city,
      state,
      country,
      Pincode,
    }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const msg =
      (payload && (payload.message || payload.error)) ||
      `Could not save address (${response.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return mapApiAddressToCard(payload);
}

/**
 * @param {object} params
 * @param {string} params.token Bearer token
 * @param {string} params.addressId Mongo _id of the address
 * @param {string} params.Line1
 * @param {string} [params.Line2]
 * @param {string} params.city
 * @param {string} params.state
 * @param {string} params.country
 * @param {string} params.Pincode
 * @returns {Promise<ReturnType<typeof mapApiAddressToCard>>}
 */
export async function updateCustomerAddress(params) {
  const { token, addressId, Line1, Line2 = "", city, state, country, Pincode } = params;
  if (!token || !addressId) {
    throw new Error("Please sign in again to update your address.");
  }

  const response = await fetch(UPDATE_ADDRESS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      addressId,
      Line1,
      Line2,
      city,
      state,
      country,
      Pincode,
    }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const msg =
      (payload && (payload.message || payload.error)) ||
      `Could not update address (${response.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return mapApiAddressToCard(payload);
}

/**
 * @param {object} params
 * @param {string} params.token Bearer token
 * @param {string} params.addressId Mongo _id of the address
 * @returns {Promise<{ message?: string, addressId?: string }>}
 */
export async function deleteCustomerAddress(params) {
  const { token, addressId } = params;
  if (!token || !addressId) {
    throw new Error("Please sign in again to remove your address.");
  }

  const response = await fetch(DELETE_ADDRESS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ addressId }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const msg =
      (payload && (payload.message || payload.error)) ||
      `Could not delete address (${response.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return payload ?? { addressId };
}
