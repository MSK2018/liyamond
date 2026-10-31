"use client";

import { useState } from "react";

function slugify(value) {
  return String(value)
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/‌/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export default function PostForm({ action, post = null }) {
  const isEdit = Boolean(post);
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [slugEdited, setSlugEdited] = useState(isEdit);

  function handleTitleChange(event) {
    const nextTitle = event.target.value;
    setTitle(nextTitle);
    if (!slugEdited) setSlug(slugify(nextTitle));
  }

  return (
    <form action={action} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
      {isEdit && <input type="hidden" name="id" value={String(post._id)} />}
      <div><label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700">عنوان پست</label><input id="title" name="title" required value={title} onChange={handleTitleChange} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700" /></div>
      <div><label htmlFor="slug" className="mb-2 block text-sm font-medium text-slate-700">Slug</label><input id="slug" name="slug" required={isEdit} dir="ltr" value={slug} onChange={(event) => { setSlug(slugify(event.target.value)); setSlugEdited(true); }} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-left outline-none focus:border-slate-700" /><p className="mt-1 text-xs text-slate-500">نسخه‌ی URL؛ برای ایجاد پست هنگام تغییر عنوان به‌طور خودکار ساخته می‌شود.</p></div>
      <div><label htmlFor="author" className="mb-2 block text-sm font-medium text-slate-700">نویسنده</label><input id="author" name="author" defaultValue={post?.author || "مدیر"} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700" /></div>
      <div className="md:col-span-2"><label htmlFor="excerpt" className="mb-2 block text-sm font-medium text-slate-700">خلاصه</label><textarea id="excerpt" name="excerpt" rows={2} maxLength={500} defaultValue={post?.excerpt || ""} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></div>
      <div className="md:col-span-2"><label htmlFor="content" className="mb-2 block text-sm font-medium text-slate-700">متن پست</label><textarea id="content" name="content" rows={10} required defaultValue={post?.content || ""} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></div>
      <div><label htmlFor="coverImage" className="mb-2 block text-sm font-medium text-slate-700">تصویر کاور</label><input id="coverImage" name="coverImage" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 file:ml-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700" />{isEdit && post.coverImage && <img src={post.coverImage} alt="تصویر فعلی کاور" className="mt-3 aspect-video w-48 rounded-lg object-cover" />}<p className="mt-2 text-xs text-slate-500">حداکثر ۴ مگابایت؛ JPG، PNG، WEBP یا GIF. انتخاب نکردن فایل در ویرایش، تصویر قبلی را حفظ می‌کند.</p></div>
      <label className="flex items-center gap-2 text-sm text-slate-700 md:self-end"><input type="checkbox" name="isPublished" defaultChecked={post?.isPublished || false} /> منتشر شود</label>
      <button type="submit" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 md:col-span-2">{isEdit ? "ذخیره تغییرات" : "افزودن پست"}</button>
    </form>
  );
}
