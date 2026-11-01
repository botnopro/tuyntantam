"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="vi">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          display: "grid",
          placeItems: "center",
          minHeight: "100vh",
          margin: 0,
          background: "#f5f7fa",
          color: "#253246",
        }}
      >
        <div style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28 }}>Đã có lỗi xảy ra</h1>
          <p style={{ color: "#5d6a7e" }}>Vui lòng tải lại trang sau ít phút.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              padding: "12px 20px",
              background: "#0068ff",
              color: "#fff",
              border: 0,
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
