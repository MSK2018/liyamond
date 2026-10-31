"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { placeOrder } from "@/app/actions/checkout";

const initialState = { error: null };
const emptyAddress = { recipientName: "", mobile: "", province: "", city: "", postalCode: "", address: "" };

export default function CheckoutForm({ savedAddress, savedAddresses = [], items, subtotal, shippingCost, total }) {
  const addresses = savedAddresses.length ? savedAddresses : (savedAddress ? [savedAddress] : []);
  const [state, action, pending] = useActionState(placeOrder, initialState);
  const [selectedIndex, setSelectedIndex] = useState(addresses.length ? 0 : -1);
  const [address, setAddress] = useState(addresses[0] || emptyAddress);
  const [editing, setEditing] = useState(addresses.length === 0);
  const formatter = new Intl.NumberFormat("fa-IR");

  useEffect(() => { if (state?.error) toast.error(state.error); }, [state]);

  function update(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  function selectAddress(index) {
    setSelectedIndex(index);
    setAddress(addresses[index]);
    setEditing(false);
  }

  return (
    <form action={action} className="grid items-start gap-6 lg:grid-cols-[1fr_360px]" dir="rtl">
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div><span className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">۱</span><h2 className="inline font-bold text-slate-950">آدرس تحویل</h2></div>
            {savedAddress && !editing && <button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">ویرایش آدرس</button>}
          </div>

          {addresses.length > 0 && !editing && <div className="mb-4 grid gap-3">{addresses.map((item, index) => <label key={item.id} className={`cursor-pointer rounded-xl border p-4 transition ${selectedIndex === index ? "border-slate-950 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}><span className="flex items-start gap-3"><input type="radio" name="selectedAddress" checked={selectedIndex === index} onChange={() => selectAddress(index)} className="mt-1 accent-slate-950" /><span className="flex-1"><span className="block font-bold text-slate-950">{item.recipientName}</span><span className="mt-1 block text-sm leading-7 text-slate-600">{item.province}، {item.city} — {item.address}<br />کد پستی: {item.postalCode} — موبایل: <span dir="ltr">{item.mobile}</span></span></span></span></label>)}</div>}

          {!editing && addresses.length > 0 ? <>
            <input type="hidden" name="recipientName" value={address.recipientName || ""} /><input type="hidden" name="mobile" value={address.mobile || ""} /><input type="hidden" name="province" value={address.province || ""} /><input type="hidden" name="city" value={address.city || ""} /><input type="hidden" name="postalCode" value={address.postalCode || ""} /><input type="hidden" name="address" value={address.address || ""} />
            <div className="flex flex-wrap gap-2"><button type="button" onClick={() => setEditing(true)} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">ویرایش آدرس انتخاب‌شده</button><button type="button" onClick={() => { setSelectedIndex(-1); setAddress(emptyAddress); setEditing(true); }} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700">آدرس جدید</button></div>
          </> : <div>
            {addresses.length > 0 && <button type="button" onClick={() => setEditing(false)} className="mb-4 text-sm font-bold text-slate-600 hover:text-slate-950">بازگشت به انتخاب آدرس‌ها</button>}
            <div className="grid gap-4 sm:grid-cols-2">
              <CheckoutField label="نام گیرنده" name="recipientName" value={address.recipientName} onChange={update} required />
              <CheckoutField label="شماره موبایل" name="mobile" value={address.mobile} onChange={update} dir="ltr" required />
              <CheckoutField label="استان" name="province" value={address.province} onChange={update} required />
              <CheckoutField label="شهر" name="city" value={address.city} onChange={update} required />
              <CheckoutField label="کد پستی" name="postalCode" value={address.postalCode} onChange={update} dir="ltr" required />
            </div>
            <label className="mt-4 block text-sm font-medium text-slate-700">آدرس دقیق<textarea name="address" required maxLength={500} rows={3} value={address.address} onChange={(event) => update("address", event.target.value)} className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-3 py-3 outline-none focus:border-slate-500" placeholder="خیابان، کوچه، پلاک، واحد" /></label>
          </div>}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="mb-5"><span className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">۲</span><h2 className="inline font-bold text-slate-950">روش پرداخت</h2></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <PaymentOption value="cod" title="پرداخت در محل" description="این روش فعلاً غیرفعال است" disabled />
            <PaymentOption value="online" title="پرداخت اینترنتی" description="پرداخت آنلاین به‌صورت امن" defaultChecked />
          </div>
        </section>
      </div>
      <aside className="rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-24">
        <h2 className="text-lg font-bold text-slate-950">خلاصه سفارش</h2>
        <div className="mt-4 max-h-48 space-y-3 overflow-y-auto border-b border-slate-100 pb-4">
          {items.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 text-sm"><span className="line-clamp-1 text-slate-700">{item.name} × {formatter.format(item.quantity)}</span><span className="shrink-0 font-bold text-slate-900">{formatter.format(item.priceToman * item.quantity)} تومان</span></div>)}
        </div>
        <div className="mt-4 space-y-3 text-sm"><div className="flex justify-between text-slate-600"><span>مجموع کالاها</span><span>{formatter.format(subtotal)} تومان</span></div><div className="flex justify-between text-slate-600"><span>هزینه ارسال</span><span>{shippingCost === 0 ? "رایگان" : `${formatter.format(shippingCost)} تومان`}</span></div></div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5"><span className="font-bold text-slate-800">مبلغ قابل پرداخت</span><span className="text-lg font-bold text-slate-950">{formatter.format(total)} تومان</span></div>
        <button type="submit" disabled={pending} className="mt-6 w-full rounded-xl bg-slate-950 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">{pending ? "در حال ثبت سفارش..." : "ثبت سفارش"}</button>
      </aside>
    </form>
  );
}

function CheckoutField({ label, name, value, onChange, dir, required }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input name={name} value={value || ""} onChange={(event) => onChange(name, event.target.value)} required={required} dir={dir} className={`mt-2 h-12 w-full rounded-xl border border-slate-300 px-3 outline-none focus:border-slate-500 ${dir === "ltr" ? "text-left" : ""}`} /></label>;
}

function PaymentOption({ value, title, description, defaultChecked, disabled = false }) {
  return <label className={`rounded-xl border border-slate-200 p-4 transition has-[:checked]:border-slate-950 has-[:checked]:bg-slate-50 ${disabled ? "cursor-not-allowed bg-slate-50 opacity-50" : "cursor-pointer"}`}><span className="flex items-start gap-3"><input type="radio" name="paymentMethod" value={value} defaultChecked={defaultChecked} disabled={disabled} className="mt-1 accent-slate-950" /><span><span className="block font-bold text-slate-950">{title}</span><span className="mt-1 block text-xs text-slate-500">{description}</span></span></span></label>;
}
