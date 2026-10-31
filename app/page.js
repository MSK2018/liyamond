import { connection } from "next/server";
import FadeSlider from "@/components/FadeSlider";
import ProductCarousel from "@/components/ProductCarousel";
import BlogCarousel from "@/components/BlogCarousel";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Post from "@/models/Post";

export default async function Page() {
  await connection();
  await connectToDatabase();

  const latestProducts = await Product.find({ isActive: true })
    .select("name slug description images priceToman stock")
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  const latestPosts = await Post.find({ isPublished: true })
    .select("title slug excerpt coverImage author createdAt")
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();

  const products = latestProducts.map((product) => ({
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    description: product.description || "",
    image: product.images?.[0] || "",
    priceToman: product.priceToman,
    stock: product.stock,
  }));

  const posts = latestPosts.map((post) => ({
    id: post._id.toString(),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    coverImage: post.coverImage || "",
    author: post.author || "مدیر",
    createdAt: post.createdAt?.toISOString?.() || "",
  }));

  return (
    <>
      <FadeSlider />
      <ProductCarousel products={products} />
      <BlogCarousel posts={posts} />
    </>
  );
}
