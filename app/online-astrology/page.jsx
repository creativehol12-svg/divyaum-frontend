import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import PageHeroBanner from "@/components/PageHeroBanner/PageHeroBanner";
import styles from "./page.module.scss";
import PanditSection from "@/components/PanditSection/PanditSection";
import {
  fetchPageBanners,
  getBannerImage,
  getBannerLink,
} from "@/lib/bannersApi";

export const metadata = {
  title: "Online Astrology | Divyaum",
  description: "Consult trusted jyotish acharyas online for kundli, marriage, career, and remedies.",
};

async function fetchAstro() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

  const response = await fetch(`${baseUrl}/api/astrologers`, { cache: "no-store" });
  if (!response.ok) return [];
  const json = await response.json();
  return Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
}

export default async function OnlineAstrologyPage() {
  const pandits = await fetchAstro();
  const banners = await fetchPageBanners("online-astrology");
  const heroImage = getBannerImage(banners.hero);
  const heroLink = getBannerLink(banners.hero);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <PageHeroBanner
          className={styles.hero}
          ariaLabel="Online astrology"
          image={heroImage}
          linkUrl={heroLink}
        />

        <PanditSection pandits={pandits} />
      </main>

      <Footer />
    </div>
  );
}
