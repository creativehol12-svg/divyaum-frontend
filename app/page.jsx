import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Footer from "@/components/Footer/Footer";
import styles from "./page.module.scss";
import CardsSection from "@/components/CardsSection/CardsSection";
import PoojasSection from "@/components/PoojasSection/PoojasSection";
import Testimonials from "@/components/Testimonials/Testimonials";
import FeaturedVideos from "@/components/FeaturedVideos/FeaturedVideos";
import ProductOfMonthSection from "@/components/ProductOfMonthSection/ProductOfMonthSection";
import PorposeSection from "@/components/About-All-section/PorposeSection/PorposeSection";
import VisionSection from "@/components/About-All-section/VisionSection/VisionSection";
import data from "@/data/about-data.json";
import AboutUs from "@/components/About-All-section/AboutSection/AboutUs";
import MiddleBanner from "@/components/MiddleBanner/MiddleBanner";
import {
  fetchPageBanners,
  getBannerImage,
  getBannerLink,
} from "@/lib/bannersApi";
import { fetchYoutubeVideos } from "@/lib/youtubeVideosApi";

export const dynamic = "force-dynamic";

async function fetchPoojas() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:4000";
  const response = await fetch(`${baseUrl}/api/poojas`, { cache: "no-store" });
  if (!response.ok) return [];
  const json = await response.json();
  return Array.isArray(json) ? json : [];
}

function MiddleSectionBanner({ slot, priority = false }) {
  const image = getBannerImage(slot);
  return (
    <MiddleBanner
      image={image}
      linkUrl={getBannerLink(slot)}
      priority={priority}
    />
  );
}

export default async function Home() {
  const [poojas, banners, youtubeVideos] = await Promise.all([
    fetchPoojas(),
    fetchPageBanners("home"),
    fetchYoutubeVideos(),
  ]);
  const carouselBanners = Array.isArray(banners["hero-carousel"])
    ? banners["hero-carousel"]
    : [];

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Hero banners={carouselBanners} />
        <AboutUs stats={data.stats} isDetailed={false} />
        <MiddleSectionBanner
          slot={banners["middle-after-about"]}
          priority
        />
        <CardsSection />
        <PoojasSection cardLimit={4} showViewMore poojas={poojas} />
        <MiddleSectionBanner slot={banners["middle-after-poojas"]} />
        <FeaturedVideos videos={youtubeVideos} />
        <ProductOfMonthSection />
        <MiddleSectionBanner slot={banners["middle-after-videos"]} />
        <Testimonials />
        <MiddleSectionBanner slot={banners["middle-before-purpose"]} />
        <PorposeSection />
        <VisionSection vision={data.vision} />
      </main>
      <Footer />
    </div>
  );
}
