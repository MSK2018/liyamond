import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Post from "@/models/Post";
import Comments from "@/app/components/Comments";

export default async function Page({ params }) {
  await connection();
  const { slug } = await params;
  await connectToDatabase();

  let requestedSlug = String(slug || "");
  try {
    requestedSlug = decodeURIComponent(requestedSlug);
  } catch {}
  requestedSlug = requestedSlug.normalize("NFC").replace(/‌/g, "");

  const post = await Post.findOne({ slug: requestedSlug, isPublished: true }).lean();
  if (!post) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/blog" className="text-sm font-medium text-slate-600 hover:text-slate-950">→ بازگشت به وبلاگ</Link>
      <article className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {post.coverImage ? <img src={post.coverImage} alt={post.title} className="aspect-[16/8] w-full object-cover" /> : <div className="flex aspect-[16/8] items-center justify-center bg-slate-100 text-slate-500">تصویر پست</div>}
        <div className="p-5 sm:p-8">
          <p className="text-sm text-slate-500">{post.author} · {new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date(post.createdAt))}</p>
          <h1 className="mt-4 text-3xl font-bold text-slate-950">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg leading-8 text-slate-600">{post.excerpt}</p>}
          <div className="mt-8 whitespace-pre-line leading-8 text-slate-700">{post.content}</div>
        </div>
      </article>
      <Comments targetType="post" targetId={post._id.toString()} />
    </main>
  );
}
