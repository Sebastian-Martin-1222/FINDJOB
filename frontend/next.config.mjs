/** @type {import('next').NextConfig} */
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://findjob-api-audit-2k2ft2tdxq-uc.a.run.app/api/v1";
let apiOrigin = "https://findjob-api-audit-2k2ft2tdxq-uc.a.run.app";
try { apiOrigin = new URL(apiUrl).origin; } catch { /* El cliente API valida la ruta en runtime. */ }
const isProduction = process.env.NODE_ENV === "production";
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}`,
  "img-src 'self' data: blob: https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
      ],
    }];
  },
};
export default nextConfig;
