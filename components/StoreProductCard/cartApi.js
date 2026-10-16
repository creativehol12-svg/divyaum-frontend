import { getApiBaseUrl } from "@/lib/productsApi";

const CART_UPDATED_EVENT = "divyaum-cart-updated";
const GUEST_CART_STORAGE_KEY = "divyaum:cart-items";

/** @typedef {{ productId: string, quantity: number }} GuestCartStorageLine */

/** In-memory cart lines (guest localStorage or server snapshot). */
let clientCartSnapshot = [];

export function clearLegacyCartLocalStorage() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Logged in = has auth token. Guest cart uses localStorage only. */
export function isCartLoggedIn() {
  return Boolean(getStoredToken());
}

export function persistAuthFromApiResponse(data) {
  if (!data || typeof window === "undefined") {
    return;
  }

  if (data.token) {
    window.localStorage.setItem("token", data.token);
  }

  const user = data.user ?? data;
  if (user && typeof user === "object") {
    window.localStorage.setItem("user", JSON.stringify(user));
    const id = user._id || user.id;
    if (id) {
      window.localStorage.setItem("userId", String(id));
    }
  } else {
    const id = data._id || data.id || data.userId;
    if (id) {
      window.localStorage.setItem("userId", String(id));
    }
  }
}

function toGuestStorageEntry(entry) {
  const productId = String(entry?.productId || entry?.slug || "").trim();
  if (!productId) return null;

  const quantity = resolveLineQuantity(entry);
  if (quantity <= 0) return null;

  return { productId, quantity };
}

/** @returns {GuestCartStorageLine[]} */
function readGuestCartFromStorage() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(toGuestStorageEntry)
      .filter(Boolean);
  } catch {
    return [];
  }
}

/** @param {GuestCartStorageLine[]} lines */
function writeGuestCartToStorage(lines) {
  if (typeof window === "undefined" || isCartLoggedIn()) {
    return;
  }
  try {
    const stored = (Array.isArray(lines) ? lines : [])
      .map(toGuestStorageEntry)
      .filter(Boolean);
    window.localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // ignore
  }
}

function applyGuestStorageToSnapshot() {
  const stored = readGuestCartFromStorage();
  setClientCartSnapshot(stored);
  return stored;
}

export function setClientCartSnapshot(items) {
  const next = Array.isArray(items) ? items.map((i) => ({ ...i })) : [];
  const wasEmpty = clientCartSnapshot.length === 0;
  const nowEmpty = next.length === 0;
  clientCartSnapshot = next;
  if (typeof window === "undefined") {
    return;
  }
  if (wasEmpty && nowEmpty) {
    return;
  }
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

/** Drop in-memory lines and guest storage (e.g. after successful order). */
export function clearCartClientState() {
  clearLegacyCartLocalStorage();
  setClientCartSnapshot([]);
}

/** After logout: persist only productId + quantity for guest cart. */
export function resetCartAfterLogout() {
  if (typeof window === "undefined") {
    return;
  }
  const stored = getClientCartSnapshot()
    .map(toGuestStorageEntry)
    .filter(Boolean);
  writeGuestCartToStorage(stored);
  applyGuestStorageToSnapshot();
}

export function getClientCartSnapshot() {
  return clientCartSnapshot.map((i) => ({ ...i }));
}

export function getStoredUserId() {
  if (typeof window === "undefined") {
    return "";
  }

  const storedUser = window.localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsed = JSON.parse(storedUser);
      return (
        parsed?._id ||
        parsed?.id ||
        parsed?.user?._id ||
        parsed?.user?.id ||
        ""
      );
    } catch {
      // Ignore malformed user payloads and fall back to userId.
    }
  }

  return window.localStorage.getItem("userId") || "";
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("token") || "";
}

let resolveUserIdPromise = null;

/** Ensures userId is available for cart API after login (token-only save). */
export async function ensureCartUserId() {
  if (!isCartLoggedIn()) {
    return "";
  }

  const existing = getStoredUserId();
  if (existing) {
    return existing;
  }

  if (!resolveUserIdPromise) {
    resolveUserIdPromise = (async () => {
      const baseUrl = getApiBaseUrl();
      const response = await fetch(`${baseUrl}/api/user-details`, {
        headers: { Authorization: `Bearer ${getStoredToken()}` },
      });

      if (!response.ok) {
        return "";
      }

      const data = await response.json();
      persistAuthFromApiResponse(data?.user ? data : { user: data, token: getStoredToken() });
      return getStoredUserId();
    })().finally(() => {
      resolveUserIdPromise = null;
    });
  }

  return resolveUserIdPromise;
}

