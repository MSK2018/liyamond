"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/", label: "خانه" },
  { href: "/shop", label: "فروشگاه" },
  { href: "/blog", label: "وبلاگ" },
  { href: "/orders", label: "سفارش‌ها" },
  { href: "/account", label: "حساب کاربری" },
];

function CartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4l1.5-6.4H6.1M9 21h.01M17 21h.01" />
    </svg>
  );
}

function MenuIcon({ open }) {
  return (
    <span className="relative block h-5 w-6" aria-hidden="true">
      <span className={`absolute left-0 top-[3px] h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
      <span className={`absolute left-0 top-[9px] h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
      <span className={`absolute left-0 top-[15px] h-[2px] w-6 rounded-full bg-current transition-all duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
    </span>
  );
}

export default function Navbar({ user, cartCount = 0 }) {
  const [open, setOpen] = useState(false);
  const isLoggedIn = Boolean(user);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="منوی اصلی" dir="rtl">
        <div className="flex items-center">
          {isLoggedIn ? (
            <Link href="/account" className="flex h-11 items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:text-slate-950">
              حساب کاربری
            </Link>
          ) : (
            <span className="h-11 w-11" aria-hidden="true" />
          )}
        </div>

        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/80 p-1.5 lg:flex">
          {links.filter((link) => isLoggedIn || (link.href !== "/account" && link.href !== "/orders")).map((link) => (
            <Link key={link.href} href={link.href} className="group relative px-3 py-2 text-sm font-medium text-slate-600 transition-colors duration-200 hover:text-slate-950 xl:px-4">
              <span className="absolute inset-x-3 bottom-1 h-px origin-center scale-x-0 bg-slate-900 transition-transform duration-300 group-hover:scale-x-100" />
              <span className="relative">{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex" dir="rtl">
          <Link href="/cart" className="relative flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
            <CartIcon />
            <span>سبد خرید</span>
            {cartCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-[10px] font-bold text-white">{new Intl.NumberFormat("fa-IR").format(cartCount)}</span>}
          </Link>
          {user?.role === "admin" && (
            <Link href="/admin" className="flex h-11 items-center rounded-full border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800">داشبورد ادمین</Link>
          )}
          {isLoggedIn ? (
            <form action={logout}><button type="submit" className="flex h-11 cursor-pointer items-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600">خروج</button></form>
          ) : (
            <>
              <Link href="/login" className="flex h-11 items-center rounded-full bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md">ورود</Link>
              <Link href="/register" className="flex h-11 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400">ثبت‌نام</Link>
            </>
          )}
        </div>

        <button type="button" onClick={() => setOpen((value) => !value)} className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-sm lg:hidden" aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? "بستن منو" : "باز کردن منو"}>
          <MenuIcon open={open} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div id="mobile-menu" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden border-t border-slate-100 bg-white lg:hidden">
            <motion.div initial={{ y: -10 }} animate={{ y: 0 }} exit={{ y: -8 }} transition={{ duration: 0.28 }} className="mx-auto max-w-7xl px-4 pb-5 pt-3 sm:px-6" dir="rtl">
              <div className="flex flex-col">
                {links.filter((link) => isLoggedIn || (link.href !== "/account" && link.href !== "/orders")).map((link, index) => (
                  <motion.div key={link.href} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.045 }}>
                    <Link href={link.href} onClick={() => setOpen(false)} className="flex items-center border-b border-slate-100 py-3 text-[15px] font-medium text-slate-700 transition-colors hover:text-slate-950">{link.label}</Link>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Link href="/cart" onClick={() => setOpen(false)} className="relative flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-800"><CartIcon /> سبد{cartCount > 0 && <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-[10px] text-white">{new Intl.NumberFormat("fa-IR").format(cartCount)}</span>}</Link>
                {isLoggedIn ? (
                  <>
                    {user?.role === "admin" && <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900 py-3 text-sm font-semibold text-white">داشبورد ادمین</Link>}
                    <Link href="/account" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700">حساب کاربری</Link>
                    <form action={logout} onSubmit={() => setOpen(false)}><button type="submit" className="w-full rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-semibold text-red-600">خروج</button></form>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-xl bg-slate-950 py-3 text-sm font-semibold text-white">ورود</Link>
                    <Link href="/register" onClick={() => setOpen(false)} className="flex items-center justify-center rounded-xl border border-slate-300 py-3 text-sm font-semibold text-slate-700">ثبت‌نام</Link>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
