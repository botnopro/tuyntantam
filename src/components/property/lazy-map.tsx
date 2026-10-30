"use client";

import dynamic from "next/dynamic";
import type { MapPoint } from "./property-map";

// Leaflet cần window → chỉ nạp ở client, khi thực sự có bản đồ
export const LazyMap = dynamic(() => import("./property-map"), {
  ssr: false,
  loading: () => <div className="h-[420px] w-full animate-pulse rounded-lg bg-surface-dim" aria-hidden />,
});

export type { MapPoint };
