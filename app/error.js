"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export default function Error({ error, reset }) {
  useEffect(() => {
    toast.error(error?.message || "خطای غیرمنتظره‌ای رخ داد");
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-lg items-center justify-center px-4" dir="rtl">
      <section className="w-full rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl text-red-600">!</div>
        <h1 className="mt-4 text-xl font-bold text-slate-950">خطایی رخ داد</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">{error?.message || "عملیات انجام نشد. لطفاً دوباره تلاش کنید."}</p>
        <button type="button" onClick={() => reset()} className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">تلاش مجدد</button>
      </section>
    </main>
  );
}
