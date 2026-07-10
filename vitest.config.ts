import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "src"),
      "@contracts": path.resolve(templateRoot, "contracts"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  // الإعدادات الصارمة لمنع أي شاشات أخطاء (Client أو SSR)
  server: {
    hmr: {
      overlay: false,
    },
  },
  // إيقاف تعليق السيرفر بسبب أخطاء الـ SSR المؤقتة
  ssr: {
    noExternal: true, // يجبر الأكواد على العمل محلياً دون توليد أخطاء روابط خارجية
  },
  test: {
    environment: "node",
    include: ["api/**/*.test.ts", "api/**/*.spec.ts"],
  },
});