function resolveLineQuantity(entry) {
  const raw = entry?.qty ?? entry?.quantity;
  if (raw === undefined || raw === null) {
    return 1;
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return 1;
  }
  return Math.max(0, Math.min(99, n));
}

function normalizeCartProduct(entry) {
  const product = entry?.productId || {};
  const quantity = resolveLineQuantity(entry);

  return {
    productId: product?._id || product?.id || entry?.productId || "",
    slug: product?.slug || product?._id || product?.id || entry?.slug || "",
    name: product?.name || entry?.name || "Product",
    image: product?.image || entry?.image || "",
    price: Number(product?.discountPrice ?? product?.price ?? entry?.price ?? 0) || 0,
    oldPrice:
      Number(
        product?.mrp ??
          product?.oldPrice ??
          product?.discountPrice ??
          product?.price ??
          entry?.oldPrice ??
          entry?.price ??
          0,
      ) || 0,
    shippingCharge:
      Number(product?.shippingCharge ?? entry?.shippingCharge ?? 0) || 0,
    weight: product?.weight || product?.packSize || entry?.weight || "",
    description:
      product?.shortDescription || product?.description || entry?.description || "",
    note:
      product?.shortDescription ||
      product?.description ||
      entry?.note ||
      entry?.description ||
      "",
    quantity,
  };
}

export function cartLineMatchesProductId(cartItem, productId) {
  if (!productId || !cartItem) return false;
  const pid = String(productId);
  return (
    String(cartItem.productId ?? "") === pid ||
    String(cartItem.slug ?? "") === pid
  );
}

export function getCartQuantityForProductId(productId) {
  if (!productId) return 0;
  const line = clientCartSnapshot.find((c) => cartLineMatchesProductId(c, productId));
  if (!line) return 0;
  const q = Number(line.quantity ?? 1);
  return Number.isFinite(q) && q > 0 ? Math.min(99, q) : 0;
}

export function loadGuestCartIntoSnapshot() {
  return applyGuestStorageToSnapshot();
}

async function fetchStoreProductById(productId) {
  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/products/${productId}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Product fetch failed (${response.status})`);
  }
  return response.json();
}

async function enrichGuestCartLines(storedLines) {
  if (!storedLines.length) return [];

  return Promise.all(
    storedLines.map(async ({ productId, quantity }) => {
      try {
        const product = await fetchStoreProductById(productId);
        return normalizeCartProduct({ productId: product, quantity });
      } catch {
        return {
          productId,
          slug: productId,
          name: "Product",
          image: "",
          price: 0,
          oldPrice: 0,
          shippingCharge: 0,
          weight: "",
          description: "",
          note: "",
          quantity,
        };
      }
    }),
  );
}

/** Guest cart UI: fetch product details; localStorage stays productId + quantity only. */
export async function enrichGuestCartForDisplay() {
  if (isCartLoggedIn()) {
    return getClientCartSnapshot();
  }

  const stored = readGuestCartFromStorage();
  if (!stored.length) {
    setClientCartSnapshot([]);
    return [];
  }

  const enriched = await enrichGuestCartLines(stored);
  setClientCartSnapshot(enriched);
  return enriched;
}

export function upsertLocalCartItem(cartItem) {
  if (isCartLoggedIn()) {
    return;
  }

  const productId = String(cartItem?.productId || cartItem?.slug || "").trim();
  if (!productId) return;

  const addQty = resolveLineQuantity(cartItem);
  const stored = readGuestCartFromStorage();
  const index = stored.findIndex((line) => line.productId === productId);

  if (index >= 0) {
    stored[index].quantity = Math.min(99, stored[index].quantity + addQty);
  } else {
    stored.push({ productId, quantity: addQty });
  }

  writeGuestCartToStorage(stored);
  applyGuestStorageToSnapshot();
}

export function setLocalCartLineQuantity(productId, qty) {
  if (isCartLoggedIn()) {
    return;
  }

  const pid = String(productId || "").trim();
  if (!pid) return;

  const stored = readGuestCartFromStorage();
  const nextQty = Math.max(0, Math.min(99, Number(qty) || 0));
  const index = stored.findIndex((line) => line.productId === pid);

  if (nextQty <= 0) {
    if (index >= 0) stored.splice(index, 1);
  } else if (index >= 0) {
    stored[index].quantity = nextQty;
  } else {
    stored.push({ productId: pid, quantity: nextQty });
  }

  writeGuestCartToStorage(stored);
  applyGuestStorageToSnapshot();
}

async function fetchCartPayloadFromApi(userId, token = getStoredToken()) {
  if (!userId || !token) {
    throw new Error("Missing cart authentication");
  }

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/cart/${userId}`, {
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
    throw new Error(payload?.message || `Cart fetch failed with status ${response.status}`);
  }

  return payload;
}

