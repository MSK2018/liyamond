"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { login, register, updateProfileName, updateProfileInfo } from "@/app/actions/auth";

const initialState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);
  useEffect(() => { if (state?.error) toast.error(state.error); }, [state]);
  return (
    <form action={action} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-950">ورود به حساب کاربری</h1>
      <div className="mt-6"><label htmlFor="login-username" className="mb-2 block text-sm font-medium">نام کاربری</label><input id="login-username" name="username" required dir="ltr" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-left" /></div>
      <div className="mt-4"><label htmlFor="login-password" className="mb-2 block text-sm font-medium">رمز عبور</label><input id="login-password" name="password" type="password" required className="w-full rounded-xl border border-slate-300 px-3 py-3" /></div>
      <button disabled={pending} className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? "در حال ورود..." : "ورود"}</button>
      <p className="mt-4 text-center text-sm text-slate-600">حساب ندارید؟ <Link href="/register" className="font-bold text-slate-950 underline">ثبت‌نام</Link></p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, initialState);
  useEffect(() => { if (state?.error) toast.error(state.error); }, [state]);
  return (
    <form action={action} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-950">ساخت حساب کاربری</h1>
      <div className="mt-6"><label htmlFor="register-name" className="mb-2 block text-sm font-medium">نام و نام خانوادگی</label><input id="register-name" name="name" required maxLength={100} className="w-full rounded-xl border border-slate-300 px-3 py-3" /></div>
      <div className="mt-4"><label htmlFor="register-username" className="mb-2 block text-sm font-medium">نام کاربری</label><input id="register-username" name="username" required maxLength={100} pattern="[A-Za-z0-9_-]{3,100}" dir="ltr" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-left" /></div>
      <div className="mt-4"><label htmlFor="register-email" className="mb-2 block text-sm font-medium">ایمیل</label><input id="register-email" name="email" type="email" required maxLength={160} dir="ltr" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-left" /></div>
      <div className="mt-4"><label htmlFor="register-mobile" className="mb-2 block text-sm font-medium">شماره موبایل</label><input id="register-mobile" name="mobile" type="tel" required inputMode="numeric" pattern="(?:09[0-9]{9}|\+98[0-9]{10}|0098[0-9]{10}|98[0-9]{10})" placeholder="09123456789" dir="ltr" className="w-full rounded-xl border border-slate-300 px-3 py-3 text-left" /></div>
      <div className="mt-4"><label htmlFor="register-password" className="mb-2 block text-sm font-medium">رمز عبور</label><input id="register-password" name="password" type="password" required minLength={8} maxLength={128} pattern="(?=.*[A-Za-z])(?=.*[0-9]).{8,128}" title="رمز عبور باید حداقل ۸ کاراکتر و شامل حرف و عدد باشد" className="w-full rounded-xl border border-slate-300 px-3 py-3" /><p className="mt-2 text-xs text-slate-500">حداقل ۸ کاراکتر، شامل حداقل یک حرف و یک عدد</p></div>
      <div className="mt-4"><label htmlFor="register-confirm-password" className="mb-2 block text-sm font-medium">تکرار رمز عبور</label><input id="register-confirm-password" name="confirmPassword" type="password" required minLength={8} maxLength={128} className="w-full rounded-xl border border-slate-300 px-3 py-3" /></div>
      <button disabled={pending} className="mt-6 w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? "در حال ثبت‌نام..." : "ثبت‌نام"}</button>
      <p className="mt-4 text-center text-sm text-slate-600">قبلاً حساب دارید؟ <Link href="/login" className="font-bold text-slate-950 underline">ورود</Link></p>
    </form>
  );
}

export function ProfileInfoForm({ user }) {
  const [state, action, pending] = useActionState(updateProfileInfo, initialState);
  useEffect(() => { if (state?.error) toast.error(state.error); if (state?.success) toast.success(state.success); }, [state]);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-medium text-slate-700">نام و نام خانوادگی<input name="name" required maxLength={100} defaultValue={user.name} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3" /></label>
      <label className="text-sm font-medium text-slate-700">نام کاربری<input readOnly value={`@${user.username}`} dir="ltr" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left text-slate-500" /></label>
      <label className="text-sm font-medium text-slate-700">ایمیل<input name="email" type="email" required maxLength={160} defaultValue={user.email} dir="ltr" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 text-left" /></label>
      <label className="text-sm font-medium text-slate-700">شماره موبایل<input name="mobile" required maxLength={20} defaultValue={user.mobile} dir="ltr" inputMode="numeric" className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 text-left" /></label>
      <button disabled={pending} type="submit" className="sm:col-span-2 mt-1 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? "در حال ذخیره..." : "ذخیره اطلاعات"}</button>
    </form>
  );
}

export function ProfileNameForm({ name }) {
  const [state, action, pending] = useActionState(updateProfileName, initialState);
  useEffect(() => { if (state?.error) toast.error(state.error); if (state?.success) toast.success(state.success); }, [state]);
  return (
    <form action={action} className="mt-6 border-t border-slate-200 pt-6">
      <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-slate-700">نام کاربر</label>
      <input id="profile-name" name="name" required maxLength={100} defaultValue={name} className="w-full rounded-xl border border-slate-300 px-3 py-3" />
      <button disabled={pending} type="submit" className="mt-3 w-full rounded-xl bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? "در حال ذخیره..." : "ذخیره نام"}</button>
    </form>
  );
}
