import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import DivyaStoreCatalog from "@/components/DivyaStoreCatalog/DivyaStoreCatalog";
import PageHeroBanner from "@/components/PageHeroBanner/PageHeroBanner";
import { getStoreCategoriesToRender } from "./store-data";
import styles from "./page.module.scss";
import {
  fetchPageBanners,
  getBannerImage,
  getBannerLink,
} from "@/lib/bannersApi";

export const metadata = {
  title: "Divya Store | Divyaum",
  description: "Shop authentic pooja essentials including havan samagri, kapoor, dhoop, rudraksha, and more.",
};

export const dynamic = "force-dynamic";

export default async function DivyaStorePage() {
  const storeCategoriesToRender = await getStoreCategoriesToRender();
  const banners = await fetchPageBanners("divya-store");
  const heroImage = getBannerImage(banners.hero);
  const heroLink = getBannerLink(banners.hero);

  let categoriesList = [];
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "http://localhost:4000";
    const res = await fetch(`${baseUrl}/api/categories`, { cache: "no-store" });
    if (res.ok) categoriesList = await res.json();
  } catch (e) {
    console.warn("Failed to fetch categories for filters:", e?.message);
  }

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <PageHeroBanner
          className={styles.hero}
          ariaLabel="Divya Store"
          image={heroImage}
          linkUrl={heroLink}
        />
        <section id="categories" className={styles.categoriesSection} aria-label="Store categories">
          <div className="container">
            <DivyaStoreCatalog storeCategories={storeCategoriesToRender} categories={categoriesList} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
