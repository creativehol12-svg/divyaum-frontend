import ServiceCard from "@/components/ServiceCard/ServiceCard";
import styles from "./CardsSection.module.scss";

const cards = [
  {
    title: "Online Pooja",
    image: "/images/pooja.jpeg",
    icon: "/services-icons/pooja.png",
    buttonText: "Book Sacred Rituals",
    href: "/online-pooja",
  },
  {
    title: "Vedic Astrology",
    image: "/images/astrology.jpeg",
    icon: "/services-icons/vedic-astrology.png",
    buttonText: "Consult Now",
    href: "/online-astrology",
  },
  {
    title: "Divya Store",
    image: "/images/divyastore.jpeg",
    icon: "/services-icons/store.png",
    buttonText: "Explore Store",
    href: "/divya-store",
  },
];

export default function CardsSection() {
  return (
    <section id="services" className={styles.section} aria-label="Services">
      <div className="container">
        <header className={styles.head}>
          <p className={styles.kicker}>Divine Services</p>
          <h2 className={styles.heading}>Begin Your Spiritual Journey</h2>
          <p className={styles.lead}>
            Book trusted rituals, receive expert guidance, and discover sacred essentials.
          </p>
        </header>

        <div className={styles.grid}>
          {cards.map((card) => (
            <ServiceCard
              key={card.title}
              title={card.title}
              image={card.image}
              icon={card.icon}
              buttonText={card.buttonText}
              href={card.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

