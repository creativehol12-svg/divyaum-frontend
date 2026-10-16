import Header from "@/components/Header/Header";
import PoojasSection from "@/components/PoojasSection/PoojasSection";
import Footer from "@/components/Footer/Footer";
import PageHeroBanner from "@/components/PageHeroBanner/PageHeroBanner";
import styles from "./page.module.scss";
import {
  fetchPageBanners,
  getBannerImage,
  getBannerLink,
} from "@/lib/bannersApi";

export const metadata = {
  title: "Online Pooja | Divyaum",
  description: "Book authentic online poojas with verified Pandit-Ji and blessed samagri.",
};

async function fetchPoojas() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";
  const response = await fetch(`${baseUrl}/api/poojas`, { cache: "no-store" });
  if (!response.ok) return [];
  const json = await response.json();
  return Array.isArray(json) ? json : [];
}

export default async function OnlinePoojaPage() {
  const poojas = await fetchPoojas();
  const banners = await fetchPageBanners("online-pooja");
  const heroImage = getBannerImage(banners.hero);
  const heroLink = getBannerLink(banners.hero);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <PageHeroBanner
          className={styles.hero}
          ariaLabel="Online pooja"
          image={heroImage}
          linkUrl={heroLink}
        />

        <section id="pooja-list" className={styles.listWrap}>
          <PoojasSection
            cardLimit={poojas.length}
            showViewMore={false}
            poojas={poojas}
            showBackground={false}
            heading="All Poojas"
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
