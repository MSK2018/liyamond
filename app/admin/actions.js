"use server";

import mongoose from "mongoose";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Post from "@/models/Post";
import Comment from "@/models/Comment";
import { getCurrentUser, requireAdmin } from "@/lib/auth";

function slugify(value) {
  return String(value)
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/‌/g, "-")
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function isObjectId(value) {
  return mongoose.Types.ObjectId.isValid(String(value));
}

async function resolveProductCategory(categoryValue) {
  if (!categoryValue) return null;
  if (!isObjectId(categoryValue)) throw new Error("دسته‌بندی نامعتبر است");

  const category = await Category.findOne({ _id: categoryValue, isActive: true }).select("_id").lean();
  if (!category) throw new Error("دسته‌بندی انتخاب‌شده پیدا نشد یا غیرفعال است");
  return category._id;
}

async function saveProductImages(formData) {
  const files = formData.getAll("imageFiles").filter((file) => file && typeof file.arrayBuffer === "function" && file.size > 0);
  if (files.length === 0) return [];
  if (files.length > 5) throw new Error("حداکثر ۵ تصویر برای هر محصول مجاز است");

  const uploadDirectory = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDirectory, { recursive: true });

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  const savedPaths = [];

  for (const file of files) {
    if (!allowedTypes.has(file.type)) throw new Error("فقط فایل‌های JPG، PNG، WEBP یا GIF مجاز هستند");
    if (file.size > 4 * 1024 * 1024) throw new Error("حجم هر تصویر نباید از ۴ مگابایت بیشتر باشد");

    const extension = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "") || ".jpg";
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));
    savedPaths.push(`/uploads/products/${fileName}`);
  }

  return savedPaths;
}

async function savePostCoverImage(formData) {
  const file = formData.get("coverImage");
  if (!file || typeof file.arrayBuffer !== "function" || file.size === 0) return "";

  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  if (!allowedTypes.has(file.type)) throw new Error("فقط فایل‌های JPG، PNG، WEBP یا GIF مجاز هستند");
  if (file.size > 4 * 1024 * 1024) throw new Error("حجم تصویر کاور نباید از ۴ مگابایت بیشتر باشد");

  const uploadDirectory = path.join(process.cwd(), "public", "uploads", "posts");
  await mkdir(uploadDirectory, { recursive: true });
  const extension = path.extname(file.name).toLowerCase().replace(/[^.a-z0-9]/g, "") || ".jpg";
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  await writeFile(path.join(uploadDirectory, fileName), Buffer.from(await file.arrayBuffer()));
  return `/uploads/posts/${fileName}`;
}

async function removeLocalPostImage(image) {
  if (!image?.startsWith("/uploads/posts/")) return;
  await unlink(path.join(process.cwd(), "public", image)).catch(() => {});
}

async function removeLocalProductImages(images) {
  for (const image of images) {
    if (!image?.startsWith("/uploads/products/")) continue;
    const filePath = path.join(process.cwd(), "public", image);
    await unlink(filePath).catch(() => {});
  }
}

export async function createCategory(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const parentValue = String(formData.get("parent") || "");
  const slugValue = String(formData.get("slug") || "").trim();
  const isActive = formData.get("isActive") === "on";
  if (!name) throw new Error("نام دسته‌بندی الزامی است");

  const nextSlug = slugValue ? slugify(slugValue) : slugify(name);
  if (!nextSlug) throw new Error("slug دسته‌بندی معتبر نیست");
  const existingCategory = await Category.findOne({ slug: nextSlug }).select("_id").lean();
  if (existingCategory) throw new Error("این slug قبلاً برای دسته‌بندی دیگری استفاده شده است");

  const parent = parentValue && isObjectId(parentValue) ? parentValue : null;
  await Category.create({ name, description, parent, isActive, slug: nextSlug });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
  redirect("/admin/categories");
}

