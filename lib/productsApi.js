export function getApiBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:4000"
  );
}

export function normalizeStoreProduct(product, fallbackCategoryName = "") {
  const id = product?._id || product?.id || "";
  const categoryIds = Array.isArray(product?.categoryIds) ? product.categoryIds : [];
  const categoryName =
    categoryIds[0]?.name || fallbackCategoryName || "";

  const averageRating = Number(product?.averageRating ?? product?.rating);
  const totalRatings = product?.totalRatings ?? product?.reviews ?? 0;

  return {
    id,
    _id: id,
    slug: product?.slug || "",
    name: product?.name || "",
    image: product?.image || product?.mainImage || "",
    price: product?.discountPrice ?? product?.price ?? "",
    oldPrice: product?.mrp ?? product?.oldPrice ?? "",
    description: product?.shortDescription || product?.description || "",
    weight: product?.weight || product?.packSize || "",
    rating: Number.isFinite(averageRating) && averageRating > 0 ? averageRating : null,
    reviews: totalRatings,
    offerLabel: product?.offerLabel || "",
    categoryName,
    isAvailable: product?.isAvailable !== false,
  };
}

/**
 * @returns {Promise<{ products: ReturnType<typeof normalizeStoreProduct>[], error: string | null }>}
 */
export async function fetchFeaturedProducts() {
  try {
    const baseUrl = getApiBaseUrl();
    const response = await fetch(`${baseUrl}/api/products?isFeatured=true`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        products: [],
        error: `Unable to load featured products (${response.status})`,
      };
    }

    const json = await response.json();
    const raw = Array.isArray(json) ? json : json?.data ?? json?.products ?? [];
    const products = raw
      .filter((item) => item?.isAvailable !== false)
      .map((item) => normalizeStoreProduct(item));

    return { products, error: null };
  } catch (err) {
    console.error("Featured products fetch error:", err);
    return {
      products: [],
      error: "Something went wrong while loading products. Please try again.",
    };
  }
}
