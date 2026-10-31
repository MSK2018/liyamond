import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

const links = [
  { href: "/admin", label: "داشبورد" },
  { href: "/admin/products", label: "محصول‌ها" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها" },
  { href: "/admin/posts", label: "پست‌ها" },
  { href: "/admin/comments", label: "کامنت‌ها" },
];

export const metadata = { title: "پنل مدیریت لیاموند" };

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  return (
    <div className="min-h-[calc(100vh-72px)] bg-slate-50" dir="rtl">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-24">
          <div className="px-3 py-3 text-sm font-bold text-slate-950">پنل مدیریت</div>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="منوی مدیریت">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
