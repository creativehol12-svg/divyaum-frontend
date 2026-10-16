import styles from "../login/loginPage.module.scss"; // same scss
import SignupForm from "../../components/Card/SignupForm";
import Image from "next/image";

export default function SignupPage() {
  return (
    <div className={styles.loginPageSplit}>
      <div className={styles.leftPane}>
        <Image src="/image.png" alt="Puja Ritual" fill={"contain"} className={styles.pujaImage} priority />
      </div>
      <div className={styles.rightPane}>
        <SignupForm />
      </div>
    </div>
  );
}