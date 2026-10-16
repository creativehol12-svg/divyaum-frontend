import Image from "next/image";
import styles from "./Card.module.scss";
import Button from "@/components/Button";

export default function Card({
  title,
  description,
  image,
  buttonText,
  icon,
  href = "#contact",
  imagePosition = "center",
}) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image
          src={image}
          alt=""
          fill
          className={styles.image}
          sizes="(max-width: 768px) 92vw, (max-width: 1200px) 44vw, 360px"
          style={{ objectPosition: imagePosition }}
        />
      </div>

      <div className={styles.body}>
        {icon ? (
          <div className={styles.iconWrap} aria-hidden="true">
            <Image src={icon} alt="" width={42} height={42} />
          </div>
        ) : null}

        <h3 className={styles.title}>{title}</h3>
        {description ? <p className={styles.description}>{description}</p> : null}

        <Button as="a" variant="unstyled" className={styles.button} href={href}>
          {buttonText}
          <span className={styles.arrow} aria-hidden="true">
            ›
          </span>
        </Button>
      </div>
    </article>
  );
}

