import Link from "next/link";
import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { createProduct, deleteProduct } from "@/app/admin/actions";
import { ensureMobileCategory } from "@/lib/categories";

export default async function ProductsPage() {
  await connectToDatabase();
  const mobileCategory = await ensureMobileCategory();
  const [categories, products] = await Promise.all([
    Category.find({ isActive: true }).sort({ name: 1 }).lean(),
    Product.find().populate("category", "name").sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <section>
      <h1 className="text-2xl font-bold text-slate-950">محصول‌ها</h1>
      <form action={createProduct} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <Field label="نام محصول" name="name" required />
        <div><label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-700">دسته‌بندی</label><select id="category" name="category" defaultValue={mobileCategory._id.toString()} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5"><option value="">بدون دسته</option>{categories.map((category) => <option key={category._id.toString()} value={category._id.toString()}>{category.name}</option>)}</select></div>
        <Field label="قیمت به تومان" name="priceToman" type="number" required min="0" />
        <Field label="موجودی" name="stock" type="number" required min="0" defaultValue="0" />
        <div className="md:col-span-2"><label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">توضیحات</label><textarea id="description" name="description" rows={4} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></div>
        <div className="md:col-span-2"><label htmlFor="imageFiles" className="mb-2 block text-sm font-medium text-slate-700">تصاویر محصول</label><input id="imageFiles" name="imageFiles" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 file:ml-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700" /><p className="mt-2 text-xs text-slate-500">حداکثر ۵ تصویر؛ هر فایل حداکثر ۴ مگابایت.</p></div>
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="isActive" defaultChecked /> منتشر شود</label>
        <button type="submit" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">افزودن محصول</button>
      </form>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full text-right text-sm"><thead className="bg-slate-100 text-slate-600"><tr><th className="p-4">نام</th><th className="p-4">دسته</th><th className="p-4">قیمت</th><th className="p-4">موجودی</th><th className="p-4">وضعیت</th><th className="p-4">عملیات</th></tr></thead><tbody>{products.map((product) => <tr key={product._id.toString()} className="border-t border-slate-100"><td className="p-4 font-medium">{product.name}</td><td className="p-4">{product.category?.name || "—"}</td><td className="p-4">{new Intl.NumberFormat("fa-IR").format(product.priceToman)} تومان</td><td className="p-4">{product.stock}</td><td className="p-4">{product.isActive ? "منتشر شده" : "پیش‌نویس"}</td><td className="p-4"><div className="flex gap-2"><Link href={`/admin/products/${product._id.toString()}`} className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-50">ویرایش</Link><form action={deleteProduct}><input type="hidden" name="id" value={product._id.toString()} /><button className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50">حذف</button></form></div></td></tr>)}</tbody></table></div>{products.length === 0 && <p className="p-8 text-center text-slate-500">محصولی ثبت نشده است.</p>}</div>    </section>
  );
}

function Field({ label, name, type = "text", ...props }) {
  return <div><label htmlFor={name} className="mb-2 block text-sm font-medium text-slate-700">{label}</label><input id={name} name={name} type={type} {...props} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700" /></div>;
}
