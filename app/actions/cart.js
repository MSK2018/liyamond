"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Cart from "@/models/Cart";
import User from "@/models/User";
import Product from "@/models/Product";

const CART_COOKIE = "liyamond_cart";

async function readGuestCart() {
  const cookieStore = await cookies();
  const value = cookieStore.get(CART_COOKIE)?.value;
  if (!value) return [];
  try {
    const cart = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return Array.isArray(cart) ? cart.filter((item) => item?.productId && Number.isInteger(item.quantity) && item.quantity > 0) : [];
  } catch {
    return [];
  }
}

async function loadUserCart(userId) {
  const found = await Cart.findOne({ user: userId }).select("items").lean();
  if (found) return found.items || [];

  const legacyUser = await User.findById(userId).select("cart").lean();
  const legacyItems = (legacyUser?.cart || []).map((item) => ({
    product: item.product.toString(),
    quantity: item.quantity,
  }));
  if (legacyItems.length > 0) {
    await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: legacyItems } },
      { upsert: true, new: true },
    );
  }
  return legacyItems;
}

async function writeGuestCart(cart) {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, Buffer.from(JSON.stringify(cart)).toString("base64url"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getCartCount() {
  const user = await getCurrentUser();
  if (user) {
    await connectToDatabase();
    const items = await loadUserCart(user.id);
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }
  return (await readGuestCart()).reduce((sum, item) => sum + item.quantity, 0);
}

export async function getCartItems() {
  await connectToDatabase();
  const user = await getCurrentUser();
  let cart;
  if (user) {
    const items = await loadUserCart(user.id);
    cart = items.map((item) => ({ productId: item.product.toString(), quantity: item.quantity }));
  } else {
    cart = await readGuestCart();
  }

  const ids = cart.map((item) => item.productId);
  const products = ids.length ? await Product.find({ _id: { $in: ids }, isActive: true }).lean() : [];
  const byId = new Map(products.map((product) => [product._id.toString(), product]));
  return cart.flatMap((item) => {
    const product = byId.get(item.productId);
    if (!product) return [];
    return [{
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || "",
      priceToman: product.priceToman,
      stock: product.stock,
      quantity: Math.min(item.quantity, Math.max(product.stock, 0)),
    }];
  }).filter((item) => item.quantity > 0);
}

export async function addToCart(productId, quantity = 1) {
  await connectToDatabase();
  const product = await Product.findOne({ _id: productId, isActive: true }).select("stock").lean();
  if (!product || product.stock < 1) return { error: "این محصول در حال حاضر ناموجود است" }; 
  const amount = Math.max(1, Math.min(Number(quantity) || 1, product.stock));

  const user = await getCurrentUser();
  if (user) {
    const items = await loadUserCart(user.id);
    const cart = items.map((item) => ({ product: item.product.toString(), quantity: item.quantity }));
    const guestCart = await readGuestCart();
    for (const guestItem of guestCart) {
      const existing = cart.find((item) => item.product === guestItem.productId);
      if (existing) existing.quantity = Math.min(existing.quantity + guestItem.quantity, 999);
      else cart.push({ product: guestItem.productId, quantity: guestItem.quantity });
    }
    const existing = cart.find((item) => item.product === String(productId));
    if (existing) existing.quantity = Math.min(existing.quantity + amount, product.stock);
    else cart.push({ product: String(productId), quantity: amount });
    await Cart.findOneAndUpdate(
      { user: user.id },
      { $set: { items: cart.map((item) => ({ product: item.product, quantity: item.quantity })) } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    await writeGuestCart([]);
  } else {
    const cart = await readGuestCart();
    const existing = cart.find((item) => item.productId === String(productId));
    if (existing) existing.quantity = Math.min(existing.quantity + amount, product.stock);
    else cart.push({ productId: String(productId), quantity: amount });
    await writeGuestCart(cart);
  }

  revalidatePath("/", "layout");
  revalidatePath("/cart");
  return { success: "محصول به سبد خرید اضافه شد" };
}

export async function updateCartQuantity(productId, quantity) {
  await connectToDatabase();
  const product = await Product.findOne({ _id: productId, isActive: true }).select("stock").lean();
  if (!product) return { error: "محصول یافت نشد" };
  const amount = Math.max(1, Math.min(Number(quantity) || 1, product.stock));
  const user = await getCurrentUser();
  if (user) {
    const items = await loadUserCart(user.id);
    const cart = items.map((item) => ({ product: item.product.toString(), quantity: item.quantity }));
    const item = cart.find((entry) => entry.product === String(productId));
    if (item) item.quantity = amount;
    await Cart.findOneAndUpdate(
      { user: user.id },
      { $set: { items: cart.map((entry) => ({ product: entry.product, quantity: entry.quantity })) } },
      { upsert: true, new: true },
    );
  } else {
    const cart = await readGuestCart();
    const item = cart.find((entry) => entry.productId === String(productId));
    if (item) item.quantity = amount;
    await writeGuestCart(cart);
  }
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(productId) {
  const user = await getCurrentUser();
  if (user) {
    await connectToDatabase();
    const items = await loadUserCart(user.id);
    const cart = items.filter((item) => item.product.toString() !== String(productId));
    await Cart.findOneAndUpdate(
      { user: user.id },
      { $set: { items: cart.map((item) => ({ product: item.product.toString(), quantity: item.quantity })) } },
      { upsert: true, new: true },
    );
  } else {
    const cart = (await readGuestCart()).filter((item) => item.productId !== String(productId));
    await writeGuestCart(cart);
  }
  revalidatePath("/", "layout");
  revalidatePath("/cart");
  return { success: true };
}
