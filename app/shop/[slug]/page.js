import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Comments from "@/app/components/Comments";

export default async function Page({ params }) {
  await connection();
  const { slug } = await params;
  await connectToDatabase();

  let requestedSlug = String(slug || "");
  try {
    requestedSlug = decodeURIComponent(requestedSlug);
  } catch {}
  requestedSlug = normalizeProductSlug(requestedSlug);

  let product = await Product.findOne({ slug: requestedSlug, isActive: true }).lean();

  if (!product) {
    const activeSlugs = await Product.find({ isActive: true }).select("slug").lean();
    const matchedSlug = activeSlugs.find((item) => normalizeProductSlug(item.slug) === requestedSlug)?.slug;
    if (matchedSlug) product = await Product.findOne({ slug: matchedSlug, isActive: true }).lean();
  }
  if (!product) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
      <Link href="/shop" className="text-sm font-medium text-slate-600 hover:text-slate-950">→ بازگشت به فروشگاه</Link>
      <article className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="aspect-[16/9] w-full object-cover" /> : <div className="flex aspect-[16/9] items-center justify-center bg-slate-100 text-slate-500">تصویر محصول</div>}
        <div className="p-5 sm:p-8">
          <h1 className="text-3xl font-bold text-slate-950">{product.name}</h1>
          {product.description && <p className="mt-4 whitespace-pre-line leading-8 text-slate-700">{product.description}</p>}
          <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-200 pt-5"><p className="text-xl font-bold text-slate-950">{new Intl.NumberFormat("fa-IR").format(product.priceToman)} تومان</p><p className="text-sm text-slate-600">{product.stock > 0 ? "موجود" : "ناموجود"}</p></div>
        </div>
      </article>
      <Comments targetType="product" targetId={product._id.toString()} />
    </main>
  );
}

function normalizeProductSlug(value) {
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
