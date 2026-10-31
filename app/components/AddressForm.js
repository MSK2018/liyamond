"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { saveAddress, deleteAddress } from "@/app/actions/auth";

const initialState = { error: null };
const emptyAddress = { recipientName: "", mobile: "", province: "", city: "", postalCode: "", address: "" };

export default function AddressForm({ addresses = [], address = null }) {
  const [state, action, pending] = useActionState(saveAddress, initialState);
  const list = addresses.length ? addresses : (address ? [address] : []);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(list.length === 0);

  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.success) { toast.success(state.success); setEditing(null); setAdding(false); }
  }, [state]);

  async function removeAddress(addressId) {
    if (!confirm("آیا این آدرس حذف شود؟")) return;
    const result = await deleteAddress(addressId);
    if (result?.error) toast.error(result.error);
    else toast.success(result.success);
  }

  if (adding || editing) {
    const value = editing ? list.find((item) => item.id === editing) || emptyAddress : emptyAddress;
    return <AddressEditor action={action} pending={pending} value={value} onCancel={() => { setEditing(null); setAdding(false); }} />;
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between gap-3"><h2 className="font-bold text-slate-950">آدرس‌های تحویل</h2><button type="button" onClick={() => setAdding(true)} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">افزودن آدرس جدید</button></div>
      {list.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">هنوز آدرس تحویل ثبت نشده است.</div> : list.map((item, index) => (
        <article key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-2 flex items-center justify-between"><span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600">آدرس {index + 1}</span>{index === 0 && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">آدرس اصلی</span>}</div>
          <div className="text-sm leading-7 text-slate-700"><p className="font-bold text-slate-950">{item.recipientName}</p><p>{item.province}، {item.city}</p><p>{item.address}</p><p>کد پستی: <span dir="ltr">{item.postalCode}</span> — موبایل: <span dir="ltr">{item.mobile}</span></p></div>
          <div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => setEditing(item.id)} className="rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-bold text-slate-700">ویرایش</button><button type="button" onClick={() => removeAddress(item.id)} className="rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-bold text-red-600">حذف</button></div>
        </article>
      ))}
    </div>
  );
}

function AddressEditor({ action, pending, value, onCancel }) {
  return <form action={action} className="mt-6 rounded-xl border border-slate-200 p-4"><input type="hidden" name="addressId" value={value.id || ""} /><h2 className="mb-4 font-bold text-slate-950">{value.id ? "ویرایش آدرس" : "افزودن آدرس جدید"}</h2><div className="grid gap-3 sm:grid-cols-2"><Field label="گیرنده سفارش" name="recipientName" value={value.recipientName} /><Field label="شماره موبایل" name="mobile" value={value.mobile} dir="ltr" inputMode="tel" /><Field label="استان" name="province" value={value.province} /><Field label="شهر" name="city" value={value.city} /><Field label="کد پستی" name="postalCode" value={value.postalCode} dir="ltr" /></div><label className="mt-3 block text-sm font-medium text-slate-700">آدرس دقیق<textarea name="address" required defaultValue={value.address || ""} maxLength={500} rows={3} className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-3 py-3" placeholder="خیابان، پلاک، واحد" /></label><div className="mt-3 grid gap-2 sm:grid-cols-2"><button disabled={pending} className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white disabled:opacity-60">{pending ? "در حال ذخیره..." : value.id ? "ذخیره تغییرات" : "افزودن آدرس"}</button><button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-700">انصراف</button></div></form>;
}

function Field({ label, name, value = "", dir, inputMode }) { return <label className="block text-sm font-medium text-slate-700">{label}<input name={name} defaultValue={value} required maxLength={name === "postalCode" ? 20 : 100} dir={dir} inputMode={inputMode} className={`mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 ${dir === "ltr" ? "text-left" : ""}`} /></label>; }
