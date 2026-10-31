"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { addToCart } from "@/app/actions/cart";

export default function AddToCartButton({ productId, stock, className = "" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isUnavailable = Number(stock) < 1;

  return (
    <button
      type="button"
      disabled={pending || isUnavailable}
      onClick={() => startTransition(async () => {
        const result = await addToCart(productId);
        if (result?.error) toast.error(result.error);
        else {
          toast.success(result.success);
          router.refresh();
        }
      })}
      className={`flex w-full cursor-pointer items-center justify-center rounded-xl bg-slate-950 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}
    >
      {isUnavailable ? "ناموجود" : pending ? "در حال افزودن..." : "افزودن به سبد خرید"}
    </button>
  );
}
