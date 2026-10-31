"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

async function mergeGuestCartAfterLogin(userId, cookieStore) {
  const value = cookieStore.get("liyamond_cart")?.value;
  if (!value) return;
  let guestCart;
  try {
    guestCart = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    guestCart = [];
  }
  if (!Array.isArray(guestCart) || guestCart.length === 0) return;

  const found = await Cart.findOne({ user: userId }).select("items").lean();
  const items = (found?.items || []).map((item) => ({ product: item.product.toString(), quantity: item.quantity }));
  for (const guestItem of guestCart) {
    if (!guestItem?.productId || !Number.isInteger(guestItem.quantity) || guestItem.quantity < 1) continue;
    const product = await Product.findOne({ _id: guestItem.productId, isActive: true }).select("stock").lean();
    if (!product || product.stock < 1) continue;
    const existing = items.find((item) => item.product === String(guestItem.productId));
    if (existing) existing.quantity = Math.min(existing.quantity + guestItem.quantity, product.stock, 999);
    else items.push({ product: String(guestItem.productId), quantity: Math.min(guestItem.quantity, product.stock) });
  }
  await Cart.findOneAndUpdate({ user: userId }, { $set: { items } }, { upsert: true, new: true });
  cookieStore.set("liyamond_cart", "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}
import { SESSION_COOKIE, signSession, getCurrentUser } from "@/lib/auth";

export async function register(previousState, formData) {
  await connectToDatabase();
  const name = String(formData.get("name") || "").trim();
  const username = String(formData.get("username") || "").trim().toLowerCase().replace(/^@/, "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  let mobile = String(formData.get("mobile") || "").trim().replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  if (!name || !username || !email || !mobile || !password || !confirmPassword) return { error: "تمام فیلدهای ثبت‌نام الزامی هستند" }; 
  if (!/^[a-z0-9_-]{3,100}$/i.test(username)) return { error: "نام کاربری فقط می‌تواند شامل حروف انگلیسی، عدد، - و _ باشد" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "آدرس ایمیل معتبر نیست" };
  mobile = mobile.replace(/[^\d+]/g, "");
  if (mobile.startsWith("0098")) mobile = `0${mobile.slice(4)}`;
  else if (mobile.startsWith("+98")) mobile = `0${mobile.slice(3)}`;
  else if (mobile.startsWith("98") && mobile.length === 12) mobile = `0${mobile.slice(2)}`;
  if (!/^09\d{9}$/.test(mobile)) return { error: "شماره موبایل باید یک شماره معتبر ایرانی مانند 09123456789 باشد" };
  if (password.length < 8 || password.length > 128) return { error: "رمز عبور باید بین ۸ تا ۱۲۸ کاراکتر باشد" };
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) return { error: "رمز عبور باید شامل حداقل یک حرف و یک عدد باشد" };
  if (password !== confirmPassword) return { error: "تکرار رمز عبور با رمز عبور برابر نیست" };

  const existingUser = await User.findOne({ $or: [{ username }, { email }, { mobile }] }).select("username email mobile").lean();
  if (existingUser) {
    if (existingUser.username === username) return { error: "این نام کاربری قبلاً ثبت شده است" };
    if (existingUser.email === email) return { error: "این ایمیل قبلاً ثبت شده است" };
    if (existingUser.mobile === mobile) return { error: "این شماره موبایل قبلاً ثبت شده است" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  let user;
  try {
    user = await User.create({ name, username, email, mobile, passwordHash });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      if (field === "username") return { error: "این نام کاربری قبلاً ثبت شده است" };
      if (field === "email") return { error: "این ایمیل قبلاً ثبت شده است" };
      if (field === "mobile") return { error: "این شماره موبایل قبلاً ثبت شده است" };
    }
    return { error: "ثبت‌نام انجام نشد. لطفاً دوباره تلاش کنید." };
  }
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signSession(user._id.toString()), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  await mergeGuestCartAfterLogin(user._id.toString(), cookieStore);
  revalidatePath("/", "layout");
  redirect("/account");
}

export async function login(previousState, formData) {
  await connectToDatabase();
  const username = String(formData.get("username") || "").trim().toLowerCase().replace(/^@/, "");
  const password = String(formData.get("password") || "");
  if (!username || !password) return { error: "نام کاربری و رمز عبور الزامی است" };

  const user = await User.findOne({ username }).lean();
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return { error: "نام کاربری یا رمز عبور اشتباه است" };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, signSession(user._id.toString()), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  await mergeGuestCartAfterLogin(user._id.toString(), cookieStore);
  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfileName(previousState, formData) {
  const user = await getCurrentUser();
  if (!user) return { error: "ابتدا وارد حساب کاربری شوید" };

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "نام کاربر الزامی است" };
  if (name.length > 100) return { error: "نام نباید بیشتر از ۱۰۰ کاراکتر باشد" };

  await connectToDatabase();
  await User.findByIdAndUpdate(user.id, { name });
  revalidatePath("/", "layout");
  return { success: "نام کاربری با موفقیت ذخیره شد" };
}

export async function updateProfileInfo(previousState, formData) {
  const user = await getCurrentUser();
  if (!user) return { error: "ابتدا وارد حساب کاربری شوید" };
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  let mobile = String(formData.get("mobile") || "").trim();
  mobile = mobile.replace(/[^0-9]/g, "");
  if (!name) return { error: "نام و نام خانوادگی الزامی است" };
  if (name.length > 100) return { error: "نام نباید بیشتر از ۱۰۰ کاراکتر باشد" };
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "ایمیل معتبر وارد کنید" };
  if (!/^09\d{9}$/.test(mobile)) return { error: "شماره موبایل باید ۱۱ رقم و معتبر باشد" };
  await connectToDatabase();
  const duplicate = await User.findOne({ $or: [{ email }, { mobile }], _id: { $ne: user.id } }).select("email mobile").lean();
  if (duplicate) {
    if (duplicate.email === email) return { error: "این ایمیل قبلاً استفاده شده است" };
    return { error: "این شماره موبایل قبلاً استفاده شده است" };
  }
  await User.findByIdAndUpdate(user.id, { name, email, mobile });
  revalidatePath("/account", "layout");
  return { success: "اطلاعات کاربری با موفقیت ذخیره شد" };
}

export async function saveAddress(previousState, formData) {
  const user = await getCurrentUser();
  if (!user) return { error: "ابتدا وارد حساب کاربری شوید" };
  const addressId = String(formData.get("addressId") || "");
  const address = {
    recipientName: String(formData.get("recipientName") || "").trim(),
    mobile: String(formData.get("mobile") || "").trim().replace(/[^0-9]/g, ""),
    province: String(formData.get("province") || "").trim(),
    city: String(formData.get("city") || "").trim(),
    postalCode: String(formData.get("postalCode") || "").trim(),
    address: String(formData.get("address") || "").trim(),
  };
  if (Object.values(address).some((value) => !value)) return { error: "تمام اطلاعات آدرس الزامی است" };
  if (!/^09\d{9}$/.test(address.mobile)) return { error: "شماره موبایل معتبر نیست" };

  await connectToDatabase();
  if (addressId && !addressId.startsWith("legacy-")) {
    await User.findOneAndUpdate(
      { _id: user.id, "addresses._id": addressId },
      { $set: {
          "addresses.$.recipientName": address.recipientName,
          "addresses.$.mobile": address.mobile,
          "addresses.$.province": address.province,
          "addresses.$.city": address.city,
          "addresses.$.postalCode": address.postalCode,
          "addresses.$.address": address.address,
          address,
        } },
    );
  } else {
    await User.findOneAndUpdate(
      { _id: user.id },
      { $push: { addresses: address }, $set: { address } },
    );
  }
  revalidatePath("/account", "layout");
  revalidatePath("/checkout");
  return { success: addressId ? "آدرس با موفقیت ویرایش شد" : "آدرس جدید با موفقیت افزوده شد" };
}

export async function deleteAddress(addressId) {
  const user = await getCurrentUser();
  if (!user) return { error: "ابتدا وارد حساب کاربری شوید" };
  await connectToDatabase();
  if (addressId && !String(addressId).startsWith("legacy-")) {
    await User.findByIdAndUpdate(user.id, { $pull: { addresses: { _id: addressId } } });
    const updated = await User.findById(user.id).lean();
    await User.findByIdAndUpdate(user.id, { $set: { address: updated?.addresses?.[0] || null } });
  } else {
    await User.findByIdAndUpdate(user.id, { $set: { address: null, addresses: [] } });
  }
  revalidatePath("/account", "layout");
  revalidatePath("/checkout");
  return { success: "آدرس حذف شد" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  revalidatePath("/", "layout");
  redirect("/login");
}
