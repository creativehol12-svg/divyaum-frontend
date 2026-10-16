import styles from "./loginPage.module.scss";
import LoginForm from "../../components/Card/LoginForm";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className={styles.loginPageSplit}>
      <div className={styles.leftPane}>
        <Image
          src="/image.png"
          alt="Puja Ritual"
          fill={"contain"}
          className={styles.pujaImage}
          priority
         
        />
      </div>
      <div className={styles.rightPane}>
        <LoginForm />
      </div>
    </div>
  );
}
