import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Post from "@/models/Post";
import Comment from "@/models/Comment";

export default async function AdminDashboard() {
  await connectToDatabase();
  const [productCount, categoryCount, postCount, pendingComments] = await Promise.all([
    Product.countDocuments(), Category.countDocuments(), Post.countDocuments(),
    Comment.countDocuments({ status: "pending" }),
  ]);

  const cards = [
    { label: "محصول‌ها", value: productCount, href: "/admin/products" },
    { label: "دسته‌بندی‌ها", value: categoryCount, href: "/admin/categories" },
    { label: "پست‌ها", value: postCount, href: "/admin/posts" },
    { label: "کامنت‌های در انتظار", value: pendingComments, href: "/admin/comments" },
  ];

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-950">داشبورد مدیریت</h1>
      <p className="mt-2 text-sm text-slate-500">مدیریت محتوای فروشگاه و وبلاگ</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">{card.value}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
