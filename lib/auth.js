import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

const SESSION_COOKIE = "liyamond_session";

function secret() {
  return process.env.AUTH_SECRET || "liyamond-development-secret-change-me";
}

export function signSession(userId) {
  const payload = Buffer.from(`${userId}:${Date.now()}`).toString("base64url");
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifySession(value) {
  if (!value) return null;
  const [payload, signature, extra] = value.split(".");
  if (!payload || !signature || extra) return null;
  const expected = createHmac("sha256", secret()).update(payload).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

  try {
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    const separator = decoded.lastIndexOf(":");
    if (separator <= 0) return null;
    return decoded.slice(0, separator);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE)?.value;
  const userId = verifySession(session);
  if (!userId) return null;

  await connectToDatabase();
  const user = await User.findOne({ _id: userId }).lean();
  if (!user) return null;
  const role = user.role === "admin" || user.username === "admin" ? "admin" : "user";
  const normalizeAddress = (item, index = 0) => item ? {
    id: item._id ? item._id.toString() : item.id || `legacy-${index}`,
    recipientName: String(item.recipientName || ""),
    mobile: String(item.mobile || ""),
    province: String(item.province || ""),
    city: String(item.city || ""),
    postalCode: String(item.postalCode || ""),
    address: String(item.address || ""),
  } : null;
  const addresses = Array.isArray(user.addresses) && user.addresses.length
    ? user.addresses.map((item, index) => normalizeAddress(item, index)).filter(Boolean)
    : (user.address ? [normalizeAddress(user.address)].filter(Boolean) : []);
  const address = addresses[0] || null;
  return { id: user._id.toString(), name: user.name, username: user.username, email: user.email || "", mobile: user.mobile || "", address, addresses, role };
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export { SESSION_COOKIE };
