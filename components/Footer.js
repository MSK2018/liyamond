import Link from "next/link";

const quickLinks = [
  { href: "/shop", label: "فروشگاه" },
  { href: "/blog", label: "وبلاگ" },
  { href: "/orders", label: "پیگیری سفارش" },
  { href: "/cart", label: "سبد خرید" },
];

const supportLinks = [
  { href: "/account", label: "حساب کاربری" },
  { href: "/", label: "درباره لیاموند" },
  { href: "/", label: "تماس با ما" },
  { href: "/", label: "سوالات متداول" },
];

function InstagramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" className="fill-current stroke-none" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
      <path strokeLinejoin="round" d="M21 3 3.7 10.2c-1 .4-.9 1.8.1 2l4.6 1.5 1.7 5.2c.3 1 1.6 1.1 2.1.2l2.5-4.2 4.8 3.5c.8.6 1.9.1 2.1-.9L22 4.5c.2-.9-.5-1.8-1.4-1.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.4 13.7 8.8-6.3-6 7.7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.1 3H5.7A2.7 2.7 0 0 0 3 5.7C3 14.7 9.3 21 18.3 21a2.7 2.7 0 0 0 2.7-2.7v-2.4l-5.1-2-1.5 2.2a13.8 13.8 0 0 1-6-6l2.2-1.5L8.1 3Z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300" dir="rtl">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-9 md:grid-cols-3 md:gap-8">
          <section aria-labelledby="footer-about">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-extrabold text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-950">L</span>
              <span>لیاموند</span>
            </Link>
            <p id="footer-about" className="mt-4 max-w-sm text-sm leading-7 text-slate-400">
              خرید آسان و مطمئن محصولات متنوع، با ارسال سریع و پشتیبانی همراه شما تا پایان خرید.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="اینستاگرام لیاموند" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-colors hover:border-slate-500 hover:bg-white hover:text-slate-950">
                <InstagramIcon />
              </a>
              <a href="https://telegram.org" target="_blank" rel="noreferrer" aria-label="تلگرام لیاموند" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition-colors hover:border-slate-500 hover:bg-white hover:text-slate-950">
                <TelegramIcon />
              </a>
            </div>
          </section>

          <section aria-labelledby="footer-links" className="grid grid-cols-2 gap-6">
            <div>
              <h2 id="footer-links" className="mb-4 text-sm font-bold text-white">دسترسی سریع</h2>
              <ul className="space-y-3 text-sm">
                {quickLinks.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link href={link.href} className="transition-colors hover:text-white">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-4 text-sm font-bold text-white">راهنمای خرید</h2>
              <ul className="space-y-3 text-sm">
                {supportLinks.map((link) => (
                  <li key={`${link.href}-${link.label}`}>
                    <Link href={link.href} className="transition-colors hover:text-white">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section aria-labelledby="footer-contact">
            <h2 id="footer-contact" className="mb-4 text-sm font-bold text-white">ارتباط با لیاموند</h2>
            <a href="tel:02100000000" dir="ltr" className="flex w-fit items-center gap-3 text-sm font-semibold text-slate-200 transition-colors hover:text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-200"><PhoneIcon /></span>
              <span>۰۲۱ - ۰۰۰۰ ۰۰۰۰</span>
            </a>
            <p className="mt-4 text-sm leading-7 text-slate-400">پشتیبانی آنلاین: همه‌روزه از ساعت ۹ تا ۲۱</p>
            <div className="mt-5 flex items-center gap-3">
              <span className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300">پرداخت امن</span>
              <span className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-slate-300">ارسال سریع</span>
            </div>
          </section>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>تمام حقوق برای فروشگاه لیاموند محفوظ است. © {new Date().getFullYear()}</p>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-300">حریم خصوصی</Link>
            <Link href="/" className="hover:text-slate-300">شرایط استفاده</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
