import Link from "next/link";
import { connection } from "next/server";
import { getCartItems, removeFromCart } from "@/app/actions/cart";
import CartQuantityControl from "@/components/CartQuantityControl";

export default async function Page() {
  await connection();
  const items = await getCartItems();
  const total = items.reduce((sum, item) => sum + item.priceToman * item.quantity, 0);
  const formatter = new Intl.NumberFormat("fa-IR");

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8" dir="rtl">
      <div className="mb-7">
        <h1 className="text-3xl font-bold text-slate-950">سبد خرید</h1>
        <p className="mt-2 text-sm text-slate-500">{items.length ? `${formatter.format(items.length)} محصول در سبد شماست` : "سبد خرید شما خالی است"}</p>
      </div>

      {items.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current stroke-[1.5]"><path strokeLinecap="round" strokeLinejoin="round" d="M2.5 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4l1.5-6.4H6.1M9 21h.01M17 21h.01" /></svg>
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">هنوز محصولی به سبد اضافه نکرده‌اید</h2>
          <Link href="/shop" className="mt-5 inline-flex rounded-xl bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800">مشاهده محصولات</Link>
        </section>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            {items.map((item) => (
              <article key={item.id} className="flex gap-4 border-b border-slate-100 p-4 last:border-b-0 sm:gap-6 sm:p-5">
                <Link href={`/shop/${item.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-28 sm:w-28">
                  {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-slate-400">تصویر ندارد</div>}
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/shop/${item.slug}`} className="line-clamp-2 font-bold text-slate-950 hover:text-slate-700">{item.name}</Link>
                    <form action={async () => { "use server"; await removeFromCart(item.id); }}>
                      <button type="submit" className="cursor-pointer rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50">حذف</button>
                    </form>
                  </div>
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                    <CartQuantityControl
                      productId={item.id}
                      initialQuantity={item.quantity}
                      stock={item.stock}
                    />
                    <p className="text-base font-bold text-slate-950">{formatter.format(item.priceToman * item.quantity)} تومان</p>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
            <h2 className="text-lg font-bold text-slate-950">خلاصه سفارش</h2>
            <div className="mt-5 space-y-3 border-b border-slate-100 pb-5 text-sm">
              <div className="flex justify-between text-slate-600"><span>مجموع محصولات</span><span>{formatter.format(total)} تومان</span></div>
              <div className="flex justify-between text-slate-600"><span>هزینه ارسال</span><span>محاسبه در مرحله بعد</span></div>
            </div>
            <div className="mt-5 flex items-center justify-between"><span className="font-bold text-slate-800">مبلغ قابل پرداخت</span><span className="text-lg font-bold text-slate-950">{formatter.format(total)} تومان</span></div>
            <Link href="/checkout" className="mt-6 flex w-full items-center justify-center rounded-xl bg-slate-950 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800">ادامه فرآیند خرید</Link>
          </aside>
        </div>
      )}
    </main>
  );
}
