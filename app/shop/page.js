import Link from "next/link";
import { connection } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import AddToCartButton from "@/components/AddToCartButton";

export default async function Page() {
  await connection();
  await connectToDatabase();

  const products = await Product.find({ isActive: true })
    .select("name slug description images priceToman stock")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">فروشگاه</h1>
        <p className="mt-2 text-sm text-gray-600">
          محصولات فروشگاه لیاموند
        </p>
      </header>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-600">
          هنوز محصولی برای نمایش ثبت نشده است.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <li
              key={product._id.toString()}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href={`/shop/${encodeURIComponent(product.slug)}`} className="block">
                {product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div
                    aria-hidden="true"
                    className="flex aspect-square items-center justify-center bg-gray-100 text-sm text-gray-500"
                  >
                    تصویر محصول
                  </div>
                )}
                <div className="p-4 pb-3">
                  <h2 className="font-semibold">{product.name}</h2>
                  {product.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {product.description}
                    </p>
                  )}
                  <p className="mt-4 font-bold">
                    {new Intl.NumberFormat("fa-IR").format(product.priceToman)}{" "}
                    تومان
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {product.stock > 0 ? "موجود" : "ناموجود"}
                  </p>
                </div>
              </Link>
              <div className="px-4 pb-4">
                <AddToCartButton productId={product._id.toString()} stock={product.stock} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
