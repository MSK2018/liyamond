import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";

export async function ensureMobileCategory() {
  await connectToDatabase();

  return Category.findOneAndUpdate(
    { slug: "mobile" },
    {
      $setOnInsert: {
        name: "موبایل",
        slug: "mobile",
        description: "محصولات موبایل",
        parent: null,
        isActive: true,
      },
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  ).lean();
}
