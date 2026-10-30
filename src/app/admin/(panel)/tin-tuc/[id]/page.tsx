import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePostAction } from "@/app/admin/actions";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { AdminHeader } from "@/components/admin/shell";
import { requireRole } from "@/lib/auth/guard";
import { postPath } from "@/lib/content/routes";
import { uuidSchema } from "@/lib/validation/common";
import { adminGetPost, allCategoriesForAdmin } from "@/server/admin/posts";
import { getSettings } from "@/server/settings";
import { PostForm } from "../post-form";

export const metadata = { title: "Sửa bài viết" };

export default async function EditPost(props: PageProps<"/admin/tin-tuc/[id]">) {
  const user = await requireRole("EDITOR");
  const id = uuidSchema.safeParse((await props.params).id);
  const [post, categories, agent] = await Promise.all([
    id.success ? adminGetPost(id.data) : null,
    allCategoriesForAdmin(),
    getSettings("agent"),
  ]);
  if (!post) notFound();
  return (
    <>
      <AdminHeader
        title="Sửa bài viết"
        actions={
          <>
            {post.status === "published" ? (
              <Link href={postPath(post.slug)} target="_blank" className="btn-ghost border border-border-subtle py-2">
                <ExternalLink className="size-4" aria-hidden /> Xem trên web
              </Link>
            ) : null}
            {user.role === "ADMIN" ? (
              <form action={deletePostAction}>
                <input type="hidden" name="id" value={post.id} />
                <ConfirmSubmit message="Xoá vĩnh viễn bài viết này?" />
              </form>
            ) : null}
          </>
        }
      />
      <PostForm post={post} categories={categories} defaultAuthor={agent.alias} />
    </>
  );
}
