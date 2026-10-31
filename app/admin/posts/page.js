import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import Post from "@/models/Post";
import { createPost, deletePost } from "@/app/admin/actions";
import PostForm from "@/app/admin/posts/PostForm";

export default async function PostsPage() {
  await connectToDatabase();
  const posts = await Post.find().sort({ createdAt: -1 }).lean();

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-950">پست‌های وبلاگ</h1>
      <PostForm action={createPost} />
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead className="bg-slate-100 text-slate-600"><tr><th className="p-4">عنوان</th><th className="p-4">نویسنده</th><th className="p-4">وضعیت</th><th className="p-4">عملیات</th></tr></thead><tbody>{posts.map((post) => <tr key={post._id.toString()} className="border-t border-slate-100"><td className="p-4 font-medium">{post.title}</td><td className="p-4">{post.author}</td><td className="p-4">{post.isPublished ? "منتشر شده" : "پیش‌نویس"}</td><td className="p-4"><div className="flex gap-2"><Link href={`/admin/posts/${post._id.toString()}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50">ویرایش</Link><form action={deletePost}><input type="hidden" name="id" value={post._id.toString()} /><button className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50">حذف</button></form></div></td></tr>)}</tbody></table></div>{posts.length === 0 && <p className="p-8 text-center text-slate-500">پستی ثبت نشده است.</p>}</div>
    </section>
  );
}