export async function updateCategory(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const parentValue = String(formData.get("parent") || "");
  const slugValue = String(formData.get("slug") || "").trim();
  const isActive = formData.get("isActive") === "on";

  if (!isObjectId(id)) throw new Error("شناسه دسته‌بندی نامعتبر است");
  if (!name) throw new Error("نام دسته‌بندی الزامی است");

  const category = await Category.findById(id);
  if (!category) throw new Error("دسته‌بندی پیدا نشد");

  let parent = null;
  if (parentValue) {
    if (!isObjectId(parentValue)) throw new Error("دسته والد نامعتبر است");
    if (parentValue === id) throw new Error("دسته‌بندی نمی‌تواند والد خودش باشد");

    const visited = new Set([id]);
    let currentParentId = parentValue;
    while (currentParentId) {
      if (visited.has(currentParentId)) throw new Error("انتخاب دسته والد باعث ایجاد حلقه در سلسله‌مراتب می‌شود");
      visited.add(currentParentId);
      const currentParent = await Category.findById(currentParentId).select("parent").lean();
      if (!currentParent) throw new Error("دسته والد پیدا نشد");
      currentParentId = currentParent.parent?.toString() || null;
    }
    parent = parentValue;
  }

  const nextSlug = slugValue ? slugify(slugValue) : slugify(name);
  if (!nextSlug) throw new Error("slug دسته‌بندی معتبر نیست");
  const slugOwner = await Category.findOne({ slug: nextSlug, _id: { $ne: id } }).select("_id").lean();
  if (slugOwner) throw new Error("دسته‌بندی با این نام قبلاً ثبت شده است");

  category.name = name;
  category.slug = nextSlug;
  category.description = description;
  category.parent = parent;
  category.isActive = isActive;
  await category.save();

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/categories");
}

