import Link from "next/link";
import { connection } from "next/server";
import { getCartItems } from "@/app/actions/cart";
import { getCurrentUser } from "@/lib/auth";
import CheckoutForm from "@/components/CheckoutForm";

export default async function Page() {
  await connection();
  const [items, user] = await Promise.all([getCartItems(), getCurrentUser()]);

  if (items.length === 0) {
    return <main className="mx-auto w-full max-w-3xl px-4 py-16 text-center" dir="rtl"><div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14"><h1 className="text-2xl font-bold text-slate-950">سبد خرید خالی است</h1><p className="mt-2 text-sm text-slate-500">برای ادامه خرید ابتدا محصولی به سبد اضافه کنید.</p><Link href="/shop" className="mt-5 inline-flex rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white">بازگشت به فروشگاه</Link></div></main>;
  }

  const subtotal = items.reduce((sum, item) => sum + item.priceToman * item.quantity, 0);
  const shippingCost = subtotal >= 1000000000 ? 0 : 150000;
  const total = subtotal + shippingCost;
  const savedAddresses = (user?.addresses || []).map((item) => ({ ...item, mobile: item.mobile || user.mobile || "" }));
  const savedAddress = savedAddresses[0] || null;

  return <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8" dir="rtl"><div className="mb-7"><h1 className="text-3xl font-bold text-slate-950">تکمیل خرید</h1><p className="mt-2 text-sm text-slate-500">اطلاعات تحویل و پرداخت سفارش را بررسی کنید.</p></div><CheckoutForm savedAddress={savedAddress} savedAddresses={savedAddresses} items={items} subtotal={subtotal} shippingCost={shippingCost} total={total} /></main>;
}
