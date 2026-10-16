function slugify(value) {
  return String(value || "product")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatPriceString(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/,/g, "").trim();
}

function getOfferLabel(price, oldPrice) {
  const current = Number(formatPriceString(price));
  const original = Number(formatPriceString(oldPrice));

  if (!Number.isFinite(current) || !Number.isFinite(original) || original <= current) return "";

  const discount = Math.round(((original - current) / original) * 100);
  if (!Number.isFinite(discount) || discount <= 0) return "";

  return `${discount}% OFF`;
}

function buildHighlights(product, categoryName) {
  const highlights = [];

  if (product?.weight) highlights.push(`${product.weight} pack size`);
  if (categoryName) highlights.push(`Ideal for ${categoryName.toLowerCase()} rituals`);
  highlights.push("Packed for freshness and purity");

  return highlights;
}

function mapProduct(product, category) {
  const categoryId = category?.id || category?.slug || category?._id || "store";
  const categoryName = category?.name || "Divya Store";
  const id = product?._id || product?.id || "";
  const slug =
    product?.slug ||
    (id ? `${categoryId}-${id}` : `${categoryId}-${slugify(product?.name)}`);

  const price = formatPriceString(product?.price);
  const oldPrice = formatPriceString(product?.oldPrice || product?.comparePrice || "");
  const offerLabel = product?.offerLabel || getOfferLabel(price, oldPrice);

  return {
    id,
    slug,
    name: product?.name ?? "Product",
    image: product?.mainImage || product?.image || "",
    weight: product?.weight || product?.packSize || product?.size || "",
    price,
    oldPrice,
    offerLabel,
    rating: Number(product?.rating ?? 4.2),
    reviews: product?.reviews || "1,245",
    description:
      product?.description ||
      `${product?.name || "This product"} is curated by Divyaum to support your spiritual routine with quality and authenticity.`,
    categoryId,
    categoryName,
    highlights: buildHighlights(product, categoryName),
  };
}

function normalizeStoreCategories(categories) {
  return (Array.isArray(categories) ? categories : []).map((category) => ({
    ...category,
    id: category?.id || category?.slug || slugify(category?.name),
    products: (Array.isArray(category?.products) ? category.products : []).map((product) =>
      mapProduct(product, category),
    ),
  }));
}

export function flattenStoreProducts(storeCategories) {
  return normalizeStoreCategories(storeCategories).flatMap((category) =>
    (category.products ?? []).map((product) => ({
      ...product,
      __categoryId: category.id,
      __categoryName: category.name,
    })),
  );
}

export function findStoreProductBySlug(storeCategories, slug) {
  const products = flattenStoreProducts(storeCategories);
  return products.find((product) => product.slug === slug) || null;
}

export async function fetchProductCategories() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:4000";
    const response = await fetch(`${baseUrl}/api/v1/product/categories`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const json = await response.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch (error) {
    console.warn("Failed to fetch product categories:", error?.message);
    return [];
  }
}

export async function fetchProducts() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:4000";
    const response = await fetch(`${baseUrl}/api/v1/product`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const json = await response.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch (error) {
    console.warn("Failed to fetch products:", error?.message);
    return [];
  }
}

export function buildStoreCategoriesFromApi({ apiCategories, apiProducts }) {
  const categories = Array.isArray(apiCategories) ? apiCategories : [];
  const products = Array.isArray(apiProducts) ? apiProducts : [];

  const productsBySlug = new Map();
  for (const product of products) {
    const slug = product?.categoryId?.slug;
    const categoryName = product?.categoryId?.name;
    if (!slug) continue;
    if (!productsBySlug.has(slug)) {
      productsBySlug.set(slug, { name: categoryName || slug, products: [] });
    }
    productsBySlug.get(slug).products.push(product);
  }

  const built = categories.map((cat) => ({
    id: cat?.slug ?? cat?._id ?? "",
    name: cat?.name ?? "Category",
    subtitle: cat?.description ?? "",
    products: (productsBySlug.get(cat?.slug)?.products ?? []).map((product) =>
      mapProduct(product, {
        id: cat?.slug ?? cat?._id ?? "",
        name: cat?.name ?? "Category",
      }),
    ),
  }));

  const knownIds = new Set(built.map((c) => c.id));
  for (const [slug, info] of productsBySlug.entries()) {
    if (knownIds.has(slug)) continue;
    built.push({
      id: slug,
      name: info.name,
      subtitle: "",
      products: info.products.map((product) => mapProduct(product, { id: slug, name: info.name })),
    });
  }

  return normalizeStoreCategories(built).filter((category) => category.id);
}

export async function getStoreCategoriesToRender() {
  try {
    const [apiCategories, apiProducts] = await Promise.all([
      fetchProductCategories(),
      fetchProducts(),
    ]);
    return buildStoreCategoriesFromApi({ apiCategories, apiProducts });
  } catch (error) {
    console.warn("Failed to fetch store data:", error?.message);
    return [];
  }
}
