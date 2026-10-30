/**
 * Bản đồ Google Maps theo địa chỉ đã lưu (không cần toạ độ / API key).
 * Cả khung là một link: bấm vào bản đồ mở thẳng Google Maps tại địa chỉ đó.
 */
export function AddressMap({ address, height = 360 }: { address: string; height?: number }) {
  const q = encodeURIComponent(address);
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${q}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Mở Google Maps: ${address}`}
      className="block cursor-pointer overflow-hidden rounded-lg bg-surface-dim"
      style={{ height }}
    >
      <iframe
        src={`https://www.google.com/maps?q=${q}&hl=vi&z=16&output=embed`}
        title={`Bản đồ: ${address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        tabIndex={-1}
        // Chặn tương tác trong iframe để cú bấm rơi vào link bao ngoài; đẩy lên để giấu thẻ "Mở trong Maps" của Google
        className="pointer-events-none -mt-[72px] h-[calc(100%+72px)] w-full border-0"
      />
    </a>
  );
}
