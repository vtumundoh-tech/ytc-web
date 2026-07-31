import { UAParser } from "ua-parser-js";
import type { NextRequest } from "next/server";

export type RequestMeta = {
  ip: string;
  userAgent: string;
  browser: string;
  os: string;
  deviceType: string;
};

export function getRequestMeta(req: NextRequest): RequestMeta {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const userAgent = req.headers.get("user-agent") || "";

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  const browser = result.browser.name || "";
  const os = result.os.name || "";
  const deviceType = result.device.type
    ? result.device.type.charAt(0).toUpperCase() + result.device.type.slice(1)
    : "Desktop";

  return { ip, userAgent, browser, os, deviceType };
}
