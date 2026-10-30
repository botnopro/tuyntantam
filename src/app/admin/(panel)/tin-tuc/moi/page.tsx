import { AdminHeader } from "@/components/admin/shell";
import { allCategoriesForAdmin } from "@/server/admin/posts";
import { getSettings } from "@/server/settings";
import { PostForm } from "../post-form";
import { requireAdminPage } from "@/lib/auth/guard";

export const metadata = { title: "Viết bài mới" };

export default async function NewPost() {
  await requireAdminPage();
  const [categories, agent] = await Promise.all([allCategoriesForAdmin(), getSettings("agent")]);
  return (
    <>
      <AdminHeader title="Viết bài mới" />
      <PostForm categories={categories} defaultAuthor={agent.alias} />
    </>
  );
}
