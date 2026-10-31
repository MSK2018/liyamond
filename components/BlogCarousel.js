"use client";

import Link from "next/link";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

export default function BlogCarousel({ posts }) {
  if (posts.length === 0) return null;

  return (
    <section className="blog-carousel mx-auto w-full max-w-7xl px-4 pb-14 pt-3 sm:px-6 lg:px-8" dir="rtl" aria-labelledby="featured-posts-title">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 id="featured-posts-title" className="text-xl font-bold text-slate-950 sm:text-2xl">آخرین مطالب وبلاگ</h2>
        <Link href="/blog" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">مشاهده همه پست‌ها</Link>
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
        className="blog-swiper !pb-1"
      >
        {posts.map((post) => (
          <SwiperSlide key={post.id} className="!h-auto">
            <Link href={`/blog/${encodeURIComponent(post.slug)}`} className="group block h-full overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">
              <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">تصویری ندارد</div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500">{post.author} · {post.createdAt ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(new Date(post.createdAt)) : ""}</p>
                <h3 className="mt-3 line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-950">{post.title}</h3>
                {post.excerpt && <p className="mt-2 line-clamp-3 min-h-[5.25rem] text-sm leading-7 text-slate-500">{post.excerpt}</p>}
                <span className="mt-4 inline-block text-sm font-bold text-slate-800">ادامه مطلب ←</span>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