export async function deleteCategory(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const id = String(formData.get("id") || "");
  if (!isObjectId(id)) throw new Error("شناسه دسته‌بندی نامعتبر است");
  await Product.updateMany({ category: id }, { $set: { category: null } });
  await Category.updateMany({ parent: id }, { $set: { parent: null } });
  await Category.findByIdAndDelete(id);
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function createProduct(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const categoryValue = String(formData.get("category") || "");
  const priceToman = Number(formData.get("priceToman"));
  const stock = Number(formData.get("stock"));

  if (!name || !Number.isSafeInteger(priceToman) || priceToman < 0) {
    throw new Error("نام و قیمت معتبر وارد کنید");
  }
  if (!Number.isSafeInteger(stock) || stock < 0) throw new Error("موجودی معتبر وارد کنید");

  const category = await resolveProductCategory(categoryValue);
  const uploadedImages = await saveProductImages(formData);

  await Product.create({
    name,
    slug: slugify(name),
    description,
    images: uploadedImages,
    category,
    priceToman,
    stock,
    isActive: formData.get("isActive") === "on",
  });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProduct(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const id = String(formData.get("id") || "");
  if (!isObjectId(id)) throw new Error("شناسه محصول نامعتبر است");

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const categoryValue = String(formData.get("category") || "");
  const priceToman = Number(formData.get("priceToman"));
  const stock = Number(formData.get("stock"));
  if (!name || !Number.isSafeInteger(priceToman) || priceToman < 0) {
    throw new Error("نام و قیمت معتبر وارد کنید");
  }
  if (!Number.isSafeInteger(stock) || stock < 0) throw new Error("موجودی معتبر وارد کنید");

  const product = await Product.findById(id);
  if (!product) throw new Error("محصول پیدا نشد");

  const category = await resolveProductCategory(categoryValue);
  const uploadedImages = await saveProductImages(formData);
  const nextImages = uploadedImages.length > 0 ? uploadedImages : product.images;

  if (uploadedImages.length > 0) await removeLocalProductImages(product.images);

  product.name = name;
  product.slug = slugify(name);
  product.description = description;
  product.images = nextImages;
  product.category = category;
  product.priceToman = priceToman;
  product.stock = stock;
  product.isActive = formData.get("isActive") === "on";
  await product.save();

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function deleteProduct(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const id = String(formData.get("id") || "");
  if (!isObjectId(id)) throw new Error("شناسه محصول نامعتبر است");
  const product = await Product.findById(id);
  if (!product) return;
  await removeLocalProductImages(product.images);
  await Product.findByIdAndDelete(id);
  await Comment.deleteMany({ targetType: "product", targetId: id });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function createPost(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const title = String(formData.get("title") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const slugValue = String(formData.get("slug") || "").trim();
  const author = String(formData.get("author") || "مدیر").trim();
  if (!title || !content) throw new Error("عنوان و متن پست الزامی است");

  const nextSlug = slugValue ? slugify(slugValue) : slugify(title);
  if (!nextSlug) throw new Error("Slug پست معتبر نیست");
  const existingPostSlug = await Post.findOne({ slug: nextSlug }).select("_id").lean();
  if (existingPostSlug) throw new Error("پستی با این Slug قبلاً ثبت شده است");

  const coverImage = await savePostCoverImage(formData);
  await Post.create({
    title,
    slug: nextSlug,
    excerpt,
    content,
    coverImage,
    author,
    isPublished: formData.get("isPublished") === "on",
  });
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
  redirect("/admin/posts");
}

export async function updatePost(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const id = String(formData.get("id") || "");
  if (!isObjectId(id)) throw new Error("شناسه پست نامعتبر است");

  const title = String(formData.get("title") || "").trim();
  const slugValue = String(formData.get("slug") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const author = String(formData.get("author") || "مدیر").trim();
  if (!title || !content) throw new Error("عنوان و متن پست الزامی است");

  const nextSlug = slugValue ? slugify(slugValue) : slugify(title);
  if (!nextSlug) throw new Error("Slug پست معتبر نیست");
  const existingPostSlug = await Post.findOne({ slug: nextSlug, _id: { $ne: id } }).select("_id").lean();
  if (existingPostSlug) throw new Error("پستی با این Slug قبلاً ثبت شده است");

  const post = await Post.findById(id);
  if (!post) throw new Error("پست پیدا نشد");
  const previousSlug = post.slug;

  const uploadedCover = await savePostCoverImage(formData);
  if (uploadedCover) await removeLocalPostImage(post.coverImage);

  post.title = title;
  post.slug = nextSlug;
  post.excerpt = excerpt;
  post.content = content;
  post.author = author;
  post.coverImage = uploadedCover || post.coverImage;
  post.isPublished = formData.get("isPublished") === "on";
  await post.save();

  revalidatePath("/admin/posts");
  revalidatePath(`/blog/${previousSlug}`);
  revalidatePath(`/blog/${nextSlug}`);
  revalidatePath("/blog");
  redirect("/admin/posts");
}

export async function deletePost(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const id = String(formData.get("id") || "");
  if (!isObjectId(id)) throw new Error("شناسه پست نامعتبر است");
  const post = await Post.findById(id);
  if (!post) return;
  await removeLocalPostImage(post.coverImage);
  await Post.findByIdAndDelete(id);
  await Comment.deleteMany({ targetType: "post", targetId: id });
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
}

export async function createComment(formData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("برای ثبت کامنت باید وارد حساب کاربری شوید");
  await connectToDatabase();
  const authorName = String(formData.get("authorName") || user.name).trim();
  const username = user.username;
  const content = String(formData.get("content") || "").trim();
  const targetType = String(formData.get("targetType") || "");
  const targetId = String(formData.get("targetId") || "");

  if (!authorName || !username || !content) throw new Error("نام، نام کاربری و متن کامنت الزامی است");
  if (content.length > 2000) throw new Error("متن کامنت نباید بیشتر از ۲۰۰۰ کاراکتر باشد");
  if (!["post", "product"].includes(targetType) || !isObjectId(targetId)) throw new Error("مورد کامنت نامعتبر است");

  if (targetType === "post") {
    if (!(await Post.exists({ _id: targetId }))) throw new Error("پست پیدا نشد");
  } else if (!(await Product.exists({ _id: targetId }))) {
    throw new Error("محصول پیدا نشد");
  }

  await Comment.create({
    authorName,
    username,
    email: user.email || undefined,
    content,
    targetType,
    targetId,
    status: "pending",
  });
  revalidatePath("/admin/comments");
  if (targetType === "post") {
    const post = await Post.findById(targetId).select("slug").lean();
    if (post) revalidatePath(`/blog/${post.slug}`);
  } else {
    const product = await Product.findById(targetId).select("slug").lean();
    if (product) revalidatePath(`/shop/${product.slug}`);
  }
}

export async function updateComment(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const id = String(formData.get("id") || "");
  const authorName = String(formData.get("authorName") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const status = String(formData.get("status") || "pending");

  if (!isObjectId(id)) throw new Error("شناسه کامنت نامعتبر است");
  if (!authorName || !content) throw new Error("نام و متن کامنت الزامی است");
  if (!["pending", "approved", "rejected"].includes(status)) throw new Error("وضعیت کامنت نامعتبر است");

  await Comment.findByIdAndUpdate(id, { authorName, content, status });
  revalidatePath("/admin/comments");
  revalidatePath("/blog");
  revalidatePath("/shop");
}

export async function updateCommentStatus(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!isObjectId(id) || !["pending", "approved", "rejected"].includes(status)) {
    throw new Error("اطلاعات کامنت نامعتبر است");
  }
  await Comment.findByIdAndUpdate(id, { status });
  revalidatePath("/admin/comments");
}

export async function deleteComment(formData) {
  if (!(await requireAdmin())) throw new Error("دسترسی مدیریت الزامی است");
  await connectToDatabase();
  const id = String(formData.get("id") || "");
  if (!isObjectId(id)) throw new Error("شناسه کامنت نامعتبر است");
  await Comment.findByIdAndDelete(id);
  revalidatePath("/admin/comments");
}
