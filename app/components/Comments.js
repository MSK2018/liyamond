import { createComment } from "@/app/admin/actions";
import Comment from "@/models/Comment";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Comments({ targetType, targetId }) {
  const comments = await Comment.find({ targetType, targetId, status: "approved" }).sort({ createdAt: -1 }).lean();
  const user = await getCurrentUser();

  return (
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-slate-950">کامنت‌ها ({comments.length})</h2>
      <div className="mt-5 space-y-3">
        {comments.map((comment) => <article key={comment._id.toString()} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-bold text-slate-900">{comment.authorName}</p><p className="text-xs text-slate-500" dir="ltr">@{comment.username}</p></div><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{comment.content}</p></article>)}
        {comments.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500">هنوز کامنت تایید‌شده‌ای ثبت نشده است.</p>}
      </div>
      {user ? (
        <form action={createComment} className="mt-6 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
          <input type="hidden" name="targetType" value={targetType} /><input type="hidden" name="targetId" value={targetId.toString()} />
          <div><label htmlFor={`authorName-${targetType}-${targetId}`} className="mb-2 block text-sm font-medium text-slate-700">نام و نام خانوادگی</label><input id={`authorName-${targetType}-${targetId}`} name="authorName" required maxLength={100} defaultValue={user.name} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700" /></div>
          <div className="flex items-end"><p className="w-full rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600" dir="ltr">ثبت‌کننده: @{user.username}</p></div>
          <div className="sm:col-span-2"><label htmlFor={`content-${targetType}-${targetId}`} className="mb-2 block text-sm font-medium text-slate-700">متن کامنت</label><textarea id={`content-${targetType}-${targetId}`} name="content" required maxLength={2000} rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700" /></div>
          <button type="submit" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white sm:col-span-2">ثبت کامنت</button>
          <p className="text-xs text-slate-500 sm:col-span-2">کامنت پس از تایید مدیر نمایش داده می‌شود.</p>
        </form>
      ) : (
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          برای ثبت کامنت ابتدا وارد حساب کاربری شوید. <Link href="/login" className="font-bold text-slate-950 underline">ورود</Link>
        </div>
      )}
    </section>
  );
}
