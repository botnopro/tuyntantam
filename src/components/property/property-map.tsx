"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

export type MapPoint = { slug: string; title: string; lat: number; lng: number; price: string };

/** Bản đồ Leaflet + OpenStreetMap (không cần API key). Marker dạng nhãn giá. */
export default function PropertyMap({ points, height = 520, zoom = 13 }: { points: MapPoint[]; height?: number; zoom?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !points.length) return;
    const map = L.map(ref.current, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const markers = points.map((p) => {
      const icon = L.divIcon({
        className: "",
        html: `<span style="display:inline-block;white-space:nowrap;transform:translate(-50%,-100%);background:var(--color-brand-strong);color:#fff;font:700 12px/1 var(--font-be-vietnam),sans-serif;padding:6px 8px;border-radius:4px;box-shadow:0 4px 10px rgba(15,23,42,.25)">${escapeHtml(p.price)}</span>`,
      });
      const link = document.createElement("a");
      link.href = `/kho-nguon/${encodeURIComponent(p.slug)}`;
      link.textContent = p.title;
      link.style.fontWeight = "600";
      return L.marker([p.lat, p.lng], { icon, title: p.title, keyboard: true }).bindPopup(link).addTo(map);
    });

    if (points.length === 1) map.setView([points[0]!.lat, points[0]!.lng], zoom);
    else map.fitBounds(L.featureGroup(markers).getBounds().pad(0.15));

    return () => {
      map.remove();
    };
  }, [points, zoom]);

  return (
    <div
      ref={ref}
      style={{ height }}
      className="z-0 w-full overflow-hidden rounded-lg bg-surface-dim"
      role="region"
      aria-label="Bản đồ vị trí bất động sản"
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
