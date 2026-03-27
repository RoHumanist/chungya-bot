import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "chungya-alimi",
  brand: {
    displayName: "청약알리미",
    primaryColor: "#3182F6",
    icon: "", // 콘솔 업로드 후 URL 교체
  },
  web: {
    host: "localhost",
    port: 3001,
    commands: {
      dev: "next dev -p 3001",
      build: "next build",
    },
  },
  permissions: [],
});
