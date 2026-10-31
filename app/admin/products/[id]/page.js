import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { updateProduct } from "@/app/admin/actions";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  if (!mongoose.Types.ObjectId.isValid(id)) notFound();

  await connectToDatabase();
  const [product, categories] = await Promise.all([
    Product.findById(id).lean(),
    Category.find({ isActive: true }).sort({ name: 1 }).lean(),
  ]);
  if (!product) notFound();

  const selectedCategory = product.category?.toString() || "";

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-950">ویرایش محصول</h1>
        <Link href="/admin/products" className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">بازگشت به محصولات</Link>
      </div>

      <form action={updateProduct} className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
        <input type="hidden" name="id" value={product._id.toString()} />
        <Field label="نام محصول" name="name" required defaultValue={product.name} />
        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium text-slate-700">دسته‌بندی</label>
          <select id="category" name="category" defaultValue={selectedCategory} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5">
            <option value="">بدون دسته</option>
            {categories.map((category) => <option key={category._id.toString()} value={category._id.toString()}>{category.name}</option>)}
          </select>
        </div>
        <Field label="قیمت به تومان" name="priceToman" type="number" required min="0" defaultValue={product.priceToman} />
        <Field label="موجودی" name="stock" type="number" required min="0" defaultValue={product.stock} />
        <div className="md:col-span-2"><label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">توضیحات</label><textarea id="description" name="description" rows={4} defaultValue={product.description || ""} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" /></div>

        <div className="md:col-span-2">
          <p className="mb-2 text-sm font-medium text-slate-700">تصاویر فعلی</p>
          {product.images?.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {product.images.map((image) => <img key={image} src={image} alt={product.name} className="aspect-square w-full rounded-xl border border-slate-200 object-cover" />)}
            </div>
          ) : <p className="text-sm text-slate-500">تصویری ثبت نشده است.</p>}
        </div>
        <div className="md:col-span-2"><label htmlFor="imageFiles" className="mb-2 block text-sm font-medium text-slate-700">افزودن یا جایگزینی تصاویر</label><input id="imageFiles" name="imageFiles" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-600 file:ml-4 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-slate-700" /><p className="mt-2 text-xs text-slate-500">اگر فایل جدید انتخاب کنید، تصاویر قبلی جایگزین می‌شوند. انتخاب نکردن فایل، تصاویر فعلی را حفظ می‌کند.</p></div>
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="isActive" defaultChecked={product.isActive} /> منتشر شود</label>
        <button type="submit" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800">ذخیره تغییرات</button>
      </form>
    </section>
  );
}

function Field({ label, name, type = "text", ...props }) {
  return <div><label htmlFor={name} className="mb-2 block text-sm font-medium text-slate-700">{label}</label><input id={name} name={name} type={type} {...props} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-slate-700" /></div>;
}
