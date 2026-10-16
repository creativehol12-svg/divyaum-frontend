import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import OrderDetailClient from "./OrderDetailClient";

export const metadata = {
  title: "Order details | Divyaum",
  description: "View items, quantities, and delivery address for your order.",
};

export default function OrderDetailPage() {
  return (
    <div>
      <Header />
      <OrderDetailClient />
      <Footer />
    </div>
  );
}
