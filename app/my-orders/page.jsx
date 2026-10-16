import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import MyOrdersClient from "./MyOrdersClient";

export const metadata = {
  title: "My Orders | Divyaum",
  description: "Track your Divya Store orders.",
};

export default function MyOrdersPage() {
  return (
    <div>
      <Header />
      <MyOrdersClient />
      <Footer />
    </div>
  );
}

