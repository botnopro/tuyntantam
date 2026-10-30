export const THEME_STORAGE_KEY = "theme";

/** Chạy trong <head> trước khi vẽ trang để không nháy nền sáng: lựa chọn đã lưu, nếu không có thì theo hệ điều hành. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;
