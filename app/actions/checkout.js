"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { getCartItems } from "@/app/actions/cart";
import Cart from "@/models/Cart";
import User from "@/models/User";
import Order from "@/models/Order";
import Payment from "@/models/Payment";

const CART_COOKIE = "liyamond_cart";

export async function placeOrder(formData) {
  await connectToDatabase();
  const items = await getCartItems();
  if (!items.length) return { error: "سبد خرید شما خالی است" };

  const address = {
    recipientName: String(formData.get("recipientName") || "").trim(),
    mobile: String(formData.get("mobile") || "").trim(),
    province: String(formData.get("province") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    postalCode: String(formData.get("postalCode") || "").trim(),
    address: String(formData.get("address") || "").trim(),
  };
  if (Object.values(address).some((value) => !value)) return { error: "لطفاً تمام اطلاعات تحویل را تکمیل کنید" };
  address.mobile = address.mobile.replace(/[^0-9]/g, "");
  if (!/^09\d{9}$/.test(address.mobile)) return { error: "شماره موبایل گیرنده معتبر نیست" };

  const paymentMethod = String(formData.get("paymentMethod") || "online");
  if (paymentMethod !== "online") return { error: "پرداخت در محل فعلاً غیرفعال است" };
  const subtotal = items.reduce((sum, item) => sum + item.priceToman * item.quantity, 0);
  const shippingCost = subtotal >= 1000000000 ? 0 : 150000;
  const user = await getCurrentUser();

  if (user) {
    await User.findByIdAndUpdate(user.id, { address });
  }

  const order = await Order.create({
    user: user?.id || null,
    guestName: user?.name || address.recipientName,
    address,
    items: items.map((item) => ({ product: item.id, name: item.name, image: item.image, priceToman: item.priceToman, quantity: item.quantity })),
    subtotal,
    shippingCost,
    total: subtotal + shippingCost,
    paymentMethod,
    status: "pending",
  });

  await Payment.create({
    user: user?.id || null,
    order: order._id,
    amount: order.total,
    method: "online",
    status: "pending",
  });

  if (user) await Cart.findOneAndUpdate({ user: user.id }, { $set: { items: [] } }, { upsert: true });
  else {
    const cookieStore = await cookies();
    cookieStore.set(CART_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  }

  revalidatePath("/", "layout");
  revalidatePath("/cart");
  revalidatePath("/orders");
  redirect("/orders?success=1");
}
