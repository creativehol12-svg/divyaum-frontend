const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000";
const CREATE_ORDER_URL = `${BASE_URL}/api/order/create`;
const LIST_ORDER_URL = `${BASE_URL}/api/order/list`;

/**
 * @param {object} params
 * @param {string} params.token Bearer token
 * @param {string} params.orderId Order document id
 * @returns {Promise<any>}
 */
export async function fetchCustomerOrderDetail(params) {
  const { token, orderId } = params;
  if (!token) {
    throw new Error("Please sign in again to view this order.");
  }
  if (!orderId) {
    throw new Error("Missing order id.");
  }

  const url = `${BASE_URL}/api/order/${encodeURIComponent(String(orderId))}`;
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
      `Could not load order (${response.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return payload;
}

/**
 * @param {object} params
 * @param {string} params.token Bearer token
 * @param {string} params.cartId
 * @param {string} params.addressId
 * @param {number} params.shippingCharges
 * @returns {Promise<any>}
 */
export async function createCustomerOrder(params) {
  const { token, cartId, addressId, shippingCharges } = params;
  if (!token) {
    throw new Error("Please sign in again to confirm your order.");
  }
  if (!cartId) {
    throw new Error("Missing cart id. Please refresh and try again.");
  }
  if (!addressId) {
    throw new Error("Please select a delivery address.");
  }

  const response = await fetch(CREATE_ORDER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      cartId,
      addressId,
      shippingCharges: Number(shippingCharges ?? 0) || 0,
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
      `Could not create order (${response.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return payload;
}

function normalizeOrderListPayload(payload) {
  if (!payload || typeof payload !== "object") {
    return { total: 0, orders: [] };
  }
  const orders = Array.isArray(payload.orders)
    ? payload.orders
    : Array.isArray(payload.data?.orders)
      ? payload.data.orders
      : [];
  const total =
    typeof payload.total === "number"
      ? payload.total
      : typeof payload.data?.total === "number"
        ? payload.data.total
        : orders.length;
  return { total, orders };
}

/**
 * @param {object} params
 * @param {string} params.token Bearer token
 * @param {string} params.userId
 * @returns {Promise<{ total: number, orders: any[] }>}
 */
export async function fetchCustomerOrders(params) {
  const { token, userId } = params;
  if (!token || !userId) {
    throw new Error("Please sign in again to view your orders.");
  }

  const response = await fetch(`${LIST_ORDER_URL}?userId=${encodeURIComponent(userId)}`, {
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
      `Could not load orders (${response.status})`;
    throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
  }

  return normalizeOrderListPayload(payload);
}

function resolveOrderLineQuantity(entry) {
  const raw = entry?.qty ?? entry?.quantity;
  if (raw === undefined || raw === null) {
    return 1;
  }
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return 1;
  }
  return Math.max(1, Math.min(99, Math.floor(n)));
}

/**
 * Maps API order line items to a stable UI shape (image, name, qty, prices).
 * @param {any} order
 * @returns {Array<{ key: string, name: string, description: string, image: string, quantity: number, unitPrice: number, lineTotal: number }>}
 */
export function normalizeOrderLines(order) {
  const lines = Array.isArray(order?.products) ? order.products : [];
  return lines.map((entry, idx) => {
    const product = entry?.productId || {};
    const quantity = resolveOrderLineQuantity(entry);
    const unitPrice =
      Number(
        entry?.discountPrice ??
          product?.discountPrice ??
          product?.price ??
          entry?.unitPrice ??
          entry?.price ??
          0,
      ) || 0;
    const lineTotalRaw = Number(
      entry?.lineTotal ?? entry?.total ?? entry?.amount ?? unitPrice * quantity,
    );
    const lineTotal = Number.isFinite(lineTotalRaw) ? lineTotalRaw : unitPrice * quantity;

    return {
      key: String(product?._id || product?.id || `line-${idx}`),
      name: product?.name || "Product",
      description: String(product?.shortDescription || product?.description || "").trim(),
      image: product?.image || "/icon/logo-removebg-preview.png",
      quantity,
      unitPrice,
      lineTotal,
    };
  });
}

/**
 * Loads the user's orders and returns the one matching `orderId` (list API).
 * @param {object} params
 * @param {string} params.token
 * @param {string} params.userId
 * @param {string} params.orderId
 * @returns {Promise<any>}
 */
export async function fetchCustomerOrderForUser(params) {
  const { token, userId, orderId } = params;
  if (!orderId) {
    throw new Error("Missing order id.");
  }
  const { orders } = await fetchCustomerOrders({ token, userId });
  const found = orders.find((o) => String(o?._id) === String(orderId));
  if (!found) {
    throw new Error("Order not found.");
  }
  return found;
}

