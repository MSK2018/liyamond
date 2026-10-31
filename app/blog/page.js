import Link from "next/link";
import { connection } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Post from "@/models/Post";

export default async function Page() {
  await connection();
  await connectToDatabase();

  const posts = await Post.find({ isPublished: true })
    .select("title slug excerpt coverImage author createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-950">وبلاگ لیاموند</h1>
        <p className="mt-2 text-sm text-slate-600">آخرین اخبار، آموزش‌ها و معرفی محصولات</p>
      </header>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">هنوز پستی منتشر نشده است.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {posts.map((post) => (
            <article key={post._id.toString()} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <Link href={`/blog/${encodeURIComponent(post.slug)}`} className="block">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-sm text-slate-500">تصویر پست</div>
                )}
                <div className="p-4">
                  <p className="text-xs text-slate-500">{post.author} · {new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(post.createdAt))}</p>
                  <h2 className="mt-3 line-clamp-2 text-lg font-bold text-slate-950">{post.title}</h2>
                  {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600">{post.excerpt}</p>}
                  <span className="mt-4 inline-block text-sm font-bold text-slate-800">ادامه مطلب ←</span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
