import Link from "next/link";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Payment from "@/models/Payment";
import AccountDashboard from "@/components/AccountDashboard";

export default async function Page() {
  await connection();
  await connectToDatabase();
  const user = await getCurrentUser();
  if (!user) {
    return <main className="mx-auto w-full max-w-md px-4 py-12" dir="rtl"><div className="rounded-2xl border border-slate-200 bg-white p-6 text-center"><p className="text-slate-600">برای مشاهده حساب وارد شوید.</p><Link href="/login" className="mt-4 inline-block rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">ورود</Link></div></main>;
  }

  const [ordersRaw, paymentsRaw] = await Promise.all([
    Order.find({ user: user.id }).sort({ createdAt: -1 }).lean(),
    Payment.find({ user: user.id }).sort({ createdAt: -1 }).lean(),
  ]);

  const orders = ordersRaw.map((order) => ({
    id: order._id.toString(),
    status: order.status,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({ name: item.name, quantity: item.quantity, priceToman: item.priceToman })),
  }));
  const payments = paymentsRaw.map((payment) => ({
    id: payment._id.toString(),
    orderId: payment.order.toString(),
    amount: payment.amount,
    status: payment.status,
    createdAt: payment.createdAt.toISOString(),
  }));

  return <AccountDashboard user={user} orders={orders} payments={payments} />;
}
