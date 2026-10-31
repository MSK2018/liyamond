"use client";

import { useRouter } from "next/navigation";
import { useEffect, useTransition, useState } from "react";
import { toast } from "sonner";
import { updateCartQuantity } from "@/app/actions/cart";

export default function CartQuantityControl({ productId, initialQuantity, stock }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState(initialQuantity);
  const formatter = new Intl.NumberFormat("fa-IR");
  const max = Math.max(1, stock);

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  function changeQuantity(nextQuantity) {
    const amount = Math.max(1, Math.min(nextQuantity, max));
    if (amount === quantity) return;
    setQuantity(amount);
    startTransition(async () => {
      const result = await updateCartQuantity(productId, amount);
      if (result?.error) {
        toast.error(result.error);
        setQuantity(initialQuantity);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center gap-2" dir="rtl">
      <span className="ml-1 text-xs text-slate-500">تعداد</span>
      <div className="flex h-11 items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          aria-label="افزایش تعداد"
          disabled={pending || quantity >= max}
          onClick={() => changeQuantity(quantity + 1)}
          className="flex h-full w-11 cursor-pointer items-center justify-center text-xl font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          +
        </button>
        <output aria-live="polite" className="flex h-full min-w-12 items-center justify-center border-x border-slate-200 px-3 text-sm font-bold text-slate-950">
          {formatter.format(quantity)}
        </output>
        <button
          type="button"
          aria-label="کاهش تعداد"
          disabled={pending || quantity <= 1}
          onClick={() => changeQuantity(quantity - 1)}
          className="flex h-full w-11 cursor-pointer items-center justify-center text-xl font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
        >
          −
        </button>
      </div>
    </div>
  );
}
