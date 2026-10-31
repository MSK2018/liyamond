import { connectToDatabase } from "@/lib/db";
import Comment from "@/models/Comment";
import { updateCommentStatus, updateComment, deleteComment } from "@/app/admin/actions";

export default async function CommentsPage() {
  await connectToDatabase();
  const comments = await Comment.find().sort({ createdAt: -1 }).lean();

  const statusLabel = { pending: "در انتظار", approved: "تایید شده", rejected: "رد شده" };
  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-950">مدیریت کامنت‌ها</h1>
      <div className="mt-6 space-y-3">
        {comments.map((comment) => (
          <article key={comment._id.toString()} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-slate-950">{comment.authorName}</h2><p className="mt-1 text-xs text-slate-500" dir="ltr">@{comment.username || "—"}</p><p className="mt-1 text-xs text-slate-400">{comment.targetType === "post" ? "پست" : "محصول"}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">{statusLabel[comment.status]}</span></div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{comment.content}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={updateCommentStatus}><input type="hidden" name="id" value={comment._id.toString()} /><input type="hidden" name="status" value="approved" /><button className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white">تایید</button></form>
              <form action={updateCommentStatus}><input type="hidden" name="id" value={comment._id.toString()} /><input type="hidden" name="status" value="rejected" /><button className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-white">رد</button></form>
              <details><summary className="cursor-pointer list-none rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">ویرایش</summary><form action={updateComment} className="mt-3 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:min-w-96 sm:grid-cols-2"><input type="hidden" name="id" value={comment._id.toString()} /><div><label htmlFor={`author-${comment._id}`} className="mb-1 block text-xs font-medium text-slate-700">نام و نام خانوادگی</label><input id={`author-${comment._id}`} name="authorName" required defaultValue={comment.authorName} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" /></div><div><span className="mb-1 block text-xs font-medium text-slate-700">نام کاربری ثبت‌کننده</span><p className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-left text-slate-600" dir="ltr">@{comment.username || "—"}</p></div><div className="sm:col-span-2"><label htmlFor={`content-${comment._id}`} className="mb-1 block text-xs font-medium text-slate-700">متن کامنت</label><textarea id={`content-${comment._id}`} name="content" required maxLength={2000} rows={4} defaultValue={comment.content} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" /></div><div><label htmlFor={`status-${comment._id}`} className="mb-1 block text-xs font-medium text-slate-700">وضعیت</label><select id={`status-${comment._id}`} name="status" defaultValue={comment.status} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="pending">در انتظار</option><option value="approved">تایید شده</option><option value="rejected">رد شده</option></select></div><button type="submit" className="mt-auto rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white">ذخیره تغییرات</button></form></details>
              <form action={deleteComment}><input type="hidden" name="id" value={comment._id.toString()} /><button className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600">حذف</button></form>
            </div>
          </article>
        ))}
        {comments.length === 0 && <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">کامنتی ثبت نشده است.</p>}
      </div>
    </section>
  );
}
