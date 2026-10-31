import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Post from "@/models/Post";
import { updatePost } from "@/app/admin/actions";
import PostForm from "@/app/admin/posts/PostForm";

export default async function EditPostPage({ params }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await connectToDatabase();
  const post = await Post.findById(id).lean();
  if (!post) notFound();

  const plainPost = {
    _id: post._id.toString(),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    content: post.content || "",
    coverImage: post.coverImage || "",
    author: post.author || "مدیر",
    isPublished: Boolean(post.isPublished),
  };

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-950">ویرایش پست</h1>
        <Link href="/admin/posts" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">بازگشت به پست‌ها</Link>
      </div>
      <PostForm action={updatePost} post={plainPost} />
    </section>
  );
}
