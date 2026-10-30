// Nhãn nhu cầu trong form liên hệ (dùng cả client và server — không import zod ở đây)
export const LEAD_INTERESTS = {
  "thue-nha": "Tôi cần thuê nhà",
  "cho-thue": "Tôi có nhà cần cho thuê",
  "ban-nha": "Tôi có nhà cần bán",
  "mua-nha": "Tôi cần mua nhà",
  "hoc-moi-gioi": "Tôi muốn học / làm môi giới",
  "dau-tu": "Tư vấn đầu tư",
  "hop-tac": "Hợp tác",
  khac: "Khác",
} as const;

export type LeadInterest = keyof typeof LEAD_INTERESTS;
