// Cache Components yêu cầu generateStaticParams trả ít nhất 1 param; khi DB trống (vd. chưa seed lúc build)
// dùng param giữ chỗ — trang sẽ notFound() vì không có bản ghi nào trùng slug này
export const PLACEHOLDER_SLUG = "__chua-co-noi-dung__";

export function slugParams(slugs: string[]): { slug: string }[] {
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: PLACEHOLDER_SLUG }];
}
