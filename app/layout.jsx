import { Geist, Playfair_Display } from "next/font/google";
import "./globals.scss";
import WhatsAppFloat from "@/components/WhatsAppFloat/WhatsAppFloat";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.divyaum.com"),
  title: "Divyaum - A Spiritual Journey",
  description: "A Spiritual Journey for Divyaum",
  icons: {
    icon: "/icon/fav.jpeg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${playfair.variable}`} data-scroll-behavior="smooth">
      <body>
        <Providers>
          {children}
          <WhatsAppFloat />
        </Providers>
      </body>
    </html>
  );
}
