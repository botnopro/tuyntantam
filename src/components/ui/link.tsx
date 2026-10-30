import NextLink from "next/link";
import type { ComponentProps } from "react";

/**
 * Link nội bộ của site (bọc next/link để đổi hành vi chung ở một chỗ).
 * Không gắn transitionTypes: View Transition khiến điều hướng chờ ảnh trang mới (~1 giây) → bấm bị khựng.
 */
export default function Link(props: ComponentProps<typeof NextLink>) {
  return <NextLink {...props} />;
}
