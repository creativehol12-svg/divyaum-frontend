import styles from "./OfferBadge.module.scss";

export default function OfferBadge({ label = "Offer" }) {
  return <span className={styles.offerBadge}>{label}</span>;
}
