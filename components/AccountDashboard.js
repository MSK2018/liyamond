"use client";

import { useState } from "react";
import Link from "next/link";
import { ProfileInfoForm } from "@/app/components/AuthForms";
import AddressForm from "@/app/components/AddressForm";
import { logout } from "@/app/actions/auth";

const tabs = [
  { id: "profile", label: "ویرایش اطلاعات کاربری", icon: "👤" },
  { id: "orders", label: "سفارش‌ها", icon: "📦" },
  { id: "payments", label: "پرداخت‌ها", icon: "💳" },
  { id: "address", label: "آدرس‌ها", icon: "📍" },
];

export default function AccountDashboard({ user, orders, payments }) {
  const [active, setActive] = useState("profile");
  const formatter = new Intl.NumberFormat("fa-IR");
  const dateFormatter = new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8" dir="rtl">
      <div className="mb-7"><p className="text-sm text-slate-500">پنل شخصی</p><h1 className="mt-1 text-3xl font-bold text-slate-950">حساب کاربری</h1></div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-2 lg:sticky lg:top-24">
          <div className="mb-2 px-3 py-3"><p className="font-bold text-slate-950">{user.name}</p><p className="mt-1 text-xs text-slate-500" dir="ltr">@{user.username}</p></div>
          <nav className="space-y-1" aria-label="منوی حساب کاربری">
            {tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActive(tab.id)} className={`flex w-full items-center gap-2 rounded-xl px-3 py-3 text-right text-sm font-semibold transition ${active === tab.id ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}><span>{tab.icon}</span><span>{tab.label}</span></button>)}
          </nav>
          <form action={logout} className="mt-2 border-t border-slate-100 pt-2"><button type="submit" className="w-full rounded-xl px-3 py-3 text-right text-sm font-bold text-red-600 hover:bg-red-50">خروج از حساب</button></form>
        </aside>

        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          {active === "profile" && <><h2 className="mb-5 text-xl font-bold text-slate-950">ویرایش اطلاعات کاربری</h2><ProfileInfoForm user={user} /></>}
          {active === "address" && <><h2 className="mb-2 text-xl font-bold text-slate-950">آدرس‌های تحویل</h2><p className="text-sm text-slate-500">این آدرس در صفحه پرداخت به‌صورت پیش‌فرض قابل انتخاب است.</p><AddressForm addresses={user.addresses || []} address={user.address} /></>}
          {active === "orders" && <><h2 className="mb-5 text-xl font-bold text-slate-950">سفارش‌ها</h2>{orders.length === 0 ? <EmptyState title="هنوز سفارشی ثبت نکرده‌اید" link="/shop" label="مشاهده فروشگاه" /> : <div className="space-y-4">{orders.map((order) => <article key={order.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3"><div><p className="text-xs text-slate-500">شماره سفارش</p><p className="mt-1 font-bold" dir="ltr">#{order.id.slice(-8).toUpperCase()}</p></div><StatusBadge status={order.status} /></div><div className="mt-3 space-y-2 text-sm">{order.items.map((item, index) => <div key={index} className="flex justify-between gap-3"><span className="text-slate-700">{item.name} × {formatter.format(item.quantity)}</span><span className="shrink-0 font-bold">{formatter.format(item.priceToman * item.quantity)} تومان</span></div>)}</div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs text-slate-500">{dateFormatter.format(new Date(order.createdAt))}</span><span className="font-bold">{formatter.format(order.total)} تومان</span></div></article>)}</div>}</>}
          {active === "payments" && <><h2 className="mb-5 text-xl font-bold text-slate-950">پرداخت‌ها</h2>{payments.length === 0 ? <EmptyState title="هنوز پرداختی ثبت نشده است" link="/shop" label="شروع خرید" /> : <div className="space-y-3">{payments.map((payment) => <article key={payment.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"><div><p className="text-sm font-bold text-slate-950">پرداخت اینترنتی</p><p className="mt-1 text-xs text-slate-500" dir="ltr">سفارش #{payment.orderId.slice(-8).toUpperCase()} — {dateFormatter.format(new Date(payment.createdAt))}</p></div><div className="text-left"><p className="font-bold text-slate-950">{formatter.format(payment.amount)} تومان</p><span className={`mt-1 inline-block rounded-full px-2 py-1 text-xs font-bold ${payment.status === "paid" ? "bg-emerald-50 text-emerald-700" : payment.status === "failed" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{payment.status === "paid" ? "پرداخت شده" : payment.status === "failed" ? "ناموفق" : "در انتظار پرداخت"}</span></div></article>)}</div>}</>}
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }) {
  const labels = { pending: "در انتظار تایید", paid: "پرداخت‌شده", processing: "در حال آماده‌سازی", shipped: "ارسال‌شده", completed: "تکمیل‌شده", cancelled: "لغو‌شده" };
  return <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{labels[status] || status}</span>;
}

function EmptyState({ title, link, label }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center"><p className="text-slate-600">{title}</p><Link href={link} className="mt-4 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">{label}</Link></div>;
}
