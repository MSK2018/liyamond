import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import { createCategory, updateCategory, deleteCategory } from "@/app/admin/actions";
import { ensureMobileCategory } from "@/lib/categories";

export default async function CategoriesPage() {
  await connectToDatabase();
  await ensureMobileCategory();
  const categories = await Category.find().sort({ createdAt: -1 }).lean();

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-950">دسته‌بندی‌ها</h1>
      <form action={createCategory} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <div><label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">نام دسته‌بندی</label><input id="name" name="name" required className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700" /></div>
        <div><label htmlFor="slug" className="mb-2 block text-sm font-medium text-slate-700">Slug</label><input id="slug" name="slug" dir="ltr" placeholder="اختیاری؛ پیش‌فرض نام دسته‌بندی" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-left outline-none focus:border-slate-700" /></div>
        <div><label htmlFor="parent" className="mb-2 block text-sm font-medium text-slate-700">دسته والد</label><select id="parent" name="parent" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-slate-700"><option value="">بدون والد</option>{categories.map((category) => <option key={category._id.toString()} value={category._id.toString()}>{category.name}</option>)}</select></div>
        <div className="sm:col-span-2"><label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">توضیحات</label><textarea id="description" name="description" rows={3} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700" /></div>
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="isActive" defaultChecked /> فعال</label>
        <button type="submit" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">افزودن دسته‌بندی</button>
      </form>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-100 text-slate-600"><tr><th className="p-4">نام</th><th className="p-4">slug</th><th className="p-4">وضعیت</th><th className="p-4">عملیات</th></tr></thead>
            <tbody>{categories.map((category) => {
              const categoryId = category._id.toString();
              const selectedParent = category.parent?.toString() || "";
              return (
                <tr key={categoryId} className="border-t border-slate-100 align-top">
                  <td className="p-4 font-medium">{category.name}</td>
                  <td className="p-4 text-slate-500">{category.slug}</td>
                  <td className="p-4">{category.isActive ? "فعال" : "غیرفعال"}</td>
                  <td className="p-4">
                    <div className="flex items-start gap-2">
                    <details>
                      <summary className="cursor-pointer list-none rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50">ویرایش</summary>
                      <form action={updateCategory} className="mt-3 grid min-w-80 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <input type="hidden" name="id" value={categoryId} />
                        <div><label htmlFor={`name-${categoryId}`} className="mb-1 block text-xs font-medium text-slate-700">نام دسته‌بندی</label><input id={`name-${categoryId}`} name="name" required defaultValue={category.name} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-slate-700" /></div>
                        <div><label htmlFor={`slug-${categoryId}`} className="mb-1 block text-xs font-medium text-slate-700">Slug</label><input id={`slug-${categoryId}`} name="slug" dir="ltr" required defaultValue={category.slug} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left outline-none focus:border-slate-700" /></div>
                        <div><label htmlFor={`parent-${categoryId}`} className="mb-1 block text-xs font-medium text-slate-700">دسته والد</label><select id={`parent-${categoryId}`} name="parent" defaultValue={selectedParent} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"><option value="">بدون والد</option>{categories.filter((option) => option._id.toString() !== categoryId).map((option) => <option key={option._id.toString()} value={option._id.toString()}>{option.name}</option>)}</select></div>
                        <div><label htmlFor={`description-${categoryId}`} className="mb-1 block text-xs font-medium text-slate-700">توضیحات</label><textarea id={`description-${categoryId}`} name="description" rows={3} defaultValue={category.description || ""} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" /></div>
                        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="isActive" defaultChecked={category.isActive} /> فعال</label>
                        <button type="submit" className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-slate-800">ذخیره تغییرات</button>
                      </form>
                    </details>
                    <form action={deleteCategory}><input type="hidden" name="id" value={categoryId} /><button type="submit" className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50">حذف</button></form>
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
        {categories.length === 0 && <p className="p-8 text-center text-slate-500">دسته‌بندی ثبت نشده است.</p>}
      </div>
    </section>
  );
}
