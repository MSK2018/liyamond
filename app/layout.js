import { Vazirmatn } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import { Toaster } from "sonner";
import { getCartCount } from "@/app/actions/cart";
import "./globals.css";

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata = {
  title: "50111936",
  description: "فروشگاه لیاموند",
  other: {
    enamad: "50111936",
  },
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();
  const cartCount = await getCartCount();
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazirmatn.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Toaster
          richColors
          position="top-center"
          dir="rtl"
          closeButton
          style={{ fontFamily: "var(--font-vazirmatn), Arial, Helvetica, sans-serif" }}
          toastOptions={{ classNames: { toast: "vazirmatn-toast" } }}
        />
        <Navbar cartCount={cartCount} user={user ? { name: user.name, username: user.username, role: user.role } : null} />
        <main className="flex min-h-[calc(100vh-72px)] flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
