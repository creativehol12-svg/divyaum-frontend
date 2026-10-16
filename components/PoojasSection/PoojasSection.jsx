"use client";

import PoojaCard from "@/components/PoojaCard/PoojaCard";
import styles from "./PoojasSection.module.scss";

function minutesBetween(startTime, endTime) {
  const parse = (t) => {
    const [h, m] = String(t ?? "").split(":").map(Number);
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return h * 60 + m;
  };
  const start = parse(startTime);
  const end = parse(endTime);
  if (start == null || end == null) return null;
  const diff = end - start;
  return diff > 0 ? diff : null;
}

function mapApiPoojaToCard(apiPooja) {
  const id = apiPooja?._id ?? "";
  const slug = apiPooja?.slug ?? "";

  const durationFromTime =
    minutesBetween(apiPooja?.time?.startTime, apiPooja?.time?.endTime) ??
    minutesBetween(apiPooja?.timeSlots?.[0]?.startTime, apiPooja?.timeSlots?.[0]?.endTime) ??
    60;

  const image = apiPooja?.featuredImage || apiPooja?.images?.[0] || "";

  const aboutText = String(apiPooja?.about ?? "").trim();
  const derivedShort = apiPooja?.shortDescription || (aboutText ? aboutText.split(".")[0] : "");

  return {
    cardKey: id || slug,
    slug,
    title: apiPooja?.title ?? apiPooja?.name ?? "Pooja",
    image,
    durationMins: durationFromTime,
    shortDescription: derivedShort,
    location: apiPooja?.temple?.address?.split(",")[1],
  };
}

function buildPoojaCards({ limit, poojas }) {
  const sourceList = Array.isArray(poojas) ? poojas : [];
  if (!sourceList.length || limit <= 0) return [];

  return sourceList.slice(0, limit).map((source, index) => {
    const mapped = mapApiPoojaToCard(source);
    const stableKeyPart = mapped.cardKey ?? mapped.slug ?? "pooja";
    return {
      ...mapped,
      cardKey: `${stableKeyPart}-${index}`,
    };
  });
}

export default function PoojasSection({
  cardLimit = 4,
  showViewMore = false,
  poojas = [],
  showBackground = true,
  heading = "Poojas of the Month",
}) {
  const poojaCards = buildPoojaCards({ limit: cardLimit, poojas });

  if (!poojaCards.length) return null;

  return (
    <section className={styles.section} aria-label="Poojas of the Month">
      <div className="container">
        <header className={styles.header}>
          <h2 className={styles.title}>{heading}</h2>
        </header>

        <div className={`${styles.sliderWrap} ${showBackground ? "" : styles.noBg}`.trim()}>
          <div className={styles.scroller}>
            {poojaCards.map((pooja) => (
              <PoojaCard
                key={pooja.cardKey}
                {...pooja}
                href={`/online-pooja/${pooja.slug}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
