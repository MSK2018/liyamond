"use client";

import Image from "next/image";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  { src: "/slider/swiper-1.jpg", title: "طرح‌های منحصر به فرد", text: "انتخاب‌هایی متفاوت برای سبک روزانه شما" },
  { src: "/slider/swiper-2.jpg", title: "زیبایی در هر جزئیات", text: "دسته‌ی تازه و الهام‌ گرفته شده از هنر مدرن" },
  { src: "/slider/swiper-3.jpg", title: "تجربه‌ای تازه از خرید", text: "با کیفیت، ساده و متناسب با سلیقه شما" },
  { src: "/slider/swiper-4.jpg", title: "مجموعه ویژه لیاموند", text: "برای لحظاتی که دوست دارید به خاطر داشته باشید" },
];

export default function FadeSlider() {
  return (
    <section className="fade-slider px-4 py-6 sm:px-6 lg:px-8" aria-label="اسلایدر اصلی">
      <Swiper
        modules={[EffectFade, Navigation, Pagination, Autoplay]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 4500, disableOnInteraction: false }}
        loop
        speed={900}
        className="fade-swiper mx-auto max-w-7xl overflow-hidden rounded-[28px]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.src}>
            <div className="relative aspect-[16/9] min-h-0">
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                priority={index === 0}
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 right-0 max-w-xl p-5 text-right text-white sm:p-10 lg:p-14">
                <p className="mb-2 text-xs font-medium text-white/80 sm:mb-3 sm:text-sm">مجموعه جدید لیاموند</p>
                <h1 className="text-xl font-bold leading-tight sm:text-3xl lg:text-5xl">{slide.title}</h1>
                <p className="mt-2 text-xs text-white/90 sm:mt-4 sm:text-base lg:text-lg">{slide.text}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
