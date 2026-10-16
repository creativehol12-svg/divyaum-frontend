import styles from "../login/loginPage.module.scss";
import ForgotPasswordForm from "../../components/Card/ForgotPasswordForm";
import Image from "next/image";

export default function ForgotPasswordPage() {
  return (
    <div className={styles.loginPageSplit}>
      <div className={styles.leftPane}>
        <Image src="/image.png" alt="Puja Ritual" fill={"contain"} className={styles.pujaImage} priority />
      </div>
      <div className={styles.rightPane}>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}