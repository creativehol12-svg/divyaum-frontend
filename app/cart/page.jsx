import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import CartClient from "./CartClient";
import styles from "./page.module.scss";

export const metadata = {
  title: "Your Cart | Divyaum",
  description: "Review the items you added to cart and continue shopping.",
};

export default function CartPage() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <CartClient />
      </main>
      <Footer />
    </div>
  );
}