function extractProducts(payload) {
  const products = Array.isArray(payload?.products)
    ? payload.products
    : Array.isArray(payload?.data?.products)
      ? payload.data.products
      : Array.isArray(payload)
        ? payload
        : [];

  return products
    .map(normalizeCartProduct)
    .filter((item) => item.quantity > 0)
    .filter((item) => item.productId || item.slug || item.name);
}

/**
 * Single cart fetch snapshot.
 * @returns {Promise<{ cartId: string, items: ReturnType<typeof normalizeCartProduct>[] }>}
 */
export async function fetchCartSnapshotFromApi(
  userId = "",
  token = getStoredToken(),
) {
  const resolvedUserId = userId || (await ensureCartUserId());
  const payload = await fetchCartPayloadFromApi(resolvedUserId, token);
  return {
    cartId: resolveCartId(payload),
    items: extractProducts(payload),
  };
}

export async function fetchCartItemsFromApi(userId, token = getStoredToken()) {
  const snapshot = await fetchCartSnapshotFromApi(userId, token);
  return snapshot.items;
}

function resolveCartId(payload) {
  const candidates = [
    payload?._id,
    payload?.id,
    payload?.cartId,
    payload?.data?._id,
    payload?.data?.id,
    payload?.data?.cartId,
    payload?.cart?._id,
    payload?.cart?.id,
    payload?.cart?.cartId,
  ];
  const found = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
  return found ? String(found) : "";
}

/**
 * Fetches the server cart id (needed for order create).
 * Uses the same `/api/cart/:userId` endpoint and extracts `_id` / `cartId` from the payload.
 */
export async function fetchCartIdFromApi(userId, token = getStoredToken()) {
  const { cartId } = await fetchCartSnapshotFromApi(userId, token);
  if (!cartId) {
    throw new Error("Could not find cart id from server response.");
  }
  return cartId;
}

export async function addCartItemToApi(item) {
  const token = item?.token || getStoredToken();
  const userId = item?.userId || (await ensureCartUserId());
  const productId = item?.productId || item?.slug || "";

  if (!token || !productId) {
    throw new Error("Missing cart authentication or product id");
  }

  if (!userId) {
    throw new Error("Missing user id for cart API");
  }

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}/api/cart/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      productId,
      qty: resolveLineQuantity(item),
    }),
  });

  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Cart add failed with status ${response.status}`);
  }

  return payload;
}

async function syncGuestCartToServer() {
  const guestItems = readGuestCartFromStorage();
  if (!guestItems.length || !isCartLoggedIn()) {
    return;
  }

  for (const item of guestItems) {
    const productId = item?.productId;
    if (!productId) continue;
    try {
      await addCartItemToApi({
        productId,
        qty: resolveLineQuantity(item),
      });
    } catch (err) {
      console.warn("Guest cart sync item failed:", err?.message);
    }
  }

  clearLegacyCartLocalStorage();
}

export async function addOrUpdateCartItem(cartItem) {
  if (!cartItem) return;

  if (isCartLoggedIn()) {
    await addCartItemToApi({
      ...cartItem,
      qty: cartItem.quantity ?? 1,
    });
    await hydrateCartFromServerIfLoggedIn();
    return;
  }

  upsertLocalCartItem(cartItem);
}

export async function updateCartLineQuantity(cartItem, qty) {
  if (!cartItem) return;

  const productId = cartItem?.productId || cartItem?.slug;
  if (!productId) return;

  if (isCartLoggedIn()) {
    await addCartItemToApi({ productId, qty });
    await hydrateCartFromServerIfLoggedIn();
    return;
  }

  setLocalCartLineQuantity(productId, qty);
}

let hydrateCartPromise = null;

export function hydrateCartFromServerIfLoggedIn() {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  const token = getStoredToken();

  if (!token) {
    loadGuestCartIntoSnapshot();
    return Promise.resolve(false);
  }

  if (!hydrateCartPromise) {
    hydrateCartPromise = (async () => {
      const userId = await ensureCartUserId();
      if (!userId) {
        throw new Error("Could not resolve user id for cart");
      }

      await syncGuestCartToServer();
      const items = await fetchCartItemsFromApi(userId, token);
      setClientCartSnapshot(items);
      return true;
    })()
      .catch((err) => {
        console.warn("Cart hydrate failed:", err?.message);
        loadGuestCartIntoSnapshot();
        return false;
      })
      .finally(() => {
        hydrateCartPromise = null;
      });
  }

  return hydrateCartPromise;
}
