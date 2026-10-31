import Link from "next/link";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";

export default async function Page({ searchParams }) {
  await connection();
  await connectToDatabase();
  const params = await searchParams;
  const user = await getCurrentUser();
  const orders = user ? await Order.find({ user: user.id }).sort({ createdAt: -1 }).lean() : [];
  const formatter = new Intl.NumberFormat("fa-IR");

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6" dir="rtl">
      {params?.success === "1" && <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">سفارش شما با موفقیت ثبت شد.</div>}
      <div className="mb-7"><h1 className="text-3xl font-bold text-slate-950">سفارش‌ها</h1><p className="mt-2 text-sm text-slate-500">پیگیری وضعیت سفارش‌های ثبت‌شده</p></div>
      {!user ? <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><p className="text-slate-600">برای مشاهده سفارش‌های خود وارد حساب کاربری شوید.</p><Link href="/login" className="mt-4 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">ورود</Link></section> : orders.length === 0 ? <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center"><p className="text-slate-600">هنوز سفارشی ثبت نکرده‌اید.</p><Link href="/shop" className="mt-4 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">مشاهده فروشگاه</Link></section> : <div className="space-y-4">{orders.map((order) => <article key={order._id.toString()} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-xs text-slate-500">شماره سفارش</p><p className="mt-1 font-bold text-slate-950" dir="ltr">#{order._id.toString().slice(-8).toUpperCase()}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{order.status === "pending" ? "در انتظار تایید" : order.status}</span></div><div className="mt-4 space-y-2 text-sm">{order.items.map((item, index) => <div key={index} className="flex justify-between gap-3 text-slate-700"><span>{item.name} × {formatter.format(item.quantity)}</span><span className="shrink-0 font-bold">{formatter.format(item.priceToman * item.quantity)} تومان</span></div>)}</div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-sm text-slate-600">مبلغ کل</span><span className="font-bold text-slate-950">{formatter.format(order.total)} تومان</span></div></article>)}</div>}
    </main>
  );
}
