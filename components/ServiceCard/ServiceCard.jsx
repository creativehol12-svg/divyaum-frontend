"use client";

import Image from "next/image";
import styles from "./ServiceCard.module.scss";
import Button from "@/components/Button";

export default function ServiceCard({ title, image, icon, buttonText, href = "#" }) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image
          src={image}
          alt=""
          fill
          className={styles.image}
        />
      </div>

      <div className={styles.body}>
        <div className={styles.iconWrap}>
          <Image src={icon} alt="" width={40} height={40} className={styles.icon} />
        </div>

        <h3 className={styles.title}>{title}</h3>

        <Button as="a" variant="unstyled" className={styles.button} href={href}>
          {buttonText}
          <span className={styles.arrow}>›</span>
        </Button>
      </div>
    </article>
  );
}