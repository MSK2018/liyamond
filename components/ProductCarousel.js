"use client";

import Link from "next/link";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addToCart } from "@/app/actions/cart";
import "swiper/css";
import "swiper/css/navigation";

function AddButton({ product }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <div className="px-4 pb-4">
      <button
        type="button"
        disabled={pending || product.stock < 1}
        onClick={() => startTransition(async () => {
          const result = await addToCart(product.id);
          if (result?.error) toast.error(result.error);
          else {
            toast.success(result.success);
            router.refresh();
          }
        })}
        className="flex w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {product.stock < 1 ? "ناموجود" : pending ? "در حال افزودن..." : "افزودن به سبد خرید"}
      </button>
    </div>
  );
}

export default function ProductCarousel({ products }) {
  if (products.length === 0) return null;

  return (
    <section className="product-carousel mx-auto w-full max-w-7xl px-4 pb-12 pt-3 sm:px-6 lg:px-8" dir="rtl" aria-labelledby="featured-products-title">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="featured-products-title" className="text-xl font-bold text-slate-950 sm:text-2xl">
          محصولات منتخب
        </h2>
        <Link href="/shop" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">
          مشاهده همه محصولات
        </Link>
      </div>

      <Swiper
        modules={[Navigation]}
        navigation
        slidesPerView={1}
        slidesPerGroup={1}
        spaceBetween={16}
        speed={500}
        grabCursor
        breakpoints={{
          640: { slidesPerView: 2, spaceBetween: 16 },
          768: { slidesPerView: 3, spaceBetween: 18 },
          1024: { slidesPerView: 4, spaceBetween: 20 },
        }}
        className="product-swiper !pb-1"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="!h-auto">
            <article className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
              <Link href={`/shop/${product.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-slate-100">
                  {product.image ? (
                    <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">تصویری ندارد</div>
                  )}
                  {product.stock === 0 && <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">ناموجود</span>}
                </div>
                <div className="p-4 pb-3">
                  <h3 className="line-clamp-1 text-base font-bold text-slate-950">{product.name}</h3>
                  {product.description && <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{product.description}</p>}
                  <p className="mt-4 text-left text-base font-bold text-slate-950">{new Intl.NumberFormat("fa-IR").format(product.priceToman)} تومان</p>
                </div>
              </Link>
              <AddButton product={product} />
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
