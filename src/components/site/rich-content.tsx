import { LeadForm } from "@/components/forms/lead-form";
import { splitFormMarkers } from "@/lib/content/html";
import { optimizeContentImages } from "@/lib/content/images";
import { sanitizeRichText } from "@/lib/security/sanitize";
import { cn } from "@/lib/utils/cn";

// Form gốc trên tuyntantam.com → biến thể form lead tương ứng
const FORM_MAP: Record<string, { interest?: "hoc-moi-gioi" | "hop-tac"; submitLabel?: string }> = {
  "home-contact": {},
  "lien-he-hop-tac-contact": { interest: "hop-tac" },
  "moi-gioi-dang-ki": { interest: "hoc-moi-gioi", submitLabel: "Đăng ký làm môi giới" },
  "donate-message": {},
};

/**
 * Render nội dung rich text. HTML được sanitize lại tại đây (phòng thủ nhiều lớp),
 * marker form được thay bằng form lead thật.
 */
export function RichContent({ html, className, sanitized = false }: { html: string; className?: string; sanitized?: boolean }) {
  const safe = sanitized ? html : sanitizeRichText(html);
  // Tối ưu ảnh sau khi sanitize (srcset/sizes do mình sinh, không lấy từ dữ liệu)
  const segments = splitFormMarkers(optimizeContentImages(safe));
  return (
    <div className={cn("prose-content", className)}>
      {segments.map((seg, i) =>
        seg.kind === "html" ? (
          <div key={i} className="contents" dangerouslySetInnerHTML={{ __html: seg.html }} />
        ) : FORM_MAP[seg.formId] ? (
          <div key={i} className="not-prose my-8 rounded-lg bg-surface-card p-6 shadow-form sm:p-8">
            <LeadForm defaultInterest={FORM_MAP[seg.formId]!.interest} submitLabel={FORM_MAP[seg.formId]!.submitLabel} />
          </div>
        ) : null,
      )}
    </div>
  );
}
